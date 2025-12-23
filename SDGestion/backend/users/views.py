from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from supabase import create_client
import os

from .models import UserProfile
from .serializers import UserProfileSerializer, CreateUserSerializer


class IsAdmin(IsAuthenticated):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        # Check if user has admin role
        user_role = getattr(request, 'user_role', None)
        return user_role == 'Admin'


class UserListCreateView(APIView):
    """
    GET: List all users (Admin only)
    POST: Create new user (Admin only)
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        """List all users"""
        users = UserProfile.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new user in Supabase and local database"""
        serializer = CreateUserSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize Supabase Admin client with service role key
            supabase_url = os.environ.get("SUPABASE_URL")
            # Use service_role key for admin operations (creating users)
            supabase_service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_service_key:
                return Response(
                    {"error": "Server misconfiguration: Supabase admin credentials missing"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create Supabase client with service role key (has admin privileges)
            supabase = create_client(supabase_url, supabase_service_key)
            
            # Create user in Supabase
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Create user via Supabase Admin API
            auth_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True  # Auto-confirm email
            })
            
            if not auth_response.user:
                return Response(
                    {"error": "Failed to create user in Supabase"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create local UserProfile
            user_profile = UserProfile.objects.create(
                supabase_user_id=auth_response.user.id,
                email=email,
                company=serializer.validated_data['company'],
                role=serializer.validated_data['role'],
                can_view_reports=serializer.validated_data.get('can_view_reports', True),
                can_view_user_management=serializer.validated_data.get('can_view_user_management', False),
            )
            
            # Also create/update profile in Supabase public.profiles table
            try:
                supabase.table('profiles').insert({
                    'id': auth_response.user.id,
                    'company': serializer.validated_data['company'],
                    'role': serializer.validated_data['role'],
                }).execute()
            except Exception as e:
                print(f"Warning: Could not create Supabase profile: {e}")
            
            response_serializer = UserProfileSerializer(user_profile)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to create user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserDetailView(APIView):
    """
    GET: Get user details (Admin only)
    PUT: Update user (Admin only)
    DELETE: Deactivate user (Admin only)
    """
    permission_classes = [IsAdmin]
    
    def get(self, request, user_id):
        """Get user details"""
        try:
            user = UserProfile.objects.get(id=user_id)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, user_id):
        """Update user permissions and info"""
        try:
            user = UserProfile.objects.get(id=user_id)
            
            # Update allowed fields
            if 'company' in request.data:
                user.company = request.data['company']
            if 'role' in request.data:
                user.role = request.data['role']
            if 'can_view_reports' in request.data:
                user.can_view_reports = request.data['can_view_reports']
            if 'can_view_user_management' in request.data:
                user.can_view_user_management = request.data['can_view_user_management']
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            
            user.save()
            
            # Also update Supabase profiles table
            try:
                supabase_url = os.environ.get("SUPABASE_URL")
                supabase_key = os.environ.get("SUPABASE_KEY")
                
                if supabase_url and supabase_key:
                    supabase = create_client(supabase_url, supabase_key)
                    
                    supabase.table('profiles').update({
                        'company': user.company,
                        'role': user.role,
                    }).eq('id', user.supabase_user_id).execute()
            except Exception as e:
                print(f"Warning: Could not update Supabase profile: {e}")
            
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
            
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, user_id):
        """Deactivate user (soft delete)"""
        try:
            user = UserProfile.objects.get(id=user_id)
            user.is_active = False
            user.save()
            
            return Response(
                {"message": "User deactivated successfully"},
                status=status.HTTP_200_OK
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class CurrentUserPermissionsView(APIView):
    """
    GET: Get current user's permissions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user's permissions"""
        supabase_user_id = getattr(request, 'user_id', None)
        
        if not supabase_user_id:
            return Response(
                {"error": "User not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            user_profile = UserProfile.objects.get(supabase_user_id=supabase_user_id)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # User exists in Supabase but not in local DB - create profile
            return Response(
                {"error": "User profile not found. Please contact administrator."},
                status=status.HTTP_404_NOT_FOUND
            )
