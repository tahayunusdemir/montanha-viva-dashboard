from django.contrib import admin
from .models import QRCode, UserScannedQR, DiscountCoupon

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'points', 'created_at')
    readonly_fields = ('qr_image',)

@admin.register(UserScannedQR)
class UserScannedQRAdmin(admin.ModelAdmin):
    list_display = ('user', 'qr_code', 'scanned_at')
    list_filter = ('qr_code',)

@admin.register(DiscountCoupon)
class DiscountCouponAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'points_spent', 'created_at', 'expires_at', 'is_used')
    list_filter = ('is_used', 'user')
