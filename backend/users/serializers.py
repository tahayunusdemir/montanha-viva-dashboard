from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims can be added here if needed
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to the response
        serializer = CustomUserSerializer(self.user)
        data["user"] = serializer.data
        return data


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer for the CustomUser model."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "is_staff")


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
        """Use CustomUserSerializer to serialize the user object."""
        return CustomUserSerializer(obj).data

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
