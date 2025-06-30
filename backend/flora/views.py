from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Plant
from .serializers import PlantSerializer
from rest_framework.filters import SearchFilter, OrderingFilter

# Create your views here.


class PlantViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing plant instances.
    Provides full CRUD functionality.
    Supports searching and ordering.
    """

    queryset = Plant.objects.all()
    serializer_class = PlantSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "scientific_name",
        "common_names",
        "interaction_fauna",
        "food_uses",
        "medicinal_uses",
    ]
    ordering_fields = ["scientific_name", "created_at"]

    def get_queryset(self):
        """
        Optionally restricts the returned plants by filtering against
        query parameters based on the `uses_flags` JSONField.

        Example: `?uses_flags__medicinal=true&uses_flags__food=false`
        """
        queryset = super().get_queryset()

        for key, value in self.request.query_params.items():
            if key.startswith("uses_flags__"):
                flag = key.split("__")[1]
                # Convert 'true'/'false' string from query param to boolean
                bool_value = value.lower() in ["true", "1"]
                queryset = queryset.filter(**{f"uses_flags__{flag}": bool_value})

        return queryset

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        - `AllowAny` for read-only actions (`list`, `retrieve`).
        - `IsAdminUser` for write actions (`create`, `update`, `destroy`).
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            self.permission_classes = [permissions.IsAdminUser]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()
