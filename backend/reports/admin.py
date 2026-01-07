from django.contrib import admin
from .models import ReportFolder

@admin.register(ReportFolder)
class ReportFolderAdmin(admin.ModelAdmin):
    list_display = ('name', 's3_prefix', 'company', 'role_required', 'created_at')
    list_filter = ('company', 'role_required')
    search_fields = ('name', 's3_prefix')
