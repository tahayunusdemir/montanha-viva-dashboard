from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Route, PointOfInterest
from .serializers import RouteSerializer, PointOfInterestSerializer


# Public views
class PublicRouteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for publicly accessible routes.
    No authentication is required.
    """

    queryset = Route.objects.all().order_by("name")
    serializer_class = RouteSerializer
    permission_classes = [permissions.AllowAny]


# Admin views
class AdminRouteViewSet(viewsets.ModelViewSet):
    """
    A full CRUD viewset for admins to manage routes.
    Requires admin authentication.
    """

    queryset = Route.objects.all().order_by("name")
    serializer_class = RouteSerializer
    parser_classes = [MultiPartParser, JSONParser]
    permission_classes = [permissions.IsAdminUser]


class AdminPointOfInterestViewSet(viewsets.ModelViewSet):
    """
    A full CRUD viewset for admins to manage points of interest.
    Requires admin authentication.
    """

    queryset = PointOfInterest.objects.all()
    serializer_class = PointOfInterestSerializer
    permission_classes = [permissions.IsAdminUser]
