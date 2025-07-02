from django.test import TestCase
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser
from .models import Feedback

# Mark all tests in this file as Django DB tests
pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    """Fixture for API client."""
    return APIClient()


@pytest.fixture
def regular_user():
    """Fixture for a regular user."""
    return CustomUser.objects.create_user(
        email="user@example.com",
        password="password123",
        first_name="Regular",
        last_name="User",
    )


@pytest.fixture
def another_user():
    """Fixture for another regular user."""
    return CustomUser.objects.create_user(
        email="another@example.com",
        password="password123",
        first_name="Another",
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


class TestFeedbackListCreateView:
    """Tests for the FeedbackListCreateView."""

    def test_unauthenticated_user_cannot_access(self, api_client):
        """Verify unauthenticated users get 401 Unauthorized."""
        url = reverse("feedback-list-create")
        # Test GET
        response_get = api_client.get(url)
        assert response_get.status_code == status.HTTP_401_UNAUTHORIZED
        # Test POST
        response_post = api_client.post(url, {})
        assert response_post.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_create_feedback(self, api_client, regular_user):
        """Verify authenticated users can create feedback."""
        api_client.force_authenticate(user=regular_user)
        url = reverse("feedback-list-create")
        data = {
            "subject": "Test Subject",
            "message": "This is a test message.",
            "category": "bug",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Feedback.objects.count() == 1
        feedback = Feedback.objects.first()
        assert feedback.user == regular_user
        assert feedback.subject == "Test Subject"

    def test_authenticated_user_can_list_own_feedback(
        self, api_client, regular_user, another_user
    ):
        """Verify users can only see their own feedback."""
        # Create feedback for both users
        Feedback.objects.create(
            user=regular_user, subject="My Feedback", message="This is mine."
        )
        Feedback.objects.create(
            user=another_user, subject="Another's Feedback", message="This is not mine."
        )

        # Authenticate as the regular user
        api_client.force_authenticate(user=regular_user)
        url = reverse("feedback-list-create")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["subject"] == "My Feedback"
        assert response.data[0]["user_details"]["email"] == regular_user.email


class TestAdminFeedbackViews:
    """Tests for admin-only feedback views."""

    @pytest.fixture(autouse=True)
    def setup(self, regular_user, another_user, admin_user):
        """Create sample feedback for tests."""
        self.feedback1 = Feedback.objects.create(
            user=regular_user,
            subject="Bug Report",
            message="Something is broken",
            status="pending",
        )
        self.feedback2 = Feedback.objects.create(
            user=another_user,
            subject="Feature Request",
            message="Please add this",
            status="in_progress",
        )
        self.feedback_anon = Feedback.objects.create(
            name="Anonymous",
            email="anon@test.com",
            subject="General Inquiry",
            message="A question.",
            status="pending",
        )
        self.list_url = reverse("admin-feedback-list")
        self.detail_url = reverse(
            "admin-feedback-detail", kwargs={"pk": self.feedback1.pk}
        )

    def test_regular_user_cannot_access_admin_endpoints(self, api_client, regular_user):
        """Verify regular users get 403 Forbidden."""
        api_client.force_authenticate(user=regular_user)
        # Test List View
        response_list = api_client.get(self.list_url)
        assert response_list.status_code == status.HTTP_403_FORBIDDEN
        # Test Detail View
        response_detail = api_client.get(self.detail_url)
        assert response_detail.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_user_cannot_access_admin_endpoints(self, api_client):
        """Verify unauthenticated users get 401 Unauthorized."""
        response_list = api_client.get(self.list_url)
        assert response_list.status_code == status.HTTP_401_UNAUTHORIZED
        response_detail = api_client.get(self.detail_url)
        assert response_detail.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_can_list_all_feedback(self, api_client, admin_user):
        """Verify admin can see all feedback entries."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == Feedback.objects.count()

    def test_admin_can_filter_feedback_by_status(self, api_client, admin_user):
        """Verify admin can filter feedback by status."""
        api_client.force_authenticate(user=admin_user)
        url = f"{self.list_url}?status=in_progress"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["subject"] == "Feature Request"

    def test_admin_can_search_feedback_by_user(self, api_client, admin_user):
        """Verify admin can search by user's first name."""
        api_client.force_authenticate(user=admin_user)
        url = f"{self.list_url}?search=Regular"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["subject"] == "Bug Report"

    def test_admin_can_search_feedback_by_email(self, api_client, admin_user):
        """Verify admin can search by anonymous email."""
        api_client.force_authenticate(user=admin_user)
        url = f"{self.list_url}?search=anon@test.com"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["subject"] == "General Inquiry"

    def test_admin_can_retrieve_feedback_detail(self, api_client, admin_user):
        """Verify admin can retrieve a single feedback entry."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(self.detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["subject"] == self.feedback1.subject

    def test_admin_can_update_feedback(self, api_client, admin_user):
        """Verify admin can update a feedback entry."""
        api_client.force_authenticate(user=admin_user)
        data = {"status": "resolved"}
        response = api_client.patch(self.detail_url, data)
        assert response.status_code == status.HTTP_200_OK
        self.feedback1.refresh_from_db()
        assert self.feedback1.status == "resolved"

    def test_admin_can_delete_feedback(self, api_client, admin_user):
        """Verify admin can delete a feedback entry."""
        api_client.force_authenticate(user=admin_user)
        count_before = Feedback.objects.count()
        response = api_client.delete(self.detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Feedback.objects.count() == count_before - 1
