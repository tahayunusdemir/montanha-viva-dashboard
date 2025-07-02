from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import QRCode, UserScannedQR, DiscountCoupon

User = get_user_model()


class QRAppTests(APITestCase):
    """ Test suite for the QR code application. """

    def setUp(self):
        """ Set up test data and users. """
        # Create a regular user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )

        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword123',
            first_name='Admin',
            last_name='User'
        )

        # Create a QR Code for testing
        self.qr_code = QRCode.objects.create(
            name="Test QR Code",
            text_content="unique-qr-string-123",
            points=50
        )

        # URLs
        self.scan_url = reverse('scan-qr')
        self.rewards_url = reverse('rewards')
        self.generate_coupon_url = reverse('generate-coupon')
        self.qrcode_list_url = reverse('qrcode-list')

    def test_unauthenticated_user_cannot_scan(self):
        """ Ensure unauthenticated users receive a 401 Unauthorized response. """
        response = self.client.post(self.scan_url, {'text_content': 'some-content'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_scan_qr_code(self):
        """ Test a successful QR code scan by an authenticated user. """
        self.client.force_authenticate(user=self.user)
        initial_points = self.user.points

        response = self.client.post(self.scan_url, {'text_content': self.qr_code.text_content})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], f"{self.qr_code.points} puan kazandınız!")

        # Refresh user from DB to get updated points
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, initial_points + self.qr_code.points)
        self.assertTrue(UserScannedQR.objects.filter(user=self.user, qr_code=self.qr_code).exists())
        self.assertEqual(response.data['new_total_points'], self.user.points)

    def test_user_cannot_scan_same_qr_code_twice(self):
        """ Ensure a user cannot get points for scanning the same QR code multiple times. """
        self.client.force_authenticate(user=self.user)

        # First scan
        self.client.post(self.scan_url, {'text_content': self.qr_code.text_content})
        points_after_first_scan = self.user.points

        # Second scan
        response = self.client.post(self.scan_url, {'text_content': self.qr_code.text_content})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Bu QR kodu daha önce zaten okuttunuz.")

        self.user.refresh_from_db()
        self.assertEqual(self.user.points, points_after_first_scan)

    def test_scan_invalid_qr_code(self):
        """ Test scanning a QR code that does not exist. """
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.scan_url, {'text_content': 'non-existent-qr'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], "Geçersiz veya tanınmayan QR kod.")

    def test_get_rewards_history(self):
        """ Test fetching the rewards and scan history for a user. """
        self.client.force_authenticate(user=self.user)

        # Scan a code first
        self.client.post(self.scan_url, {'text_content': self.qr_code.text_content})
        self.user.refresh_from_db()

        response = self.client.get(self.rewards_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['points'], self.qr_code.points)
        self.assertEqual(len(response.data['scan_history']), 1)
        self.assertEqual(response.data['scan_history'][0]['qr_code']['name'], self.qr_code.name)
        self.assertEqual(len(response.data['coupon_history']), 0)

    def test_generate_coupon_with_insufficient_points(self):
        """ Test trying to generate a coupon without enough points. """
        self.client.force_authenticate(user=self.user)
        self.user.points = 50  # Less than 100 required
        self.user.save()

        response = self.client.post(self.generate_coupon_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "İndirim kuponu oluşturmak için yeterli puanınız yok.")

    def test_generate_coupon_with_sufficient_points(self):
        """ Test successfully generating a coupon. """
        self.client.force_authenticate(user=self.user)
        self.user.points = 150
        self.user.save()

        response = self.client.post(self.generate_coupon_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('code' in response.data)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 50) # 150 - 100
        self.assertTrue(DiscountCoupon.objects.filter(user=self.user).exists())

    def test_admin_can_list_qrcodes(self):
        """ Ensure an admin user can list all QR codes. """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.qrcode_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_regular_user_cannot_list_qrcodes(self):
        """ Ensure a regular user gets a 403 Forbidden response. """
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.qrcode_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_qrcode(self):
        """ Test that an admin can create a new QR code. """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'New Entrance QR',
            'text_content': 'entrance-unique-string',
            'points': 25
        }
        response = self.client.post(self.qrcode_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QRCode.objects.count(), 2)

    def test_regular_user_cannot_create_qrcode(self):
        """ Test that a regular user cannot create a new QR code. """
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Attempted QR',
            'text_content': 'hacker-string',
            'points': 1000
        }
        response = self.client.post(self.qrcode_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
