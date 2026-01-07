from django.urls import path
from . import views

urlpatterns = [
    path('info/', views.ClosingSalesInfoView.as_view(), name='closing-sales-info'),
    path('channels/', views.ChannelsView.as_view(), name='closing-sales-channels'),
    path('cashes/', views.CashesView.as_view(), name='closing-sales-cashes'),
    path('companies/', views.CompaniesView.as_view(), name='closing-sales-companies'),
]
