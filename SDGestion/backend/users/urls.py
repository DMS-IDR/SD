from django.urls import path
from .views import UserListCreateView, UserDetailView, CurrentUserPermissionsView

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('me/permissions/', CurrentUserPermissionsView.as_view(), name='current-user-permissions'),
]
