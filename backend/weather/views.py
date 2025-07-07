import requests
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

IPMA_LOCATIONS_URL = "https://api.ipma.pt/open-data/distrits-islands.json"
CACHE_TIMEOUT_LOCATIONS = 60 * 60 * 24  # 24 hours


class LocationListView(APIView):
    """
    Provides a list of weather locations from the IPMA API.
    The response is cached for 24 hours to reduce external API calls.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        cached_locations = cache.get("weather_locations")
        if cached_locations:
            return Response(cached_locations)

        try:
            response = requests.get(IPMA_LOCATIONS_URL)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()
            locations = data.get("data", [])

            # Sort locations by name
            sorted_locations = sorted(locations, key=lambda x: x.get("local", ""))

            cache.set("weather_locations", sorted_locations, CACHE_TIMEOUT_LOCATIONS)
            return Response(sorted_locations)
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Failed to fetch data from IPMA API: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


IPMA_FORECAST_URL = "https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{globalIdLocal}.json"
CACHE_TIMEOUT_FORECAST = 60 * 15  # 15 minutes


class ForecastView(APIView):
    """
    Provides a 5-day weather forecast for a specific location from the IPMA API.
    The response is cached for 15 minutes.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        location_id = kwargs.get("location_id")
        if not location_id:
            return Response(
                {"error": "Location ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"weather_forecast_{location_id}"
        cached_forecast = cache.get(cache_key)
        if cached_forecast:
            return Response(cached_forecast)

        try:
            url = IPMA_FORECAST_URL.format(globalIdLocal=location_id)
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            cache.set(cache_key, data, CACHE_TIMEOUT_FORECAST)
            return Response(data)
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Failed to fetch forecast from IPMA API: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
