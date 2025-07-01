# Core Features & Shared Systems

This document outlines core systems that are shared across multiple features, such as activity logging, notifications, and points management.

---

## 1. User Activity Logging System

To maintain a consistent and scalable audit trail, a central `core` Django app will be created. This app will contain a `UserActivity` model and a dedicated service for logging events from all other parts of the application.

### 1.1. Core App & Model (`core/models.py`)

A new `core` app will be created to house shared models.

```python
# core/models.py
from django.db import models
from django.conf import settings
import uuid

class UserActivity(models.Model):
    """
    A log of significant actions taken by users.
    """
    class ActivityType(models.TextChoices):
        # User Authentication
        USER_REGISTERED = 'USER_REGISTERED', 'User Registered'
        USER_LOGGED_IN = 'USER_LOGGED_IN', 'User Logged In'
        PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED', 'Password Reset Requested'
        PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED', 'Password Reset Completed'

        # Profile
        PROFILE_UPDATED = 'PROFILE_UPDATED', 'Profile Updated'
        ACCOUNT_DELETED = 'ACCOUNT_DELETED', 'Account Deleted'

        # Admin Actions
        ADMIN_USER_CREATED = 'ADMIN_USER_CREATED', 'Admin: User Created'
        ADMIN_USER_UPDATED = 'ADMIN_USER_UPDATED', 'Admin: User Updated'
        ADMIN_USER_DELETED = 'ADMIN_USER_DELETED', 'Admin: User Deleted'
        ADMIN_USER_STATUS_CHANGED = 'ADMIN_USER_STATUS_CHANGED', 'Admin: User Status Changed'

        # QR Code Interactions
        QR_CODE_SCANNED = 'QR_CODE_SCANNED', 'QR Code Scanned'

        # AI Plant Identification
        AI_SUBMISSION_CREATED = 'AI_SUBMISSION_CREATED', 'AI Submission Created'
        AI_SUBMISSION_COMPLETED = 'AI_SUBMISSION_COMPLETED', 'AI Submission Completed'
        AI_SUBMISSION_FAILED = 'AI_SUBMISSION_FAILED', 'AI Submission Failed'

        # Flora & Routes
        PLANT_VIEWED = 'PLANT_VIEWED', 'Plant Viewed'
        PLANT_DISCOVERED = 'PLANT_DISCOVERED', 'Plant Discovered'
        ROUTE_VIEWED = 'ROUTE_VIEWED', 'Route Viewed'
        ROUTE_COMPLETED = 'ROUTE_COMPLETED', 'Route Completed'

        # Sensor Data
        SENSOR_DATA_VIEWED = 'SENSOR_DATA_VIEWED', 'Sensor Data Viewed'

        # Feedback
        FEEDBACK_SUBMITTED = 'FEEDBACK_SUBMITTED', 'Feedback Submitted'

        # Achievements
        ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED', 'Achievement Unlocked'

        # Rewards System
        COUPON_GENERATED = 'COUPON_GENERATED', 'Coupon Generated'
        COUPON_REDEEMED = 'COUPON_REDEEMED', 'Coupon Redeemed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ActivityType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(blank=True, null=True, help_text="Contextual data like object IDs or names.")

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "User Activities"

    def __str__(self):
        return f"{self.user.email} - {self.get_activity_type_display()} at {self.timestamp}"
```

### 1.2. Central Service (`core/services.py`)

A single service function will be used by all other apps to create logs, ensuring consistency.

```python
# core/services.py
from .models import UserActivity

def create_activity(user, activity_type, details=None):
    """
    A centralized function for creating user activity logs.

    Args:
        user: The user instance performing the action.
        activity_type: An enum value from UserActivity.ActivityType.
        details (dict, optional): A dictionary with relevant contextual data.
    """
    UserActivity.objects.create(
        user=user,
        activity_type=activity_type,
        details=details or {}
    )
```

### 1.3. API Endpoint (`core/urls.py`)

This endpoint will allow the frontend to fetch the activity history for the logged-in user to display on their profile page.

| Method | Endpoint                  | View                      | Name            | Description                                  |
| :----- | :------------------------ | :------------------------ | :-------------- | :------------------------------------------- |
| `GET`  | `/api/users/me/activity/` | `UserActivityHistoryView` | `user-activity` | Lists the logged-in user's activity history. |

This ensures all user-facing activities are tracked consistently and can be used for both gamification checks and profile history displays.
