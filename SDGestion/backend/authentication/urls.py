from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TestAuthView.as_view(), name='test-auth'),
]
