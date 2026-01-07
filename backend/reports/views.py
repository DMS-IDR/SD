from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import ReportFolder
from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import logging
import mimetypes
import traceback

logger = logging.getLogger(__name__)

class ReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("--------------------------------------------------", flush=True)
        print("DEBUG: ReportListView.get() called", flush=True)
        try:
            user = request.user
            company = getattr(user, 'company', None)
            role = getattr(user, 'role', None)
            
            print(f"DEBUG: User={user.email}, Company={company}, Role={role}", flush=True)

            if not company or not role:
                 print("DEBUG: Missing company/role", flush=True)
                 return Response({"error": "User profile incomplete"}, status=status.HTTP_403_FORBIDDEN)

            # Base filter: Company must match
            folders = ReportFolder.objects.filter(company=company)

            # Role filter
            if role == 'Tienda':
                 folders = folders.filter(role_required='Tienda')
            elif role == 'Comercial':
                 folders = folders.filter(role_required__in=['Tienda', 'Comercial'])
            elif role == 'Admin':
                 pass # Sees all roles within company
            else:
                 return Response({"error": "Invalid Role"}, status=status.HTTP_403_FORBIDDEN)
            
            print(f"DEBUG: Found {folders.count()} folders for user", flush=True)

            # Initialize S3 Client Explicitly
            try:
                print("DEBUG: Initializing Boto3 Client...", flush=True)
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
                print("DEBUG: Boto3 Client initialized successfully", flush=True)
            except Exception as e:
                print(f"CRITICAL: Failed to init boto3: {e}", flush=True)
                return Response({"error": f"Server Configuration Error: {str(e)}"}, status=500)

            # Check settings
            if not settings.AWS_STORAGE_BUCKET_NAME:
                print("CRITICAL: AWS_STORAGE_BUCKET_NAME is not set!", flush=True)
                return Response({"error": "Server Misconfiguration: AWS_STORAGE_BUCKET_NAME missing"}, status=500)

            results = []
            for folder in folders:
                print(f"DEBUG: Processing folder {folder.name} (Prefix: {folder.s3_prefix})", flush=True)
                folder_data = {
                    "id": folder.id,
                    "name": folder.name, 
                    "files": []
                }
                
                try:
                    # List objects in the bucket
                    print(f"DEBUG: Listing bucket={settings.AWS_STORAGE_BUCKET_NAME} prefix={folder.s3_prefix}", flush=True)
                    response = s3_client.list_objects_v2(
                        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                        Prefix=folder.s3_prefix
                    )

                    file_count = 0
                    if 'Contents' in response:
                        for obj in response['Contents']:
                            key = obj['Key']
                            
                            # Skip exact match of the folder prefix itself (empty placeholder)
                            if key == folder.s3_prefix or key == folder.s3_prefix + '/':
                                continue
                                
                            filename = key.split('/')[-1]
                            if not filename: 
                                continue

                            # Safely get LastModified and Size
                            last_modified = obj.get('LastModified')
                            size = obj.get('Size', 0)

                            # Explicitly convert datetime to string for JSON serialization
                            if last_modified:
                                last_modified = str(last_modified)

                            folder_data["files"].append({
                                "name": filename,
                                "key": key,
                                "last_modified": last_modified,
                                "size": size
                            })
                            file_count += 1
                    
                    print(f"DEBUG: Found {file_count} files in {folder.name}", flush=True)

                    # Sort files 
                    folder_data["files"].sort(key=lambda x: x['last_modified'], reverse=True)
                    results.append(folder_data)

                except ClientError as e:
                    print(f"ERROR: S3 ClientError for {folder.name}: {e}", flush=True)
                    results.append({
                        "id": folder.id,
                        "name": f"{folder.name} (ACCESS ERROR)",
                        "files": [],
                        "error": str(e)
                    })
                except Exception as e:
                    print(f"ERROR: Generic error for {folder.name}: {e}", flush=True)
                    traceback.print_exc()
                    results.append({
                        "id": folder.id,
                        "name": f"{folder.name} (ERROR)",
                        "files": [],
                        "error": str(e)
                    })
            
            return Response(results)

        except Exception as main_e:
            print("CRITICAL: Unhandled exception in ReportListView", flush=True)
            traceback.print_exc()
            return Response({"error": f"Internal Server Error: {str(main_e)}"}, status=500)

class GeneratePresignedUrlView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            key = request.query_params.get('key')
            if not key:
                 return Response({"error": "Missing 'key' parameter"}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            company = getattr(user, 'company', None)
            role = getattr(user, 'role', None)

            # Re-verify permissions (simplified for now to rely on Filter overlap)
            # Fetch all user allowed folders
            folders = ReportFolder.objects.filter(company=company)
            is_allowed = False
            for folder in folders:
                 if key.startswith(folder.s3_prefix):
                     is_allowed = True
                     break
            
            if not is_allowed and role != 'Admin': # Allow admin override just in case
                 return Response({"error": "Unauthorized"}, status=403)

            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )

            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': key},
                ExpiresIn=3600
            )
            return Response({"url": url})
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
