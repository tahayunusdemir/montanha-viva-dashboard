import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from users.models import CustomUser
from .models import PointOfInterest, Route

# Mark all tests in this file as Django DB tests
pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def use_tmp_media_root(settings, tmp_path):
    """Fixture to automatically use a temporary directory for MEDIA_ROOT."""
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def api_client():
    """Fixture for API client."""
    return APIClient()


@pytest.fixture
def common_user():
    """Fixture for a standard, non-admin user."""
    return CustomUser.objects.create_user(
        email="common@example.com",
        password="password123",
        first_name="Common",
        last_name="User",
    )


@pytest.fixture
def admin_user():
    """Fixture for an admin user."""
    return CustomUser.objects.create_superuser(
        email="admin@example.com",
        password="password123",
        first_name="Admin",
        last_name="User",
    )


def authenticate_client(api_client, user):
    """Helper to authenticate a client."""
    api_client.force_authenticate(user=user)


# --- PointOfInterestViewSet Tests ---


class TestPointOfInterestViewSet:
    """Tests for the PointOfInterestViewSet."""

    list_url = reverse("pointofinterest-list")

    def detail_url(self, poi_id):
        return reverse("pointofinterest-detail", args=[poi_id])

    def test_poi_list_unauthenticated(self, api_client):
        """Verify unauthenticated users cannot list POIs."""
        response = api_client.get(self.list_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_poi_list_common_user(self, api_client, common_user):
        """Verify non-admin users cannot list POIs."""
        authenticate_client(api_client, common_user)
        response = api_client.get(self.list_url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_poi_create_admin(self, api_client, admin_user):
        """Verify admin users can create a POI."""
        authenticate_client(api_client, admin_user)
        data = {"name": "Test POI", "description": "A test POI."}
        response = api_client.post(self.list_url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert PointOfInterest.objects.filter(name="Test POI").exists()

    def test_poi_update_admin(self, api_client, admin_user):
        """Verify admin users can update a POI."""
        authenticate_client(api_client, admin_user)
        poi = PointOfInterest.objects.create(name="Old Name")
        data = {"name": "New Name"}
        response = api_client.put(self.detail_url(poi.id), data)
        assert response.status_code == status.HTTP_200_OK
        poi.refresh_from_db()
        assert poi.name == "New Name"

    def test_poi_delete_admin(self, api_client, admin_user):
        """Verify admin users can delete a POI."""
        authenticate_client(api_client, admin_user)
        poi = PointOfInterest.objects.create(name="To be deleted")
        response = api_client.delete(self.detail_url(poi.id))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not PointOfInterest.objects.filter(id=poi.id).exists()


# --- RouteViewSet Tests ---


@pytest.fixture
def sample_poi():
    """Fixture for a sample PointOfInterest."""
    return PointOfInterest.objects.create(
        name="Sample POI", description="A sample POI."
    )


@pytest.fixture
def sample_route(sample_poi):
    """Fixture for a sample Route."""
    route = Route.objects.create(
        name="Sample Route",
        distance_km=10.5,
        duration="3h",
        route_type="circular",
        difficulty="Medium",
        altitude_min_m=100,
        altitude_max_m=500,
        accumulated_climb_m=400,
        description="A beautiful sample route.",
        image_card=SimpleUploadedFile(
            "card.jpg", b"file_content", content_type="image/jpeg"
        ),
        image_map=SimpleUploadedFile(
            "map.jpg", b"file_content", content_type="image/jpeg"
        ),
    )
    route.points_of_interest.add(sample_poi)
    return route


class TestRouteViewSet:
    """Tests for the RouteViewSet."""

    list_url = reverse("route-list")

    def detail_url(self, route_id):
        return reverse("route-detail", args=[route_id])

    # Public access tests
    def test_route_list_public(self, api_client, sample_route):
        """Verify anyone can list routes."""
        response = api_client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert response.data[0]["name"] == sample_route.name

    def test_route_retrieve_public(self, api_client, sample_route):
        """Verify anyone can retrieve a single route."""
        response = api_client.get(self.detail_url(sample_route.id))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == sample_route.name
        assert "points_of_interest" in response.data
        assert len(response.data["points_of_interest"]) == 1

    # Permission tests for write actions
    @pytest.mark.parametrize("user_type", ["unauthenticated", "common"])
    def test_route_create_permission_denied(self, api_client, common_user, user_type):
        """Verify non-admins cannot create routes."""
        if user_type == "common":
            authenticate_client(api_client, common_user)

        data = {"name": "Forbidden Route"}
        response = api_client.post(self.list_url, data)

        expected_status = (
            status.HTTP_401_UNAUTHORIZED
            if user_type == "unauthenticated"
            else status.HTTP_403_FORBIDDEN
        )
        assert response.status_code == expected_status

    # Admin CRUD tests
    def test_route_create_admin(self, api_client, admin_user, sample_poi):
        """Verify admin can create a route with file uploads."""
        authenticate_client(api_client, admin_user)

        # Create a minimal valid GIF for image uploads
        gif_content = b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b"
        image_card = SimpleUploadedFile("card_new.jpg", gif_content, "image/gif")
        image_map = SimpleUploadedFile("map_new.jpg", gif_content, "image/gif")
        gpx_file = SimpleUploadedFile(
            "track.gpx", b"<gpx></gpx>", "application/gpx+xml"
        )

        data = {
            "name": "Admin's New Route",
            "distance_km": 15.0,
            "duration": "5h",
            "route_type": "linear",
            "difficulty": "Hard",
            "altitude_min_m": 200,
            "altitude_max_m": 1000,
            "accumulated_climb_m": 800,
            "description": "A challenging new route.",
            "points_of_interest_ids": [sample_poi.id],
            "image_card": image_card,
            "image_map": image_map,
            "gpx_file": gpx_file,
        }

        response = api_client.post(self.list_url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED
        assert Route.objects.filter(name="Admin's New Route").exists()
        new_route = Route.objects.get(name="Admin's New Route")
        assert new_route.gpx_file is not None
        assert new_route.points_of_interest.count() == 1

    def test_route_create_duplicate_name_fails(
        self, api_client, admin_user, sample_route
    ):
        """Verify creating a route with a duplicate name fails."""
        authenticate_client(api_client, admin_user)
        data = {
            "name": sample_route.name,
            "distance_km": 5.0,
            "duration": "1h",
            "difficulty": "Easy",
            "altitude_min_m": 1,
            "altitude_max_m": 2,
            "accumulated_climb_m": 1,
            "description": "dup",
        }
        response = api_client.post(self.list_url, data, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_route_delete_admin(self, api_client, admin_user, sample_route):
        """Verify admin can delete a route."""
        authenticate_client(api_client, admin_user)
        response = api_client.delete(self.detail_url(sample_route.id))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Route.objects.filter(id=sample_route.id).exists()
