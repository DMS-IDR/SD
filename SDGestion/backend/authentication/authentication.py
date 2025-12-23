from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client, Client
import os
from django.conf import settings
from django.contrib.auth.models import User

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Token prefix missing')

        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")
        
        if not url or not key:
             # Fail open or closed depending on preference, but for now specific error
             raise AuthenticationFailed('Server misconfiguration: Supabase credentials missing')
        
        supabase: Client = create_client(url, key)

        try:
            user_data = supabase.auth.get_user(token)
            if not user_data or not user_data.user:
                raise AuthenticationFailed('Invalid token')
            
            # Get email from Supabase user
            email = user_data.user.email
            supabase_user_id = user_data.user.id
            
            # Get or create local user to map to Django's auth system
            # We use the email as username since Supabase guarantees uniqueness there usually
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            
            # Fetch extra profile info from Supabase 'profiles' table
            try:
                # IMPORTANT: We must authenticate the request to bypass RLS policies
                # that restrict access to "own profile only".
                supabase.postgrest.auth(token)
                profile_res = supabase.table('profiles').select('*').eq('id', supabase_user_id).single().execute()
                
                if profile_res.data:
                    user.company = profile_res.data.get('company')
                    user.role = profile_res.data.get('role')
                else:
                    # If data is empty (no permissions found or RLS blocking)
                    print(f"No profile found for user {email}")
                    user.company = None
                    user.role = None
            except Exception as profile_err:
                print(f"Profile fetch error for {email}: {profile_err}")
                user.company = None
                user.role = None
            
            # Fetch UserProfile from local database for permissions
            try:
                from users.models import UserProfile
                user_profile = UserProfile.objects.get(supabase_user_id=supabase_user_id)
                
                # Attach permissions to request for easy access in views
                request.user_profile = user_profile
                request.user_role = user_profile.role
                request.user_company = user_profile.company
                request.user_permissions = {
                    'can_view_reports': user_profile.can_view_reports,
                    'can_view_user_management': user_profile.can_view_user_management,
                }
            except UserProfile.DoesNotExist:
                # User exists in Supabase but not in local DB
                # This is okay for now, they just won't have extended permissions
                request.user_profile = None
                request.user_role = getattr(user, 'role', None)
                request.user_company = getattr(user, 'company', None)
                request.user_permissions = {
                    'can_view_reports': False,
                    'can_view_user_management': False,
                }
            except Exception as e:
                print(f"Error fetching UserProfile: {e}")
                request.user_profile = None
                request.user_role = None
                request.user_company = None
                request.user_permissions = {}
            
            # Also attach user_id for convenience
            request.user_id = supabase_user_id
            
            return (user, None)
            
        except Exception as e:
            raise AuthenticationFailed(f'Token validation error: {str(e)}')

