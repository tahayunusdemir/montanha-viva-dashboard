from django.db import models
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image, ImageDraw

# Create your models here.

class QRCode(models.Model):
    name = models.CharField(max_length=255, help_text="QR Kodun adı (örn: Ana Giriş QR)")
    text_content = models.CharField(max_length=500, unique=True, help_text="QR kodun içerdiği metin veya URL")
    points = models.PositiveIntegerField(default=10, help_text="Bu QR kod okutulduğunda kazanılacak puan")
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.qr_image:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.text_content)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

            # Prepare to save the image
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            file_name = f'qr_code-{self.name}-{self.id}.png'
            self.qr_image.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserScannedQR(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scanned_qrs")
    qr_code = models.ForeignKey(QRCode, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'qr_code') 

class DiscountCoupon(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coupons")
    code = models.CharField(max_length=50, unique=True)
    points_spent = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Coupon {self.code} for {self.user.email}"
