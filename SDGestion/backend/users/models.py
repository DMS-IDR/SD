from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    """
    Extended user profile with permissions and company info.
    Links to Supabase auth.users via supabase_user_id.
    """
    
    COMPANY_CHOICES = [
        ('Dko', 'Dko'),
        ('Mv', 'Mv'),
    ]
    
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Comercial', 'Comercial'),
        ('Tienda', 'Tienda'),
    ]
    
    supabase_user_id = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    company = models.CharField(max_length=50, choices=COMPANY_CHOICES)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    
    # View permissions
    can_view_reports = models.BooleanField(default=True)
    can_view_user_management = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_userprofile'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.role} - {self.company})"
    
    def has_permission(self, permission_name):
        """Check if user has a specific permission"""
        return getattr(self, permission_name, False)
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'Admin'
