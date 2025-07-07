import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser
from .models import Station, Measurement
from datetime import datetime, timezone, timedelta

# Mark all tests in this file as Django DB tests
pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def regular_user():
    return CustomUser.objects.create_user(
        email="user@example.com", password="password123"
    )


@pytest.fixture
def admin_user():
    return CustomUser.objects.create_superuser(
        email="admin@example.com", password="password123"
    )


@pytest.fixture
def active_station():
    return Station.objects.create(
        station_id="station-active-01", name="Active Station 1", is_active=True
    )


@pytest.fixture
def inactive_station():
    return Station.objects.create(
        station_id="station-inactive-01", name="Inactive Station 1", is_active=False
    )


class TestStationViewSet:
    def test_unauthenticated_user_cannot_access(self, api_client):
        url = reverse("station-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_regular_user_can_list_only_active_stations(
        self, api_client, regular_user, active_station, inactive_station
    ):
        api_client.force_authenticate(user=regular_user)
        url = reverse("station-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["station_id"] == active_station.station_id
        assert response.data[0]["is_active"] is True

    def test_regular_user_cannot_create_station(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        url = reverse("station-list")
        data = {"station_id": "new-station", "name": "New Station"}
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_list_all_stations(
        self, api_client, admin_user, active_station, inactive_station
    ):
        api_client.force_authenticate(user=admin_user)
        url = reverse("station-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_admin_can_create_station(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("station-list")
        data = {"station_id": "admin-station-01", "name": "Admin Station"}
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Station.objects.filter(station_id="admin-station-01").exists()

    def test_admin_can_update_station(self, api_client, admin_user, active_station):
        api_client.force_authenticate(user=admin_user)
        url = reverse("station-detail", kwargs={"pk": active_station.pk})
        data = {"name": "Updated Station Name"}
        response = api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        active_station.refresh_from_db()
        assert active_station.name == "Updated Station Name"

    def test_admin_can_delete_station(self, api_client, admin_user, active_station):
        api_client.force_authenticate(user=admin_user)
        url = reverse("station-detail", kwargs={"pk": active_station.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Station.objects.filter(pk=active_station.pk).exists()


class TestMeasurementViewSet:
    @pytest.fixture(autouse=True)
    def setup(self, active_station):
        self.station = active_station
        self.now = datetime.now(timezone.utc)
        Measurement.objects.create(
            station=self.station,
            measurement_type="temperature",
            value=25.5,
            recorded_at=self.now - timedelta(days=1),
        )
        Measurement.objects.create(
            station=self.station,
            measurement_type="humidity",
            value=60.1,
            recorded_at=self.now,
        )

    def test_unauthenticated_user_cannot_access(self, api_client):
        url = reverse("measurement-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_missing_params_returns_empty_list(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        url = reverse("measurement-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_correct_params_return_filtered_data(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        start_date = (self.now - timedelta(days=2)).isoformat().replace("+00:00", "Z")
        end_date = (self.now + timedelta(days=1)).isoformat().replace("+00:00", "Z")
        url = f"{reverse('measurement-list')}?station_id={self.station.station_id}&start={start_date}&end={end_date}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_date_filtering_works_correctly(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        start_date = (self.now - timedelta(hours=1)).isoformat().replace("+00:00", "Z")
        end_date = (self.now + timedelta(hours=1)).isoformat().replace("+00:00", "Z")
        url = f"{reverse('measurement-list')}?station_id={self.station.station_id}&start={start_date}&end={end_date}"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["measurement_type"] == "humidity"

    def test_csv_renderer_works(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        start_date = (self.now - timedelta(days=2)).isoformat().replace("+00:00", "Z")
        end_date = (self.now + timedelta(days=1)).isoformat().replace("+00:00", "Z")
        url = f"{reverse('measurement-list')}?station_id={self.station.station_id}&start={start_date}&end={end_date}"
        response = api_client.get(url, HTTP_ACCEPT="text/csv")
        assert response.status_code == status.HTTP_200_OK
        assert "text/csv" in response.get("Content-Type", "")
        content = response.content.decode("utf-8")
        # Check for presence of headers, order is not important
        assert "measurement_type" in content
        assert "value" in content
        assert "recorded_at" in content

        # Check that the data is present, independent of column order
        temp_line = [line for line in content.splitlines() if "temperature" in line]
        assert len(temp_line) == 1
        assert "temperature" in temp_line[0]
        assert "25.5" in temp_line[0]


class TestDataIngestionView:
    def test_ingestion_creates_station_and_measurements(self, api_client):
        url = reverse("iot-data-ingestion")
        timestamp = int(datetime.now(timezone.utc).timestamp())
        data = {
            "station_id": "new-iot-device-01",
            "location": "Test Location",
            "measurements": [
                {"type": "temperature", "value": 22.3, "recorded_at": timestamp},
                {"type": "pressure", "value": 1012, "recorded_at": timestamp},
            ],
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Station.objects.filter(station_id="new-iot-device-01").exists()
        assert Measurement.objects.count() == 2

    def test_ingestion_uses_existing_station(self, api_client, active_station):
        url = reverse("iot-data-ingestion")
        timestamp = int(datetime.now(timezone.utc).timestamp())
        data = {
            "station_id": active_station.station_id,
            "measurements": [
                {"type": "wind_speed", "value": 15.0, "recorded_at": timestamp}
            ],
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Station.objects.count() == 1  # No new station created
        assert active_station.measurements.count() == 1
        assert active_station.measurements.first().measurement_type == "wind_speed"

    def test_ingestion_handles_bad_request(self, api_client):
        url = reverse("iot-data-ingestion")
        data = {"measurements": []}  # Missing station_id
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "station_id" in response.data["error"]
