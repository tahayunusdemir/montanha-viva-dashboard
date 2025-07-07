import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_password():
    return "strong-password-123"


@pytest.fixture
def normal_user_data(test_password):
    return {
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": test_password,
    }


@pytest.fixture
def normal_user(normal_user_data):
    return User.objects.create_user(**normal_user_data)


@pytest.fixture
def admin_user_data(test_password):
    return {
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "password": test_password,
        "is_staff": True,
    }


@pytest.fixture
def admin_user(admin_user_data):
    return User.objects.create_user(**admin_user_data)


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_user_success(self, api_client, normal_user_data):
        url = reverse("user-register")
        response = api_client.post(url, normal_user_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert "user" in response.data
        assert response.data["user"]["email"] == normal_user_data["email"]
        assert "refresh_token" in response.cookies

    def test_register_user_duplicate_email(
        self, api_client, normal_user, normal_user_data
    ):
        url = reverse("user-register")
        response = api_client.post(url, normal_user_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self, api_client, normal_user, test_password):
        url = reverse("token_obtain_pair")
        data = {"email": normal_user.email, "password": test_password}
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "user" in response.data
        assert "refresh_token" in response.cookies

    def test_login_fail_wrong_password(self, api_client, normal_user):
        url = reverse("token_obtain_pair")
        data = {"email": normal_user.email, "password": "wrong-password"}
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_access_protected_endpoint_with_token(self, api_client, normal_user):
        api_client.force_authenticate(user=normal_user)
        url = reverse("user-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == normal_user.email

    def test_access_protected_endpoint_no_token(self, api_client):
        url = reverse("user-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout(self, api_client, normal_user_data, test_password):
        # First, log in to get the cookie
        login_url = reverse("token_obtain_pair")
        # We need to create the user with the actual password to log in
        user = User.objects.create_user(
            email=normal_user_data["email"],
            first_name=normal_user_data["first_name"],
            last_name=normal_user_data["last_name"],
            password=test_password,
        )
        login_data = {"email": user.email, "password": test_password}
        login_response = api_client.post(login_url, login_data, format="json")
        assert login_response.status_code == status.HTTP_200_OK

        # Now, try to logout
        api_client.force_authenticate(user=user)
        logout_url = reverse("user-logout")
        response = api_client.post(logout_url)

        # It should clear the cookie
        assert response.status_code == status.HTTP_205_RESET_CONTENT
        assert response.cookies["refresh_token"].value == ""


@pytest.mark.django_db
class TestAdminUserManagement:
    def test_admin_can_list_users(self, api_client, admin_user, normal_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2  # Admin and normal user

    def test_normal_user_cannot_list_users(self, api_client, normal_user):
        api_client.force_authenticate(user=normal_user)
        url = reverse("admin-user-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_update_user_details(self, api_client, admin_user, normal_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-detail", kwargs={"pk": normal_user.pk})
        data = {
            "is_staff": True,
            "is_active": False,
            "first_name": "UpdatedFirst",
            "points": 100,
        }
        response = api_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        normal_user.refresh_from_db()
        assert normal_user.is_staff is True
        assert normal_user.is_active is False
        assert normal_user.first_name == "UpdatedFirst"
        assert normal_user.points == 100

    def test_admin_can_update_user_password(self, api_client, admin_user, normal_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-detail", kwargs={"pk": normal_user.pk})
        new_password = "new-strong-password-456"
        data = {
            "password": new_password,
            "re_password": new_password,
        }
        response = api_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        normal_user.refresh_from_db()
        assert normal_user.check_password(new_password)

    def test_admin_can_delete_user(self, api_client, admin_user, normal_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("admin-user-detail", kwargs={"pk": normal_user.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=normal_user.pk).exists()
