from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import QRCode, UserScannedQR, DiscountCoupon
from .serializers import QRCodeSerializer, ScanSerializer, UserScannedQRSerializer, DiscountCouponSerializer
from django.utils import timezone
import uuid
from datetime import timedelta

# Create your views here.

class QRCodeViewSet(viewsets.ModelViewSet):
    """ Adminler için QR Kod CRUD işlemleri """
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAdminUser]

class ScanQRCodeAPIView(generics.GenericAPIView):
    """ Kullanıcının QR kod okutmasını işleyen endpoint """
    serializer_class = ScanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text_content = serializer.validated_data['text_content']

        try:
            qr_code = QRCode.objects.get(text_content=text_content)
        except QRCode.DoesNotExist:
            return Response({"error": "Geçersiz veya tanınmayan QR kod."}, status=status.HTTP_404_NOT_FOUND)

        if UserScannedQR.objects.filter(user=request.user, qr_code=qr_code).exists():
            return Response({"message": "Bu QR kodu daha önce zaten okuttunuz."}, status=status.HTTP_200_OK)

        request.user.points += qr_code.points
        request.user.save(update_fields=['points'])
        UserScannedQR.objects.create(user=request.user, qr_code=qr_code)

        return Response({
            "message": f"{qr_code.points} puan kazandınız!",
            "new_total_points": request.user.points
        }, status=status.HTTP_200_OK)

class RewardsAPIView(generics.GenericAPIView):
    """ Kullanıcının puanlarını, geçmiş taramalarını ve kuponlarını döndürür """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        scanned_qrs = UserScannedQR.objects.filter(user=user).order_by('-scanned_at')
        coupons = DiscountCoupon.objects.filter(user=user).order_by('-created_at')

        return Response({
            'points': user.points,
            'scan_history': UserScannedQRSerializer(scanned_qrs, many=True).data,
            'coupon_history': DiscountCouponSerializer(coupons, many=True).data
        })

class GenerateCouponAPIView(generics.GenericAPIView):
    """ Puanları kullanarak indirim kuponu oluşturur """
    permission_classes = [permissions.IsAuthenticated]
    POINTS_FOR_COUPON = 100

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.points < self.POINTS_FOR_COUPON:
            return Response({"error": "İndirim kuponu oluşturmak için yeterli puanınız yok."}, status=status.HTTP_400_BAD_REQUEST)

        user.points -= self.POINTS_FOR_COUPON
        user.save(update_fields=['points'])

        coupon = DiscountCoupon.objects.create(
            user=user,
            code=f"DISCOUNT-{uuid.uuid4().hex[:8].upper()}",
            points_spent=self.POINTS_FOR_COUPON,
            expires_at=timezone.now() + timedelta(days=30)
        )

        return Response(DiscountCouponSerializer(coupon).data, status=status.HTTP_201_CREATED)
