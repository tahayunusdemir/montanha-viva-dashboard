from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Route
from .serializers import RouteSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.


class RouteViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing hiking routes.
    Supports file uploads for images and GPX files.
    """

    queryset = (
        Route.objects.all()
        .prefetch_related("points_of_interest")
        .order_by("-created_at")
    )
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]  # For file uploads

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["difficulty", "route_type"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "distance_km", "difficulty"]

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Allow anyone to list or retrieve, but only authenticated users (staff) to modify.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            self.permission_classes = [permissions.IsAdminUser]
        else:  # list, retrieve
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()
