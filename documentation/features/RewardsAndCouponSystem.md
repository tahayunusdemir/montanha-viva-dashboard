# Rewards & Coupon System Feature

This document outlines the implementation for a rewards system where users can convert accumulated points into redeemable discount coupons.

## 1. Core Functionality

- **As a User,** I want to earn points for specific actions, like scanning QR codes.
- **As a User,** I want to see my current point balance in my profile.
- **As a User,** when I accumulate enough points, I want to convert them into a discount coupon.
- **As a User,** I want to view my active and redeemed coupons.
- **As a User,** I want to present my active coupon (e.g., as a code or QR code) at a partner store to receive a discount.
- **As an Admin/Partner,** I need a simple interface to validate and redeem a user's coupon.

---

## 2. Backend Implementation (Django REST Framework)

A new Django app, `rewards`, will be created to manage all coupon-related logic.

### 2.1. New Model (`rewards/models.py`)

This model stores the generated coupons.

```python
from django.db import models
from django.conf import settings
import uuid
from .utils import generate_coupon_code # A utility function to create a random code

class Coupon(models.Model):
    class CouponStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        REDEEMED = 'REDEEMED', 'Redeemed'
        EXPIRED = 'EXPIRED', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupons')
    code = models.CharField(max_length=20, unique=True, blank=True)

    points_cost = models.PositiveIntegerField(help_text="Points spent to generate this coupon.")
    discount_value = models.DecimalField(max_digits=6, decimal_places=2, help_text="The monetary value of the discount.")

    status = models.CharField(max_length=10, choices=CouponStatus.choices, default=CouponStatus.ACTIVE)

    created_at = models.DateTimeField(auto_now_add=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_coupon_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Coupon {self.code} for {self.user.email}"
```

### 2.2. API Endpoints (`rewards/urls.py`)

A `CouponsViewSet` will be created to handle all coupon-related actions, ensuring consistency with the admin architecture.

| Method | Endpoint                            | ViewSet/View          | Action     | Name                  | Description                                    |
| :----- | :---------------------------------- | :-------------------- | :--------- | :-------------------- | :--------------------------------------------- |
| `GET`  | `/api/rewards/my-coupons/`          | `UserCouponListView`  | -          | `list-user-coupons`   | Lists all coupons for the logged-in user.      |
| `POST` | `/api/rewards/generate-coupon/`     | `GenerateCouponView`  | -          | `generate-coupon`     | User spends points to create a new coupon.     |
| `GET`  | `/api/admin/coupons/{code}/`        | `AdminCouponsViewSet` | `retrieve` | `admin-lookup-coupon` | **Admin Only.** Looks up a coupon by its code. |
| `POST` | `/api/admin/coupons/{code}/redeem/` | `AdminCouponsViewSet` | `redeem`   | `admin-redeem-coupon` | **Admin Only.** Marks a coupon as redeemed.    |

### 2.3. System Settings & Logic

- **Conversion Rate:** A setting in `core/settings.py` will define the conversion rule.
  `REWARD_SETTINGS = {'POINTS_FOR_COUPON': 100, 'COUPON_VALUE_EUR': 5.00}`
- **`GenerateCouponView` Logic:**
  1.  Check if `user.points >= settings.REWARD_SETTINGS['POINTS_FOR_COUPON']`.
  2.  If yes, deduct points: `user.points -= points_cost`.
  3.  Create a new `Coupon` with the defined value and an expiration date (e.g., 90 days).
  4.  Log the activity: `create_activity(user, UserActivity.ActivityType.COUPON_GENERATED, ...)`
  5.  Return the new coupon's details.
- **`RedeemCouponView` Logic (now part of `AdminCouponsViewSet`):**
  1.  An admin provides a coupon `code`.
  2.  The `redeem` action finds the `Coupon`.
  3.  If the coupon is `ACTIVE`, its status is changed to `REDEEMED`.
  4.  Log the redemption activity: `create_activity(user, UserActivity.ActivityType.COUPON_REDEEMED, details={'coupon_id': coupon.id, 'admin_user_id': request.user.id})`.
  5.  Return a success message.

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. New Page (`pages/RewardsPage.tsx`)

A new protected route at `/rewards` will be created.

- **Displays:**
  - User's current point total.
  - A clear call-to-action: "Convert 100 Points for a €5 Coupon".
  - A button to trigger the conversion, which calls the `generate-coupon` API.
  - A list of "My Coupons", separated into "Active" and "Used/Expired" tabs.
- **`CouponCard` Component:**
  - Shows the `code` prominently.
  - Displays the `discount_value` and `expires_at`.
  - For active coupons, it could also display a QR code representing the coupon code for easy scanning at the store.

### 3.2. Admin Redemption UI (`pages/admin/RedeemCouponPage.tsx`)

A simple, protected page for partners/admins at `/admin/redeem` will be built using the reusable components from the **Admin Toolkit**.

- **Layout & Functionality:**
  - The page will be rendered within the main `AdminLayout.tsx`.
  - It will feature a simple form for looking up and redeeming coupons, using shared MUI components for consistency.
  - The logic will be handled by the `adminService`, which will contain the `getCouponByCode` and `redeemCoupon` functions that call the updated, RESTful endpoints.

---

## 4. Integration with Other Features

- **User Model:** The `CustomUser` model in the `users` app must have a `points` field.
- **QR Scans:** The `ScanQRCodeView` in the `interactions` app is the primary source of points. It will increment the `user.points` field.
- **Activity Log:** The `core` app's `UserActivity` model will have new `ActivityType` entries: `COUPON_GENERATED` and `COUPON_REDEEMED`.
