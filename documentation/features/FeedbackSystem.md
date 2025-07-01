# Feedback Submission Feature

This document outlines the implementation plan for the user feedback system, allowing users to report bugs, suggest features, or provide general comments.

## 1. User Stories

- **As a User,** I want to find a clear and accessible way to send feedback to the development team.
- **As a User,** I want to select a category for my feedback (e.g., "Bug Report," "Feature Suggestion," "General Feedback") to ensure it's routed correctly.
- **As a User,** I want to provide a subject and a detailed message to explain my feedback clearly.
- **As a User,** I want to optionally attach a file (e.g., a screenshot or a short video clip, up to 5MB) to provide more context.
- **As a User,** I want to receive a confirmation message after submitting my feedback so I know it was received.
- **As an Admin,** I want to view, filter, and manage all user-submitted feedback through the Django admin panel.
- **As a User,** I want to be rewarded for providing helpful feedback, potentially unlocking an achievement.

---

## 2. Backend Implementation (Django REST Framework)

A new Django app named `feedback` will be created to handle all related logic.

### 2.1. New Model (`feedback/models.py`)

This model will store all feedback submissions.

```python
from django.db import models
from django.conf import settings
import uuid

class FeedbackSubmission(models.Model):
    class Category(models.TextChoices):
        BUG_REPORT = 'BUG', 'Bug Report'
        FEATURE_REQUEST = 'FEATURE', 'Feature Request'
        GENERAL = 'GENERAL', 'General Feedback'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        VIEWED = 'VIEWED', 'Viewed'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=10, choices=Category.choices, default=Category.GENERAL)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    attachment = models.FileField(upload_to='feedback_attachments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_category_display()} from {self.user.email if self.user else 'Anonymous'}: {self.subject}"
```

### 2.2. Admin Integration (`feedback/admin.py`)

To allow administrators to manage feedback effectively.

```python
from django.contrib import admin
from .models import FeedbackSubmission

@admin.register(FeedbackSubmission)
class FeedbackSubmissionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'category', 'status', 'created_at')
    list_filter = ('category', 'status', 'created_at')
    search_fields = ('subject', 'message', 'user__email')
    readonly_fields = ('user', 'created_at')
```

### 2.3. API Endpoint (`feedback/urls.py`)

| Method | Endpoint                | View                 | Name              | Description                                 |
| :----- | :---------------------- | :------------------- | :---------------- | :------------------------------------------ |
| `POST` | `/api/feedback/submit/` | `SubmitFeedbackView` | `submit-feedback` | Authenticated user submits a feedback form. |

### 2.4. View & Logic (`feedback/views.py`)

- **`SubmitFeedbackView` (`generics.CreateAPIView`):**
  - **Permission:** `IsAuthenticated`.
  - **Parser Classes:** Will include `MultiPartParser` and `FormParser` to handle file uploads.
  - **Serializer:** `FeedbackSubmissionSerializer`.
  - **Logic:**
    1.  The `perform_create` method will automatically associate the submission with `request.user`.
    2.  After successfully saving, it will call the central activity service:
        `create_activity(user=request.user, activity_type=UserActivity.ActivityType.FEEDBACK_SUBMITTED, details={'feedback_id': submission.id, 'subject': submission.subject})`
    3.  It will then call the `check_and_award_achievements(request.user)` service.

### 2.5. Serializer (`feedback/serializers.py`)

- **`FeedbackSubmissionSerializer` (`ModelSerializer`):**
  - Will include fields: `category`, `subject`, `message`, `attachment`.
  - The `user` field will be a `ReadOnlyField` as it's set from the request context.
  - Will include validation for the `attachment` to check for file size (e.g., max 5MB) and potentially file type.

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. New Component (`components/feedback/FeedbackModal.tsx`)

- A modal dialog will be the primary UI for submitting feedback. It can be triggered by a button in the main layout (e.g., in the Navbar or a floating action button).
- The component will contain a form built with MUI components (`TextField`, `Select`, `Button`, and a file input).

### 3.2. Form Management (`react-hook-form` & `zod`)

- **Validation Schema (`lib/validators/feedback.ts`)**:
  - A `feedbackSchema` will be created using `zod`.
  - It will validate `category` (as an enum), `subject` (string with length limits), and `message` (string with length limits).
  - The `attachment` field will be validated to be an instance of `File`, be optional, and not exceed a certain size (e.g., `5 * 1024 * 1024` for 5MB).

### 3.3. API Service (`api/feedbackService.ts`)

- A new `feedbackService.ts` file will be created.
- It will export a `submitFeedback(data: FormData)` function that posts the form data to the `/api/feedback/submit/` endpoint using the global `axiosInstance`. Using `FormData` is necessary to handle the file upload correctly.

### 3.4. User Flow

