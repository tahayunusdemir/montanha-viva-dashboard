from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StationViewSet,
    MeasurementViewSet,
    DataIngestionView,
    StationDataAvailabilityView,
)

router = DefaultRouter()
router.register(r"stations", StationViewSet, basename="station")
router.register(r"measurements", MeasurementViewSet, basename="measurement")

urlpatterns = [
    path("", include(router.urls)),
    path("iot-data/", DataIngestionView.as_view(), name="iot-data-ingestion"),
    path(
        "stations/<str:station_id>/availability/",
        StationDataAvailabilityView.as_view(),
        name="station-data-availability",
    ),
]
