import os
import shutil
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.conf import settings
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
from pathlib import Path

from .models import Plant, PlantImage

User = get_user_model()


class FloraAPITestCase(APITestCase):
    """
    Test suite for the Flora API endpoints.
    """

    media_temp_dir: tempfile.TemporaryDirectory

    @classmethod
    def setUpClass(cls):
        """
        Set up the database and environment for the entire test class.
        This runs once before all tests.
        """
        super().setUpClass()
        # Create a temporary directory for media files
        cls.media_temp_dir = tempfile.TemporaryDirectory()
        # Override MEDIA_ROOT to use the temporary directory
        settings.MEDIA_ROOT = cls.media_temp_dir.name

    @classmethod
    def tearDownClass(cls):
        """
        Clean up after all tests in the class have run.
        This runs once after all tests.
        """
        super().tearDownClass()
        # Clean up the temporary media directory
        cls.media_temp_dir.cleanup()

    def setUp(self):
        """
        Set up the necessary users and authentication for each test.
        This runs before every single test method.
        """
        # Create users
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
        )
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="password123",
            first_name="Admin",
            last_name="User",
        )

        # URLs
        self.plants_list_url = reverse("plant-list")
        self.upload_image_url = reverse("plant-upload-image")

    def _get_detail_url(self, plant_id):
        """Helper to get the detail URL for a plant."""
        return reverse("plant-detail", kwargs={"pk": plant_id})

    def _create_dummy_image(self):
        """Helper to create a simple dummy image for testing uploads."""
        return SimpleUploadedFile(
            "test_image.jpg", b"file_content", content_type="image/jpeg"
        )

    # === Permission Tests ===

    def test_list_plants_is_public(self):
        """
        Ensure anyone can list plants.
        """
        response = self.client.get(self.plants_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_plant_requires_admin(self):
        """
        Ensure only admin users can create a plant.
        """
        plant_data = {"scientific_name": "Testus plantus", "common_names": "Test Plant"}

        # Unauthenticated
        response = self.client.post(self.plants_list_url, plant_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated non-admin user
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.plants_list_url, plant_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin user
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.plants_list_url, plant_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # === CRUD Tests ===

    def test_admin_can_upload_image(self):
        """
        Ensure an admin can upload a plant image.
        """
        self.client.force_authenticate(user=self.admin_user)
        image = self._create_dummy_image()
        response = self.client.post(
            self.upload_image_url, {"image": image}, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIn("image", response.data)
        # Check if the file was actually created
        self.assertTrue(PlantImage.objects.filter(id=response.data["id"]).exists())

    def test_admin_can_create_plant_with_images(self):
        """
        Ensure an admin can create a plant and associate uploaded images.
        """
        self.client.force_authenticate(user=self.admin_user)

        # 1. Upload images first
        image1 = self._create_dummy_image()
        image2 = self._create_dummy_image()
        response1 = self.client.post(
            self.upload_image_url, {"image": image1}, format="multipart"
        )
        response2 = self.client.post(
            self.upload_image_url, {"image": image2}, format="multipart"
        )
        image_ids = [response1.data["id"], response2.data["id"]]

        # 2. Create plant and pass image IDs
        plant_data = {
            "scientific_name": "Testus photogenicus",
            "common_names": "Photogenic Plant",
            "interaction_fauna": "Attracts cameras.",
            "food_uses": "Is delicious in photos.",
            "uploaded_image_ids": image_ids,
        }
        response = self.client.post(self.plants_list_url, plant_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Plant.objects.count(), 1)
        plant = Plant.objects.first()
        self.assertEqual(plant.images.count(), 2)
        self.assertEqual(plant.scientific_name, plant_data["scientific_name"])

        # Check that the 'uses' field is correctly generated
        self.assertIn("uses", response.data)
        self.assertTrue(response.data["uses"]["fauna_interaction"])
        self.assertTrue(response.data["uses"]["food"])
        self.assertFalse(response.data["uses"]["medicinal"])

    def test_admin_can_update_plant(self):
        """
        Ensure an admin can fully update a plant.
        """
        # Create a plant first
        plant = Plant.objects.create(
            scientific_name="Original Name", common_names="Old"
        )
        detail_url = self._get_detail_url(plant.id)

        update_data = {
            "scientific_name": "Updated Name",
            "common_names": "New",
            "interaction_fauna": "Updated interaction",
        }
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.put(detail_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        plant.refresh_from_db()
        self.assertEqual(plant.scientific_name, "Updated Name")
        self.assertEqual(plant.interaction_fauna, "Updated interaction")

    def test_admin_can_delete_plant(self):
        """
        Ensure an admin can delete a plant.
        """
        plant = Plant.objects.create(scientific_name="ToDelete", common_names="Delete")
        detail_url = self._get_detail_url(plant.id)

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Plant.objects.count(), 0)

    # === Validation Tests ===

    def test_cannot_create_plant_with_duplicate_scientific_name(self):
        """
        Ensure creating a plant with a duplicate scientific name fails.
        """
        Plant.objects.create(scientific_name="Uniqueus namus", common_names="Unique")

        plant_data = {"scientific_name": "Uniqueus namus", "common_names": "Duplicate"}
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.plants_list_url, plant_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scientific_name", response.data)

    # === Management Command Test ===

    def test_load_flora_data_command(self):
        """
        Test the custom management command 'load_flora_data'.
        This test now relies on the corrected BASE_DIR setting.
        """
        # With the settings fixed, BASE_DIR should be '/app'.
        # We create a mock frontend asset structure for the command to read from.
        source_assets_path = (
            Path(settings.BASE_DIR) / "frontend" / "src" / "assets" / "plants_image"
        )
        mock_asset_dir = source_assets_path / "Arbutusunedo"
        os.makedirs(mock_asset_dir, exist_ok=True)

        # Create dummy image files for the command to copy
        dummy_image_names = [
            "Arbutusunedo.png",
            "Arbutusunedo2.png",
            "Arbutusunedo3.png",
        ]
        for name in dummy_image_names:
            path = mock_asset_dir / name
            with open(path, "w") as f:
                f.write("dummy_image_content")

        # Run the management command
        call_command("load_flora_data")

        # Check if the data was loaded correctly
        self.assertTrue(Plant.objects.filter(scientific_name="Arbutus unedo").exists())
        self.assertEqual(Plant.objects.count(), 15)

        arbutus = Plant.objects.get(scientific_name="Arbutus unedo")
        self.assertEqual(arbutus.images.count(), 3)

        # Verify the image was copied to the (test) media root
        first_image = arbutus.images.first()
        self.assertIsNotNone(first_image)
        copied_image_path = Path(settings.MEDIA_ROOT) / first_image.image.name
        self.assertTrue(copied_image_path.exists())

        # Clean up the mock asset directory
        shutil.rmtree(source_assets_path)
