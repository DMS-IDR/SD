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
            
            # Get or create local user to map to Django's auth system
            # We use the email as username since Supabase guarantees uniqueness there usually
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            
            return (user, None)
            
        except Exception as e:
            raise AuthenticationFailed(f'Token validation error: {str(e)}')
