from django.urls import path
from .views import (
    UserRegistrationView, 
    UserProfileView, 
    PublicDataView, 
    ProtectedDataView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user_registration'),
    path('users/me/', UserProfileView.as_view(), name='user_profile'),
    path('public-data/', PublicDataView.as_view(), name='public_data'),
    path('protected-data/', ProtectedDataView.as_view(), name='protected_data'),
] 