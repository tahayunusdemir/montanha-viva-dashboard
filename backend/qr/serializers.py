from rest_framework import serializers
from .models import QRCode, UserScannedQR, DiscountCoupon


class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ["id", "name", "text_content", "points", "qr_image", "created_at"]
        read_only_fields = ["qr_image", "created_at"]


class ScanSerializer(serializers.Serializer):
    text_content = serializers.CharField(max_length=500)


class UserScannedQRSerializer(serializers.ModelSerializer):
    qr_code = QRCodeSerializer(read_only=True)

    class Meta:
        model = UserScannedQR
        fields = ["id", "qr_code", "scanned_at"]


class DiscountCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCoupon
        fields = ["id", "code", "points_spent", "created_at", "expires_at", "is_used"]
