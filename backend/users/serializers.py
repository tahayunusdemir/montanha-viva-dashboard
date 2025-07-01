from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import timedelta

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    remember_me = serializers.BooleanField(write_only=True, required=False)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims can be added here if needed
        return token

    def validate(self, attrs):
        remember_me = attrs.pop("remember_me", False)
        data = super().validate(attrs)

        # If remember_me is true, extend the refresh token lifetime
        if remember_me:
            refresh = RefreshToken.for_user(self.user)
            refresh.set_exp(lifetime=timedelta(days=30))
            data["refresh"] = str(refresh)
            # Access token lifetime remains short

        # Add user data to the response
        serializer = UserProfileSerializer(self.user)
        data["user"] = serializer.data
        return data


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Same as TokenRefreshSerializer, but it takes the refresh token from a
    HttpOnly cookie.
    """

    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get("refresh_token")
        if attrs["refresh"] is None:
            raise InvalidToken("No refresh token found in cookie")

        return super().validate(attrs)


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for admin to view and update user details.
    Allows updating roles, status, and optionally resetting passwords.
    """

    role = serializers.SerializerMethodField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    re_password = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "date_joined",
            "is_staff",
            "is_active",
            "points",
            "password",
            "re_password",
        )
        read_only_fields = ("id", "email", "date_joined", "role")

    def get_role(self, obj):
        if obj.is_superuser:
            return "Super Admin"
        if obj.is_staff:
            return "Admin"
        return "User"

    def validate(self, data):
        # Admin can update user without changing password
        if data.get("password") or data.get("re_password"):
            if data.get("password") != data.get("re_password"):
                raise serializers.ValidationError({"password": "Passwords must match."})

            # Validate password complexity if a new one is provided
            try:
                password_validation.validate_password(data["password"])
            except ValidationError as exc:
                raise serializers.ValidationError({"password": str(exc)})

        return data

    def update(self, instance, validated_data):
        # Update password if provided
        password = validated_data.pop("password", None)
        validated_data.pop("re_password", None)  # Remove re_password

        if password:
            instance.set_password(password)

        # Update other fields
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.points = validated_data.get("points", instance.points)
        instance.is_staff = validated_data.get("is_staff", instance.is_staff)
        instance.is_active = validated_data.get("is_active", instance.is_active)

        instance.save()
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the CustomUser model."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "is_staff", "points")


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration that returns JWT tokens."""

    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ("user", "email", "first_name", "last_name", "password")
        extra_kwargs = {
            "first_name": {"required": True, "write_only": True},
            "last_name": {"required": True, "write_only": True},
            "email": {"write_only": True},
        }

    def get_user(self, obj):
        """Use UserProfileSerializer to serialize the user object."""
        return UserProfileSerializer(obj).data

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    re_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data["new_password"] != data["re_new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New passwords must match."}
            )
        try:
            password_validation.validate_password(data["new_password"])
        except ValidationError as exc:
            raise serializers.ValidationError({"new_password": exc.messages})
        return data

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is not correct.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset e-mail."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset."""

    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    re_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data["new_password"] != data["re_new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New passwords must match."}
            )
        try:
            password_validation.validate_password(data["new_password"])
        except ValidationError as exc:
            raise serializers.ValidationError({"new_password": exc.messages})
        return data


class AdminUserCreationSerializer(serializers.ModelSerializer):
    """Serializer for user creation by an admin."""

    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    re_password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "password",
            "re_password",
            "is_staff",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "is_staff": {"required": False},  # Defaults to False (User)
        }

    def validate(self, data):
        if data["password"] != data["re_password"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def create(self, validated_data):
        validated_data.pop("re_password")
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            is_staff=validated_data.get("is_staff", False),
        )
        return user
