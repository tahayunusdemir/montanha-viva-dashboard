# QR Code Interaction Feature

This document outlines the implementation plan for the QR code scanning feature, which is the primary method for users to earn points for the rewards system.

## 1. Core Functionality

- **As an Admin,** I want to create and manage QR codes that can be placed at physical locations.
- **As an Admin,** I want to associate each QR code with a specific point value.
- **As a User,** I want to use a scanner within the web app to scan these QR codes.
- **As a User,** upon a successful scan, I want to be notified that points have been added to my account.
- **As a User,** I want my scan activities to be recorded, contributing to my total point balance which I can see on my profile.

---

## 2. Backend Implementation (Django REST Framework)

### 2.1. New Model (`interactions/models.py`)

A new `QRCode` model is required to store information about each scannable code.

```python
from django.db import models
import uuid

class QRCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="A descriptive name, e.g., 'Oak Tree at Park Entrance'")
    description = models.TextField(blank=True)

    # Gamification
    points_value = models.PositiveIntegerField(default=10, help_text="Points awarded to the user upon scanning.")

    # Linked Content (Polymorphic relation or simple fields)
    # For simplicity, we'll start with a simple text field.
    linked_information = models.TextField(blank=True, help_text="Information to be displayed to the user after scanning.")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

### 2.2. New API Endpoint (`interactions/urls.py`)

A new endpoint is needed to handle the scan action.

| Method | Endpoint                     | View             | Name           | Description                                      |
| :----- | :--------------------------- | :--------------- | :------------- | :----------------------------------------------- |
| `POST` | `/api/interactions/scan-qr/` | `ScanQRCodeView` | `scan-qr-code` | User submits a scanned QR code ID to get points. |

### 2.3. View & Logic (`interactions/views.py`)

- **`ScanQRCodeView` (`APIView`):**
  - **Permission:** `IsAuthenticated`.
  - **Input:** `{ "qr_code_id": "uuid-of-the-code" }`.
  - **Logic:**
    1.  Find the `QRCode` instance by the provided `id`. If not found, return `404`.
    2.  **Cooldown/Uniqueness Check:** Check the central `UserActivity` log to see if this user has already scanned this specific code within a defined period (e.g., 24 hours) to prevent spamming.
        `UserActivity.objects.filter(user=request.user, activity_type=UserActivity.ActivityType.QR_CODE_SCANNED, details__qrcode_id=qr_code_id, timestamp__gte=...).exists()`
    3.  If the scan is valid, add `qrcode.points_value` to `request.user.points` and save the user.
    4.  Log the scan event using the central service:
        `create_activity(user=request.user, activity_type=UserActivity.ActivityType.QR_CODE_SCANNED, details={'qrcode_id': qrcode.id, 'points_awarded': qrcode.points_value})`
    5.  **Check for Plant Discovery:** If the `QRCode` is linked to a `PointOfInterest` which in turn is linked to a `flora.Plant`, log a `PLANT_DISCOVERED` event.
        `create_activity(user=request.user, activity_type=UserActivity.ActivityType.PLANT_DISCOVERED, details={'plant_id': poi.flora.id})`
    6.  Trigger the achievement checking service (`check_and_award_achievements(request.user)`). This service will check for all achievements, including those related to QR scans, plant discoveries, and route completions.
    7.  **Response:** The information returned depends on what the `QRCode` is linked to.
        - If linked to a `PointOfInterest` (via the `routes` app), return the POI's name and description.
        - Otherwise, return the `QRCode`'s own `linked_information`.
          This provides a single source of truth for content.
        ```json
        {
          "message": "Scan successful! You've earned points.",
          "points_awarded": 10,
          "title": "Oak Tree at Park Entrance",
          "information": "This is a Quercus robur, commonly known as the English Oak..."
        }
        ```

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. New Page/Component

- **`QRScannerPage` (`/scanner`):**
  - This page will host the QR scanner component. It might be presented as a modal that can be opened from the main navigation bar.
  - It will use a library like `react-qr-reader` or `@yudiel/react-qr-scanner` to access the device's camera.
  - The component will have a clear frame/overlay indicating where the user should position the QR code.

### 3.2. User Flow

1.  User clicks the "Scan QR" button in the app's navigation.
2.  The `QRScannerPage` or modal opens, requesting camera permission.
3.  Once the camera is active, the user points it at a QR code.
4.  The scanner library detects and decodes the QR code, which should contain the `uuid`.
5.  The frontend calls `api/interactions/scan-qr/` with the extracted ID.
6.  While waiting for the API response, a loading spinner is shown.
7.  On success:
    - The scanner view closes.
    - A success notification is shown using `react-hot-toast`: `"Success! You earned 10 points."`.
    - A modal appears displaying the `information` from the API response.
    - The user's point total in the UI (e.g., in the Navbar or profile) is updated by refetching user data or through a global state update.
8.  On failure (e.g., already scanned), an appropriate error message is shown.

### 3.3. State Management (`authStore`)

- The `user` object within the `authStore` contains the `points` field. After a successful scan, the application should refetch the user's profile to get the updated point total, ensuring the UI is always in sync.

---

## 4. Connection to the Rewards System

This feature is the primary driver for the **Rewards & Coupon System**.

- Points accumulated from scanning QR codes can be converted into discount coupons by the user.
- For complete details on how points are used, see the **[Rewards & Coupon System Feature](./RewardsAndCouponSystem.md)** document.

---

## 4. Admin Management Interface

To allow administrators to create and manage scannable QR codes, a dedicated admin interface will be built using the reusable **Admin Toolkit**. For more details on the toolkit, see `AdminPanelArchitecture.md`.

- **Functionality:** A page at `/admin/qrcodes` will use the `ResourceTable.tsx` to list all `QRCode` instances.
- **Forms:** The `ResourceFormModal.tsx` will be configured for creating and editing QR codes, allowing admins to set their `name`, `description`, `points_value`, and link them to content or points of interest.
- **API:** A new `/api/admin/qrcodes/` endpoint using a `ModelViewSet` will provide the necessary CRUD functionality.
