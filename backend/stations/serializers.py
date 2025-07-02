from rest_framework import serializers
from .models import Station, Measurement


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = "__all__"


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = ["measurement_type", "value", "recorded_at"]


# Serializer for data ingestion (compatible with send_iot_data.py)
class MeasurementCreateSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=100)
    value = serializers.FloatField()
    # IntegerField is used because the incoming data will be a Unix timestamp (integer)
    recorded_at = serializers.IntegerField()
