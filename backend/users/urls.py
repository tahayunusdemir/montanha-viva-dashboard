from django.urls import path, include
from rest_framework.routers import DefaultRouter

# The default TokenRefreshView is replaced by our custom one
# from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    UserProfileView,
    LogoutView,
    MyTokenObtainPairView,
    CookieTokenRefreshView,  # Import custom refresh view
    RegisterView,
    AdminUserViewSet,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

router = DefaultRouter()
router.register(r"admin/users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="user-register"),
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    # Password Reset
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    # User
    path("me/", UserProfileView.as_view(), name="user-me"),
    path(
        "me/change-password/",
        ChangePasswordView.as_view(),
        name="user-change-password",
    ),
]

urlpatterns += router.urls