1.  User clicks the "Send Feedback" button.
2.  The `FeedbackModal` opens.
3.  The user fills the form. `react-hook-form` provides real-time validation against the `zod` schema.
4.  If the user selects a file, its name appears in the UI. A clear button allows them to remove it.
5.  Upon clicking "Submit", a `FormData` object is constructed.
6.  The `submitFeedback` service function is called. A loading state disables the form.
7.  On success:
    - A `react-hot-toast` notification appears: "Thank you! Your feedback has been sent."
    - The form is reset, and the modal closes.
8.  On failure, an error toast displays the message from the server.

---

## 4. Gamification & Security

### 4.1. Achievement Integration

- To reward users for their contributions, a new achievement criterion should be added.
- **In `achievements/models.py`**: A new choice should be added to `Achievement.CRITERIA_CHOICES`:
  ```python
  ('FEEDBACK_SUBMISSIONS', 'Total Feedback Submissions')
  ```
- **In `achievements/services.py`**: The `check_and_award_achievements` function should be updated to count the user's feedback submissions and grant achievements accordingly.

### 4.2. File Upload Security

- **Frontend Validation:** The `zod` schema provides a first line of defense by checking file size and type on the client side.
- **Backend Validation:** The backend must also validate the file size to prevent malicious users from bypassing the client-side checks. This can be configured in Django's `settings.py` (`DATA_UPLOAD_MAX_MEMORY_SIZE`) and in the serializer.
- **File Type Validation:** The backend serializer will validate that uploaded files are of an allowed type (e.g., `.png`, `.jpg`, `.jpeg`, `.mp4`, `.mov`) to enhance security, in addition to checking the 5MB size limit.
- **Production Consideration:** For a production environment, all uploaded files should be scanned for malware before being stored.

---

## 5. Admin Feedback Management Interface

To provide administrators with a powerful tool to manage feedback, the admin interface will be built using the reusable **Admin Toolkit**, ensuring a consistent experience with other management pages. For more details on the toolkit, see `AdminPanelArchitecture.md`.

### 5.1. Backend API Extensions

The `feedback` app's API will be extended with admin-only endpoints, protected by the `IsAdminUser` permission class. This aligns with the standardized backend design.

| Method   | Endpoint                    | View                         | Name                    | Description                                                   |
| :------- | :-------------------------- | :--------------------------- | :---------------------- | :------------------------------------------------------------ |
| `GET`    | `/api/admin/feedback/`      | `FeedbackViewSet` (list)     | `admin-list-feedback`   | **Admin Only.** Lists all feedback submissions.               |
| `GET`    | `/api/admin/feedback/<id>/` | `FeedbackViewSet` (retrieve) | `admin-detail-feedback` | **Admin Only.** Retrieves a single feedback submission.       |
| `PATCH`  | `/api/admin/feedback/<id>/` | `FeedbackViewSet` (update)   | `admin-update-feedback` | **Admin Only.** Updates a feedback submission (e.g., status). |
| `DELETE` | `/api/admin/feedback/<id>/` | `FeedbackViewSet` (destroy)  | `admin-delete-feedback` | **Admin Only.** Deletes a feedback submission.                |

_Note: The endpoints will be consolidated under a single `FeedbackViewSet` for simplicity and consistency._

### 5.2. Frontend Implementation

The interface will be a new, admin-only page within the main dashboard layout.

**1. Routing and Layout:**

- **New Route:** A protected route `/admin/feedback` will be rendered within the shared `AdminLayout.tsx`.
- **Side Menu:** A "Feedback" link will be conditionally rendered in the admin section of the side menu.

**2. Feedback Management Page (`pages/admin/FeedbackManagementPage.tsx`):**

- **Data Grid:** The page will use the generic `ResourceTable.tsx` component to display all feedback submissions.
  - **Columns:** Will be configured for ID, User Email, Subject, Submission Date, and Status (using a custom renderer for a color-coded chip).
  - **Data Fetching:** The table will be populated by calling `adminService.getFeedback()`.
  - **Actions:** Clicking a row or an action button will open a detail/edit modal. A "Delete" button will use the generic `ConfirmDeleteDialog.tsx`.

**3. Feedback Detail/Update Modal (`components/admin/shared/ResourceFormModal.tsx`):**

- Instead of a custom modal, the generic `ResourceFormModal.tsx` will be used.
- **Display:** When a row is clicked, the modal will open in a "read-only" or "detail" mode, displaying the full feedback message and attachment link.
- **Actions:** The form within the modal will be configured to show a `Select` dropdown for changing the feedback `status`. The "Save" action will call `adminService.updateFeedback()`.

**4. API Service (`api/adminService.ts`):**

- An `adminService.ts` (or a similar shared service) will contain the admin functions for feedback: `getFeedback`, `updateFeedback`, and `deleteFeedback`.
