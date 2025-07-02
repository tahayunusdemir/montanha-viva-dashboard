from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from .models import Plant, PlantImage
from .serializers import PlantSerializer, PlantImageSerializer

# Create your views here.


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by("scientific_name")
    serializer_class = PlantSerializer
    parser_classes = [MultiPartParser, JSONParser]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]
        else:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload_image(self, request):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"detail": "No image file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a PlantImage instance manually
        plant_image = PlantImage.objects.create(image=image_file)

        # Serialize the created instance to return its data, including the ID
        response_serializer = PlantImageSerializer(
            plant_image, context={"request": request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
