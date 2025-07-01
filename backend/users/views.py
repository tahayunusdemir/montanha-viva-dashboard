from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
import logging
from django.utils.decorators import method_decorator

# from ratelimit.decorators import ratelimit
from .tokens import account_activation_token_generator

from .serializers import (
    ChangePasswordSerializer,
    UserProfileSerializer,
    MyTokenObtainPairSerializer,
    CookieTokenRefreshSerializer,
    UserRegistrationSerializer,
    AdminUserSerializer,
    AdminUserCreationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


# @method_decorator(ratelimit(key='ip', rate='20/h', block=True), name='post')
class LogoutView(APIView):
    """
    Blacklists the refresh token to log the user out.
    Reads the refresh token from an HttpOnly cookie and deletes it.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # The response to clear the cookie
            response = Response(status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie("refresh_token", path="/api/users/")
            return response
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(ratelimit(key='ip', rate='10/m', block=True), name='post')
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = User.objects.get(email=request.data.get("email"))
            logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")
            # Activity logging and achievement checks are handled by the logger.

        # The cookie setting logic is now in finalize_response
        return response

    def finalize_response(self, request, response, *args, **kwargs):
        # This method is called before returning the final response.
        # We use it to set the refresh token as a cookie.
        if response.status_code == 200 and "refresh" in response.data:
            refresh_token = response.data.pop("refresh")

            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                samesite="Lax",
                secure=not settings.DEBUG,  # Use True in production
                path="/api/users/",  # Limit cookie to auth-related paths
            )

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    """
    Same as TokenRefreshView, but it takes the refresh token from a
    HttpOnly cookie and returns the new access token in the response.
    It does not return a new refresh token in the body.
    """

    serializer_class = CookieTokenRefreshSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        # If token rotation is on, a new refresh token may be issued.
        # We need to set it in the cookie again.
        if response.status_code == 200 and "refresh" in response.data:
            refresh_token = response.data.pop("refresh")
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                samesite="Lax",
                secure=not settings.DEBUG,
                path="/api/users/",
            )
        return super().finalize_response(request, response, *args, **kwargs)


# @method_decorator(ratelimit(key='ip', rate='10/h', block=True), name='post')
class RegisterView(generics.CreateAPIView):
    """
    Register a new user. Returns user data and tokens to match frontend expectations.
    """

    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # The serializer's `data` will now contain the nested `user` object
        user_data = serializer.data

        # Set refresh token in cookie
        response = Response(
            {
                "access": str(refresh.access_token),
                "user": user_data["user"],  # Extract the nested user object
            },
            status=status.HTTP_201_CREATED,
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/api/users/",
        )

        return response


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, Update, or Delete the currently authenticated user's profile.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# @method_decorator(ratelimit(key='ip', rate='10/m', block=True), name='put')
class ChangePasswordView(generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """

    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            self.object.set_password(serializer.validated_data.get("new_password"))
            self.object.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(ratelimit(key='ip', rate='5/h', block=True), name='post')
class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request a password reset email.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.validated_data["email"])

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token_generator.make_token(user)

        reset_link = f"{settings.CLIENT_URL}/reset-password?uidb64={uid}&token={token}"

        # Render both text and HTML versions of the email
        email_context = {"reset_link": reset_link}
        text_message = render_to_string("email/password_reset_email.txt", email_context)
        html_message = render_to_string(
            "email/password_reset_email.html", email_context
        )

        try:
            send_mail(
                "Password Reset Request",
                text_message,  # Plain text message
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
                html_message=html_message,  # HTML message
            )
            logger.info(f"Password reset email sent to {user.email}")
            return Response(
                {"detail": "Password reset link sent to your email."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(
                f"Failed to send password reset email to {user.email}: {e}",
                exc_info=True,
            )
            return Response(
                {"detail": "Failed to send email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# @method_decorator(ratelimit(key='ip', rate='5/h', block=True), name='post')
class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm and set a new password.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(
                "Password reset confirmation failed validation.",
                extra={"errors": serializer.errors},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uidb64 = serializer.validated_data["uidb64"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token_generator.check_token(
            user, token
        ):
            user.set_password(new_password)
            user.save()
            logger.info(f"Password reset successful for user {user.email}")
            return Response(
                {"detail": "Password has been reset successfully."},
                status=status.HTTP_200_OK,
            )
        else:
            logger.warning(
                "Password reset confirmation failed: Invalid token or UID.",
                extra={"uidb64": uidb64},
            )
            return Response(
                {"detail": "Invalid token or user ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances for admins.
    """

    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreationSerializer
        return AdminUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Return the user data using the main AdminUserSerializer
        response_serializer = AdminUserSerializer(
            user, context=self.get_serializer_context()
        )
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_update(self, serializer):
        user = serializer.instance
        # Log before saving to capture the state before the update
        logger.info(
            f"Admin '{self.request.user.email}' is updating user '{user.email}' (ID: {user.id}). "
            f"Data: {self.request.data}"
        )
        serializer.save()
        # Structured activity logging is handled by Python's logging module.
        logger.info(f"User '{user.email}' (ID: {user.id}) updated successfully.")

    def perform_destroy(self, instance):
        user_email = instance.email
        user_id = instance.id
        logger.info(
            f"Admin '{self.request.user.email}' is deleting user '{user_email}' (ID: {user_id})."
        )
        # Structured activity logging is handled by Python's logging module.
        instance.delete()
        logger.info(f"User '{user_email}' (ID: {user_id}) deleted successfully.")
