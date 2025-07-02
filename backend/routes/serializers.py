from rest_framework import serializers
from .models import Route, PointOfInterest


class PointOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointOfInterest
        fields = "__all__"


class RouteSerializer(serializers.ModelSerializer):
    # For read (GET) requests, shows full PointOfInterest objects.
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)
    # For write (POST/PUT) requests, accepts PointOfInterest IDs.
    points_of_interest_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=PointOfInterest.objects.all(),
        source="points_of_interest",
        write_only=True,
        required=False,
    )

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
            "points_of_interest_ids",
            "image_card",
            "image_map",
            "gpx_file",
            "created_at",
            "updated_at",
        ]
