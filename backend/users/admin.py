from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['email', 'company', 'role', 'can_view_reports', 'can_view_user_management', 'can_view_closing_sales', 'can_view_commission', 'is_active', 'created_at']
    list_filter = ['company', 'role', 'is_active', 'can_view_reports', 'can_view_user_management', 'can_view_closing_sales', 'can_view_commission']
    search_fields = ['email', 'supabase_user_id']
    readonly_fields = ['supabase_user_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Info', {
            'fields': ('supabase_user_id', 'email', 'company', 'role')
        }),
        ('Permissions', {
            'fields': ('can_view_reports', 'can_view_user_management', 'can_view_closing_sales', 'can_view_commission')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
