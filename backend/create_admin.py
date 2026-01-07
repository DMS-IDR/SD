#!/usr/bin/env python
"""
Script to create an admin user profile for existing Supabase users.
Run this after creating a user in Supabase to give them admin access.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/app')
django.setup()

from users.models import UserProfile

def create_admin_profile(email, supabase_user_id, company='Dko'):
    """
    Create an admin user profile.
    
    Args:
        email: User's email address
        supabase_user_id: User's Supabase UUID
        company: Company name (Dko or Mv)
    """
    try:
        # Check if profile already exists
        existing = UserProfile.objects.filter(supabase_user_id=supabase_user_id).first()
        if existing:
            print(f"✗ Profile already exists for {email}")
            print(f"  Current role: {existing.role}")
            print(f"  To update, use Django admin or delete and recreate")
            return False
        
        # Create admin profile
        profile = UserProfile.objects.create(
            supabase_user_id=supabase_user_id,
            email=email,
            company=company,
            role='Admin',
            can_view_reports=True,
            can_view_user_management=True,
            is_active=True
        )
        
        print(f"✓ Admin profile created successfully!")
        print(f"  Email: {profile.email}")
        print(f"  Company: {profile.company}")
        print(f"  Role: {profile.role}")
        print(f"  Permissions:")
        print(f"    - Can view reports: {profile.can_view_reports}")
        print(f"    - Can manage users: {profile.can_view_user_management}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error creating profile: {e}")
        return False


if __name__ == '__main__':
    print("=" * 60)
    print("Admin User Profile Creator")
    print("=" * 60)
    print()
    
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <supabase_user_id> [company]")
        print()
        print("Example:")
        print("  python create_admin.py admin@dkohome.cl 3c763b4a-b7e8-497c-14aefa6-21551 Dko")
        print()
        print("To get the Supabase user ID:")
        print("  1. Go to Supabase Dashboard > Authentication > Users")
        print("  2. Click on the user")
        print("  3. Copy the 'ID' field")
        sys.exit(1)
    
    email = sys.argv[1]
    supabase_user_id = sys.argv[2]
    company = sys.argv[3] if len(sys.argv) > 3 else 'Dko'
    
    print(f"Creating admin profile for: {email}")
    print(f"Supabase ID: {supabase_user_id}")
    print(f"Company: {company}")
    print()
    
    success = create_admin_profile(email, supabase_user_id, company)
    
    if success:
        print()
        print("=" * 60)
        print("✓ Setup complete! User can now log in with admin privileges.")
        print("=" * 60)
    else:
        sys.exit(1)
