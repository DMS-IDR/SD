from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    class Meta:
        model = UserProfile
        fields = [
            'id',
            'supabase_user_id',
            'email',
            'company',
            'role',
            'can_view_reports',
            'can_view_user_management',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'supabase_user_id', 'created_at', 'updated_at']


class CreateUserSerializer(serializers.Serializer):
    """Serializer for creating new users"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=6, write_only=True)
    company = serializers.ChoiceField(choices=UserProfile.COMPANY_CHOICES, required=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=True)
    can_view_reports = serializers.BooleanField(default=True)
    can_view_user_management = serializers.BooleanField(default=False)
    
    def validate_email(self, value):
        """Check if email already exists"""
        if UserProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value
