# AI-Powered Plant Identification Feature

This document details the plan for the AI plant identification feature. The backend will integrate with a pre-built Python script that uses a YOLOv8 model for recognition.

## 1. Core Functionality

- **As a User,** I want to upload an image (or take a photo) of a plant.
- **As a User,** I want the system to analyze the image and identify the plant species.
- **As a User,** I want to earn points for successful identifications.
- **As a User,** I want to see a history of my past submissions and their results on my profile.

## 2. Technical Approach: Asynchronous Processing via Background Task

Image analysis can be slow. To ensure the user interface remains responsive, the process will be fully asynchronous. The backend will not call an external web service, but will instead run a local Python script in the background.

**Workflow:**

1.  User uploads an image via the frontend.
2.  The backend saves the image and creates an `ImageSubmission` record with `status='PENDING'`.
3.  The backend immediately returns a `202 Accepted` response to the frontend.
4.  Simultaneously, a background task (using Celery & Redis) is triggered.
5.  The background task executes the provided `predict.py` script, passing the path of the user's uploaded image.
6.  The `predict.py` script runs the YOLOv8 model, saving the results (class, coordinates, confidence) to a text file.
7.  The background task reads this output text file, parses the plant identification result, updates the `ImageSubmission` record in the database to `status='COMPLETED'`, awards points, and calls the `check_and_award_achievements` service.

---

## 3. Backend Implementation (Django REST Framework)

### 3.1. New Model (`ai_features/models.py`)

The model remains largely the same, but is now clearly for plant identification.

```python
from django.db import models
from django.conf import settings

class ImageSubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='plant_submissions/') # Requires media file setup

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Results from the YOLOv8 script
    identified_plant = models.ForeignKey('flora.Plant', on_delete=models.SET_NULL, blank=True, null=True, help_text="Direct link to the identified plant in the flora database.")
    confidence_score = models.FloatField(blank=True, null=True)
    raw_prediction_output = models.TextField(blank=True, null=True) # To store the raw text output from the script

    points_awarded = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Plant submission by {self.user.email} at {self.submitted_at}"
```

### 3.2. API Endpoints and Logic

The architecture is simplified by removing the need for a webhook.

| Method | Endpoint                | View                    | Description                                     |
| :----- | :---------------------- | :---------------------- | :---------------------------------------------- |
| `POST` | `/api/ai/submit-image/` | `SubmitImageView`       | User uploads an image for plant identification. |
| `GET`  | `/api/ai/submissions/`  | `SubmissionHistoryView` | Lists the current user's past submissions.      |

- **`SubmitImageView`:**
  - Accepts `multipart/form-data` with an image file.
  - Creates an `ImageSubmission` instance with `status='PENDING'`.
  - **Triggers a background task** (e.g., using Celery). Before triggering, it logs the creation event:
    `create_activity(user=request.user, activity_type=UserActivity.ActivityType.AI_SUBMISSION_CREATED, details={'submission_id': submission.id})`
  - Immediately returns `202 Accepted`.

- **Background Task (`tasks.py`):**
  - Receives the `ImageSubmission` ID.
  - Changes the submission status to `PROCESSING`.
  - Executes the `predict.py` script.
  - After the script finishes, it parses the results. It maps the plant name from the script's output to a `flora.Plant` instance.
  - Updates the `ImageSubmission` record with the results (`identified_plant` ForeignKey, confidence, etc.), sets status to `COMPLETED`, and awards points.
  - If a plant is successfully identified, it logs a `PLANT_DISCOVERED` event:
    `create_activity(user=user, activity_type=UserActivity.ActivityType.PLANT_DISCOVERED, details={'submission_id': submission.id, 'plant_id': submission.identified_plant.id})`
  - Calls `check_and_award_achievements(user)`.
  - Finally, logs the completion event:
    `create_activity(user=user, activity_type=UserActivity.ActivityType.AI_SUBMISSION_COMPLETED, details={'submission_id': submission.id, 'plant_id': submission.identified_plant.id})`
  - If the script fails or no plant is identified, it sets status to `FAILED` and logs a failure event:
    `create_activity(user=user, activity_type=UserActivity.ActivityType.AI_SUBMISSION_FAILED, details={'submission_id': submission.id})`

---

## 4. Admin Management Interface

To allow administrators to review and manage user-submitted images and the results from the AI model, an interface will be built using the reusable **Admin Toolkit**. For details, see `AdminPanelArchitecture.md`.

- **Functionality:** A page at `/admin/ai-submissions` will use the `ResourceTable.tsx` to list all `ImageSubmission` instances.
- **Columns:** The table will show the user, submission date, status (`PENDING`, `COMPLETED`, etc.), and the identified plant.
- **Actions:** Admins will be able to click on a submission to view the original image and the model's output, and potentially override or correct a misidentification.
- **API:** A new read-only `/api/admin/ai-submissions/` endpoint will provide the necessary data for the admin view.

---

## 5. Frontend Implementation (React, MUI, Zustand)

The frontend implementation remains the same, as it was already decoupled from the backend's internal processing method. The user will upload an image and receive a notification later when the processing is complete.
