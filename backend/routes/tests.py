import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from users.models import CustomUser
from .models import Route

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


# --- RouteViewSet Tests ---


@pytest.fixture
def sample_route():
    """Fixture for a sample Route."""
    return Route.objects.create(
        name="Sample Route Alpha",
        distance_km=10.5,
        duration="3h",
        route_type="circular",
        difficulty="Medium",
        altitude_min_m=100,
        altitude_max_m=500,
        accumulated_climb_m=400,
        description="A beautiful sample route with pine trees.",
        points_of_interest="Viewpoint, Waterfall, Old Bridge",
        image_card=SimpleUploadedFile(
            "card.jpg", b"file_content", content_type="image/jpeg"
        ),
        image_map=SimpleUploadedFile(
            "map.jpg", b"file_content", content_type="image/jpeg"
        ),
    )


@pytest.fixture
def another_sample_route():
    """Fixture for another sample Route for filtering tests."""
    return Route.objects.create(
        name="Sample Route Beta",
        distance_km=5.0,
        duration="1h",
        route_type="linear",
        difficulty="Easy",
        altitude_min_m=50,
        altitude_max_m=150,
        accumulated_climb_m=100,
        description="An easy walk near the lake.",
        points_of_interest="Lake, Picnic Area",
        image_card=SimpleUploadedFile(
            "card2.jpg", b"file_content", content_type="image/jpeg"
        ),
        image_map=SimpleUploadedFile(
            "map2.jpg", b"file_content", content_type="image/jpeg"
        ),
    )


class TestPublicRouteViewSet:
    """Tests for the public-facing Route viewset."""

    list_url = reverse("public-route-list")

    def detail_url(self, route_id):
        return reverse("public-route-detail", args=[route_id])

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
        assert response.data["points_of_interest"] == "Viewpoint, Waterfall, Old Bridge"

    def test_search_routes(self, api_client, sample_route, another_sample_route):
        """Verify searching for routes by name or description works."""
        response = api_client.get(self.list_url, {"search": "pine trees"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Sample Route Alpha"

    def test_filter_routes_by_difficulty(
        self, api_client, sample_route, another_sample_route
    ):
        """Verify filtering routes by difficulty works."""
        response = api_client.get(self.list_url, {"difficulty": "Easy"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Sample Route Beta"


class TestAdminRouteViewSet:
    """Tests for the admin-only Route viewset."""

    list_url = reverse("admin-route-list")

    def detail_url(self, route_id):
        return reverse("admin-route-detail", args=[route_id])

    # Permission tests
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
    def test_route_create_admin(self, api_client, admin_user):
        """Verify admin can create a route with file uploads."""
        authenticate_client(api_client, admin_user)

        gif_content = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
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
            "points_of_interest": "Start Point, Summit, End Point",
            "image_card": image_card,
            "image_map": image_map,
            "gpx_file": gpx_file,
        }

        response = api_client.post(self.list_url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED
        assert Route.objects.filter(name="Admin's New Route").exists()
        new_route = Route.objects.get(name="Admin's New Route")
        assert new_route.gpx_file is not None
        assert new_route.points_of_interest == "Start Point, Summit, End Point"

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
            "route_type": "circular",
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
