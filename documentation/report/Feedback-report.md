# Montanha Viva - Feedback System Report

This document provides a detailed analysis of the user feedback system. It covers the end-to-end architecture, from the frontend user interface for submitting feedback to the backend APIs that process and store it, including the administrative features for managing submissions.

## 1. Overview

The feedback system is a critical communication channel that allows authenticated users to report bugs, suggest features, or provide general comments. The system is designed with a clear separation of concerns: a user-facing submission form and a distinct set of administrative tools for managing the feedback received.

-   **Frontend**: A clean, user-friendly form allows users to categorize their feedback, provide details, and optionally attach a supporting document.
-   **Backend**: A robust Django REST Framework application receives the submission, associates it with the logged-in user, and provides secure, role-based endpoints for administrators to review, update, and manage all feedback.

## 2. Core Features

The system offers a distinct set of features for standard users and administrators.

| Feature                      | User Role   | Description                                                                                                                                                             |
| :--------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Send Categorized Feedback**| User        | Authenticated users can submit feedback, classifying it as a "General Inquiry," "Bug Report," "Feature Request," or "Other."                                              |
| **Attach Document**          | User        | Users can upload an optional file (e.g., a screenshot of a bug) with their feedback, with a client-side size limit of 5MB.                                                 |
| **View Own Feedback**        | User        | The API supports retrieving a list of all feedback previously submitted by the logged-in user. *(Note: A dedicated UI for this is not yet implemented on the frontend).* |
| **View All Feedback**        | Admin       | Administrators have access to a secure endpoint to list all feedback submissions from every user, including anonymous ones if enabled.                                      |
| **Filter & Search Feedback** | Admin       | Admins can filter the feedback list by `status` (e.g., "pending," "resolved") and perform a text-based search on user details or feedback content.                           |
| **Manage Feedback**          | Admin       | Admins can retrieve a specific feedback item, update its status, or delete it entirely.                                                                                 |

---

## 3. Frontend Implementation (`SendFeedback.tsx`)

The user-facing portion of the system is a single, well-structured React component.

-   **Technology Stack**: The component is built with React, Material-UI (MUI) for UI elements, and `@tanstack/react-query` for managing the API mutation state (`useCreateFeedback`).
-   **Form Structure**: The UI is a centered MUI `<Card>` containing a form with the following fields:
    -   **Category**: An MUI `<Select>` component for classification.
    -   **Subject**: A required MUI `<TextField>`.
    -   **Message**: A required multi-line MUI `<TextField>`.
    -   **Attachment**: An optional file upload control.
-   **File Upload Handling**:
    -   A styled "Upload file" `<Button>` uses a visually hidden `<input type="file">` for a clean user experience.
    -   Client-side validation is performed to ensure the selected file does not exceed 5MB.
    -   Once a file is selected, its name is displayed in a `<Paper>` component with a "remove" `<IconButton>`, allowing the user to change their selection before submission.
-   **API Interaction & State Management**:
    -   The `useCreateFeedback` hook (from TanStack Query) manages the entire API request lifecycle.
    -   On form submission, a `FormData` object is created. This is essential for sending `multipart/form-data`, which is required for the file upload.
    -   The component's UI reacts to the mutation's state:
        -   The "Send Feedback" button shows a `<CircularProgress>` and is disabled while the request is pending (`createFeedbackMutation.isPending`).
        -   A success `<Alert>` is displayed at the top of the page when `createFeedbackMutation.isSuccess` is true.
        -   Error messages from the API are displayed in an `<Alert>` if `createFeedbackMutation.isError` is true.
-   **User Experience**: Upon successful submission, the form fields are automatically cleared, and the page is scrolled to the top to ensure the user sees the success message.

---

## 4. Backend Implementation (`feedback` App)

The backend logic is encapsulated within the `feedback` Django app, providing secure and logical data management.

### 4.1. Data Model (`models.py`)

-   The `Feedback` model is the core of the system. Its key fields include:
    -   `user`: A nullable `ForeignKey` to the `CustomUser` model. It's automatically linked to the logged-in user but can be null to support anonymous feedback in the future.
    -   `name`, `surname`, `email`: Fields to capture details for unauthenticated submissions.
    -   `subject`, `message`: Core content of the feedback.
    -   `category`: A `CharField` with choices mirroring the frontend dropdown.
    -   `status`: A `CharField` with choices like "pending," "in_progress," and "resolved" for admin management.
    -   `document`: A `FileField` to store the path to the uploaded attachment.

### 4.2. API Endpoints (`urls.py` & `views.py`)

The system exposes a clear, role-based REST API.

| Endpoint                                       | View                        | Permission(s)       | Description                                                                                             |
| :--------------------------------------------- | :-------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------ |
| `GET`, `POST /api/feedback/`                     | `FeedbackListCreateView`    | `IsAuthenticated`   | Allows a logged-in user to create new feedback (POST) or list their own past submissions (GET).         |
| `GET /api/feedback/admin/`                       | `AdminFeedbackListView`     | `IsAdminUser`       | Allows an admin to list all feedback from all users, with powerful filtering and search capabilities. |
| `GET`, `PATCH`, `DELETE /api/feedback/admin/<pk>/` | `AdminFeedbackDetailView`   | `IsAdminUser`       | Allows an admin to retrieve, update (e.g., change status), or delete a single feedback entry.         |

### 4.3. Serializers (`serializers.py`)

-   **`FeedbackCreateSerializer`**: Used by the `FeedbackListCreateView` for creating new feedback. It only validates the fields submitted by the authenticated user (`subject`, `message`, etc.), as the `user` is set automatically in the view's `perform_create` method.
-   **`FeedbackListDetailSerializer`**: Used by the admin views. It provides a comprehensive view of the `Feedback` model, including nested details about the submitting user (`user_details`) for context.
-   **`AnonymousFeedbackCreateSerializer`**: A dedicated serializer for unauthenticated submissions, requiring `name` and `email`. This demonstrates that the backend is ready to support public feedback forms.
