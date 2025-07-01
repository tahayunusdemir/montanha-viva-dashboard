from rest_framework import serializers
from .models import Feedback
from users.serializers import UserProfileSerializer


class FeedbackListDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving feedback, including nested user details.
    """

    user_details = UserProfileSerializer(source="user", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id",
            "user_details",  # Shows nested user data for authenticated users
            "name",  # For anonymous users
            "surname",  # For anonymous users
            "email",  # For anonymous users
            "subject",
            "message",
            "category",
            "status",
            "document",
            "created_at",
            "updated_at",
        ]


class FeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating feedback by authenticated users.
    User is automatically assigned in the view.
    """

    class Meta:
        model = Feedback
        fields = ["subject", "message", "category", "document"]


class AnonymousFeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating feedback by anonymous (unauthenticated) users.
    Requires name and email.
    """

    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True, max_length=100)
    surname = serializers.CharField(required=True, max_length=100)

    class Meta:
        model = Feedback
        fields = [
            "name",
            "surname",
            "email",
            "subject",
            "message",
            "category",
            "document",
        ]

    # The custom create method is no longer needed as the user
    # is now passed directly in the view's perform_create method.
