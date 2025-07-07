from django.urls import path
from .views import LocationListView, ForecastView

app_name = "weather"


urlpatterns = [
    path("locations/", LocationListView.as_view(), name="weather-locations"),
    path(
        "forecast/<int:location_id>/",
        ForecastView.as_view(),
        name="weather-forecast",
    ),
]
