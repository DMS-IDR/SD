from django.urls import path
from .views import ReportListView, GeneratePresignedUrlView

urlpatterns = [
    path('list/', ReportListView.as_view(), name='report-list'),
    path('download/', GeneratePresignedUrlView.as_view(), name='report-download'),
]
