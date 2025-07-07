from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework_csv.renderers import CSVRenderer
from datetime import datetime, timezone
from django.db.models import Min, Max
from .models import Station, Measurement
from .serializers import (
    StationSerializer,
    MeasurementSerializer,
    MeasurementCreateSerializer,
)

# Create your views here.


class StationViewSet(viewsets.ModelViewSet):
    """
    Manages stations for admin users (CRUD).
    Regular users can only see active stations (ReadOnly).
    """

    queryset = Station.objects.all()
    serializer_class = StationSerializer

    def get_queryset(self):
        # Non-admin users can only see active stations
        if not self.request.user.is_staff:
            return Station.objects.filter(is_active=True)
        return super().get_queryset()

    def get_permissions(self):
        # IsAuthenticated is sufficient for GET, HEAD, OPTIONS requests
        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.IsAuthenticated]
        # All other actions (create, update, delete) require IsAdminUser
        else:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()


class MeasurementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows users to read measurement data with filters.
    Can output in JSON and CSV formats.
    """

    serializer_class = MeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer, CSVRenderer]  # Enable JSON and CSV renderers

    def get_queryset(self):
        queryset = Measurement.objects.all()
        params = self.request.query_params

        station_id_str = params.get("station_id")
        start_date_str = params.get("start")
        end_date_str = params.get("end")

        if not station_id_str or not start_date_str or not end_date_str:
            return queryset.none()

        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return queryset.none()

        queryset = queryset.filter(station__station_id=station_id_str)
        queryset = queryset.filter(
            recorded_at__gte=start_date, recorded_at__lte=end_date
        )
        return queryset


class DataIngestionView(APIView):
    """
    Receives and saves data from IoT devices via POST request.
    This endpoint should be protected with an API key (skipped for now for simplicity).
    """

    permission_classes = [permissions.AllowAny]  # TODO: Add API Key auth

    def post(self, request):
        data = request.data
        station_id = data.get("station_id")
        measurements_data = data.get("measurements", [])

        if not station_id or not measurements_data:
            return Response(
                {"error": "station_id and measurements are required"}, status=400
            )

        # Create station if it doesn't exist (or return an error, optional)
        station, created = Station.objects.get_or_create(
            station_id=station_id,
            defaults={
                "name": data.get("location", f"Station {station_id}"),
                "location": data.get("location", ""),
            },
        )

        for m_data in measurements_data:
            serializer = MeasurementCreateSerializer(data=m_data)
            if serializer.is_valid():
                # Convert Unix timestamp to datetime object
                unix_timestamp = serializer.validated_data["recorded_at"]
                dt_object = datetime.fromtimestamp(unix_timestamp, tz=timezone.utc)

                Measurement.objects.create(
                    station=station,
                    measurement_type=serializer.validated_data["type"],
                    value=serializer.validated_data["value"],
                    recorded_at=dt_object,
                )
            else:
                # Log or handle serializer errors
                print(serializer.errors)
        return Response({"status": "success"}, status=201)


class StationDataAvailabilityView(APIView):
    """
    Returns the date range (oldest and newest) of available data for a specific station.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, station_id):
        try:
            # Get Min and Max dates for the relevant station in a single query
            date_range = Measurement.objects.filter(
                station__station_id=station_id
            ).aggregate(min_date=Min("recorded_at"), max_date=Max("recorded_at"))

            # If there is no data, min_date and max_date will return None.
            if not date_range["min_date"] or not date_range["max_date"]:
                return Response(
                    {"error": "No data available for this station."}, status=404
                )

            return Response(
                {
                    "station_id": station_id,
                    "min_date": date_range["min_date"],
                    "max_date": date_range["max_date"],
                }
            )
        except Station.DoesNotExist:
            return Response({"error": "Station not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
