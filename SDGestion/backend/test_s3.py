#!/usr/bin/env python
"""
Test script to verify S3 connection and list objects
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/app')
django.setup()

from django.conf import settings
import boto3
from botocore.exceptions import ClientError

print("=" * 60)
print("AWS S3 Configuration Test")
print("=" * 60)

# Print settings
print(f"\nBucket Name: {settings.AWS_STORAGE_BUCKET_NAME}")
print(f"Region: {settings.AWS_S3_REGION_NAME}")
print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID[:10]}...")

# Try to create S3 client
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    print("\n✓ S3 Client created successfully")
except Exception as e:
    print(f"\n✗ Failed to create S3 client: {e}")
    sys.exit(1)

# Try to list objects
try:
    print(f"\nListing objects in bucket '{settings.AWS_STORAGE_BUCKET_NAME}'...")
    response = s3_client.list_objects_v2(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        MaxKeys=10
    )
    
    if 'Contents' in response:
        print(f"\n✓ Found {len(response['Contents'])} objects (showing first 10):")
        for obj in response['Contents']:
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
    else:
        print("\n⚠ Bucket is empty or no objects found")
        
except ClientError as e:
    print(f"\n✗ S3 Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n✗ Unexpected error: {e}")
    sys.exit(1)

# Check ReportFolder configuration
print("\n" + "=" * 60)
print("ReportFolder Configuration")
print("=" * 60)

from reports.models import ReportFolder

folders = ReportFolder.objects.all()
if folders.exists():
    print(f"\nFound {folders.count()} configured folder(s):")
    for folder in folders:
        print(f"\n  Name: {folder.name}")
        print(f"  S3 Prefix: {folder.s3_prefix}")
        print(f"  Company: {folder.company}")
        print(f"  Role Required: {folder.role_required}")
else:
    print("\n⚠ No ReportFolder objects configured in database")
    print("  Please add folders via Django Admin: http://localhost:8000/admin")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)
