from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QRCodeViewSet, ScanQRCodeAPIView, RewardsAPIView, GenerateCouponAPIView

router = DefaultRouter()
router.register(r'qrcodes', QRCodeViewSet, basename='qrcode')

urlpatterns = [
    path('', include(router.urls)),
    path('scan/', ScanQRCodeAPIView.as_view(), name='scan-qr'),
    path('rewards/', RewardsAPIView.as_view(), name='rewards'),
    path('generate-coupon/', GenerateCouponAPIView.as_view(), name='generate-coupon'),
] 