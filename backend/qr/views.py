from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import QRCode, UserScannedQR, DiscountCoupon
from .serializers import (
    QRCodeSerializer,
    ScanSerializer,
    UserScannedQRSerializer,
    DiscountCouponSerializer,
)
from django.utils import timezone
import uuid
from datetime import timedelta

# Views for QR code functionality


class QRCodeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for administrators to perform CRUD operations on QR codes.
    Only users with admin privileges can access these endpoints.
    """

    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAdminUser]


class ScanQRCodeAPIView(generics.GenericAPIView):
    """
    API endpoint for users to scan a QR code.
    When a user scans a valid QR code, they earn points.
    If the QR code has already been scanned by the user, a message is returned.
    """

    serializer_class = ScanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text_content = serializer.validated_data["text_content"]

        try:
            qr_code = QRCode.objects.get(text_content=text_content)
        except QRCode.DoesNotExist:
            return Response(
                {"error": "Invalid or unrecognized QR code."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if the user has already scanned this QR code
        if UserScannedQR.objects.filter(user=request.user, qr_code=qr_code).exists():
            return Response(
                {"message": "You have already scanned this QR code."},
                status=status.HTTP_200_OK,
            )

        # Award points to the user
        request.user.points += qr_code.points
        request.user.save(update_fields=["points"])
        # Record the scan event
        UserScannedQR.objects.create(user=request.user, qr_code=qr_code)

        return Response(
            {
                "message": f"You have earned {qr_code.points} points!",
                "new_total_points": request.user.points,
            },
            status=status.HTTP_200_OK,
        )


class RewardsAPIView(generics.GenericAPIView):
    """
    API endpoint to retrieve the user's current points,
    scan history, and coupon history.
    Only authenticated users can access this endpoint.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        scanned_qrs = UserScannedQR.objects.filter(user=user).order_by("-scanned_at")
        coupons = DiscountCoupon.objects.filter(user=user).order_by("-created_at")

        return Response(
            {
                "points": user.points,
                "scan_history": UserScannedQRSerializer(scanned_qrs, many=True).data,
                "coupon_history": DiscountCouponSerializer(coupons, many=True).data,
            }
        )


class GenerateCouponAPIView(generics.GenericAPIView):
    """
    API endpoint to generate a discount coupon by spending points.
    Users must have at least POINTS_FOR_COUPON points to generate a coupon.
    The coupon is valid for 30 days from creation.
    """

    permission_classes = [permissions.IsAuthenticated]
    POINTS_FOR_COUPON = 100

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.points < self.POINTS_FOR_COUPON:
            return Response(
                {"error": "You do not have enough points to generate a discount coupon."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Deduct points from the user
        user.points -= self.POINTS_FOR_COUPON
        user.save(update_fields=["points"])

        # Create a new discount coupon
        coupon = DiscountCoupon.objects.create(
            user=user,
            code=f"DISCOUNT-{uuid.uuid4().hex[:8].upper()}",
            points_spent=self.POINTS_FOR_COUPON,
            expires_at=timezone.now() + timedelta(days=30),
        )

        return Response(
            DiscountCouponSerializer(coupon).data, status=status.HTTP_201_CREATED
        )
