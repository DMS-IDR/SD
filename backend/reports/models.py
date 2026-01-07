from django.db import models

class ReportFolder(models.Model):
    COMPANY_CHOICES = [
        ('Dko', 'Dko'),
        ('Mv', 'Mv'),
    ]
    
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Comercial', 'Comercial'),
        ('Tienda', 'Tienda'),
    ]

    name = models.CharField(max_length=255, help_text="Display name for this category (e.g. 'Ventas')")
    s3_prefix = models.CharField(max_length=1024, help_text="Folder path in S3 (e.g. 'dkohome/Ventas/'). Must end with /")
    company = models.CharField(max_length=50, choices=COMPANY_CHOICES)
    role_required = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Tienda')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.company})"
