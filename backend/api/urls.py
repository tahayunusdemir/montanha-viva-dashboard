from django.urls import path
from .views import UserRegistrationView, UserProfileView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user_registration'),
    path('users/me/', UserProfileView.as_view(), name='user_profile'),
] 