from rest_framework import viewsets, permissions, filters
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Route
from .serializers import RouteSerializer
from django_filters.rest_framework import DjangoFilterBackend


# Public views
class PublicRouteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for publicly accessible routes.
    No authentication is required.
    Supports searching and filtering.
    """

    queryset = Route.objects.all().order_by("name")
    serializer_class = RouteSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["difficulty"]
    search_fields = ["name", "description"]


# Admin views
class AdminRouteViewSet(viewsets.ModelViewSet):
    """
    A full CRUD viewset for admins to manage routes.
    Requires admin authentication.
    Supports searching and filtering.
    """

    queryset = Route.objects.all().order_by("name")
    serializer_class = RouteSerializer
    parser_classes = [MultiPartParser, JSONParser]
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["difficulty"]
    search_fields = ["name", "description"]
