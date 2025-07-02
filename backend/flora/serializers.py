from rest_framework import serializers
from .models import Plant, PlantImage


class PlantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantImage
        fields = ["id", "image"]


class PlantSerializer(serializers.ModelSerializer):
    images = PlantImageSerializer(many=True, read_only=True)
    uses = serializers.SerializerMethodField()

    uploaded_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Plant
        fields = [
            "id",
            "scientific_name",
            "common_names",
            "interaction_fauna",
            "food_uses",
            "medicinal_uses",
            "ornamental_uses",
            "traditional_uses",
            "aromatic_uses",
            "uses",
            "images",
            "uploaded_image_ids",
        ]

    def get_uses(self, obj):
        return {
            "food": bool(obj.food_uses),
            "medicinal": bool(obj.medicinal_uses),
            "ornamental": bool(obj.ornamental_uses),
            "traditional": bool(obj.traditional_uses),
            "aromatic": bool(obj.aromatic_uses),
            "fauna_interaction": bool(obj.interaction_fauna),
        }

    def create(self, validated_data):
        uploaded_image_ids = validated_data.pop("uploaded_image_ids", [])
        plant = Plant.objects.create(**validated_data)
        if uploaded_image_ids:
            images = PlantImage.objects.filter(id__in=uploaded_image_ids)
            plant.images.set(images)
        return plant

    def update(self, instance, validated_data):
        uploaded_image_ids = validated_data.pop("uploaded_image_ids", None)

        # Update plant instance fields
        instance = super().update(instance, validated_data)

        if uploaded_image_ids is not None:
            if uploaded_image_ids:
                images = PlantImage.objects.filter(id__in=uploaded_image_ids)
                instance.images.set(images)
            else:
                # If an empty list is sent, clear existing images
                instance.images.clear()

        return instance
