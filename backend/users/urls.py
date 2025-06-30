from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    CurrentUserView,
    MyTokenObtainPairView,
    UserRegistrationView,
)

urlpatterns = [
    # Auth
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User
    path("me/", CurrentUserView.as_view(), name="user-me"),
    path(
        "me/change-password/",
        ChangePasswordView.as_view(),
        name="user-change-password",
    ),
]
