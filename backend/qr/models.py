from django.db import models
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

# Models for QR code system

class QRCode(models.Model):
    """
    Represents a QR code entity in the system.

    Fields:
        name (str): The display name of the QR code (e.g., "Main Entrance QR").
        text_content (str): The text or URL encoded in the QR code. Must be unique.
        points (int): The number of points awarded when this QR code is scanned.
        qr_image (Image): The generated QR code image file.
        created_at (datetime): Timestamp when the QR code was created.
    """
    name = models.CharField(
        max_length=255,
        help_text="The name of the QR code (e.g., Main Entrance QR)"
    )
    text_content = models.CharField(
        max_length=500,
        unique=True,
        help_text="The text or URL encoded in the QR code"
    )
    points = models.PositiveIntegerField(
        default=10,
        help_text="Points awarded when this QR code is scanned"
    )
    qr_image = models.ImageField(
        upload_to="qr_codes/",
        blank=True,
        help_text="The generated QR code image"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the QR code was created"
    )

    def save(self, *args, **kwargs):
        """
        Overrides the default save method to automatically generate and save
        a QR code image if it does not already exist.
        """
        if not self.qr_image:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.text_content)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

            buffer = BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            # Use the object's id if available, otherwise use 'new'
            file_id = self.id if self.id else "new"
            file_name = f"qr_code-{self.name}-{file_id}.png"
            self.qr_image.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class UserScannedQR(models.Model):
    """
    Represents the relationship between a user and a scanned QR code.

    Fields:
        user (User): The user who scanned the QR code.
        qr_code (QRCode): The QR code that was scanned.
        scanned_at (datetime): Timestamp when the QR code was scanned.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="scanned_qrs",
        help_text="The user who scanned the QR code"
    )
    qr_code = models.ForeignKey(
        QRCode,
        on_delete=models.CASCADE,
        help_text="The QR code that was scanned"
    )
    scanned_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the QR code was scanned"
    )

    class Meta:
        unique_together = ("user", "qr_code")
        verbose_name = "User Scanned QR"
        verbose_name_plural = "User Scanned QRs"

    def __str__(self):
        return f"{self.user} scanned {self.qr_code} at {self.scanned_at}"


class DiscountCoupon(models.Model):
    """
    Represents a discount coupon that a user can redeem using points.

    Fields:
        user (User): The user who owns the coupon.
        code (str): The unique coupon code.
        points_spent (int): The number of points spent to obtain the coupon.
        created_at (datetime): Timestamp when the coupon was created.
        expires_at (datetime): Expiration date and time of the coupon.
        is_used (bool): Whether the coupon has been used.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coupons",
        help_text="The user who owns the coupon"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="The unique code for the discount coupon"
    )
    points_spent = models.PositiveIntegerField(
        default=100,
        help_text="Points spent to obtain this coupon"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the coupon was created"
    )
    expires_at = models.DateTimeField(
        help_text="Expiration date and time of the coupon"
    )
    is_used = models.BooleanField(
        default=False,
        help_text="Indicates whether the coupon has been used"
    )

    def __str__(self):
        return f"Coupon {self.code} for {self.user.email}"
