from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_commissions, name='get_commissions'),
    path('vendors/', views.get_vendors, name='get_vendors'),
]
