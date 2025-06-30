from rest_framework import serializers
from .models import Route, PointOfInterest


class PointOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointOfInterest
        fields = ["id", "name", "description", "latitude", "longitude"]


class RouteSerializer(serializers.ModelSerializer):
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            "id",
            "name",
            "distance_km",
            "duration",
            "route_type",
            "difficulty",
            "altitude_min_m",
            "altitude_max_m",
            "accumulated_climb_m",
            "start_point_gps",
            "description",
            "points_of_interest",
            "image_card",
            "image_map",
            "gpx_file",
            "created_at",
            "updated_at",
        ]
