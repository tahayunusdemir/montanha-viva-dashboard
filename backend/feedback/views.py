from rest_framework import generics, permissions
from .models import Feedback
from .serializers import FeedbackListDetailSerializer, FeedbackCreateSerializer
from django.db import models

# Create your views here.


class AdminFeedbackListView(generics.ListAPIView):
    """
    API view for administrators to list all feedback entries.
    Requires admin user permissions.
    Supports filtering by status and searching by user name/email.
    """

    serializer_class = FeedbackListDetailSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Feedback.objects.all().select_related("user").order_by("-created_at")

        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                models.Q(user__first_name__icontains=search)
                | models.Q(user__last_name__icontains=search)
                | models.Q(user__email__icontains=search)
                | models.Q(name__icontains=search)
                | models.Q(surname__icontains=search)
                | models.Q(email__icontains=search)
            )

        return queryset


class AdminFeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for administrators to retrieve, update, or delete a specific feedback entry.
    Requires admin user permissions.
    """

    queryset = Feedback.objects.all()
    serializer_class = FeedbackListDetailSerializer
    permission_classes = [permissions.IsAdminUser]


class FeedbackListCreateView(generics.ListCreateAPIView):
    """
    API view to list and create feedback entries.
    Authentication is required for all actions.
    - GET: Returns a list of all feedback for the authenticated user.
    - POST: Creates a new feedback entry for the authenticated user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """
        Return the serializer class based on the request method.
        """
        if self.request.method == "POST":
            return FeedbackCreateSerializer
        return FeedbackListDetailSerializer

    def get_queryset(self):
        """
        This view should return a list of all the feedbacks
        for the currently authenticated user.
        """
        return Feedback.objects.filter(user=self.request.user).select_related("user")

    def perform_create(self, serializer):
        """
        Automatically assign the logged-in user to the feedback.
        """
        serializer.save(user=self.request.user)
