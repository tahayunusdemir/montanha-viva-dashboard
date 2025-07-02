# 🌿 AI Plant Identification - Technical Plan

## 🌐 Overview

### 🎯 Goal

This document details the full-stack technical plan for creating the AI-powered plant identification feature. The goal is to build a system where users can upload an image of a plant and receive a prediction of its species, leveraging a pre-trained PyTorch model (`best.pt`).

-   **User-Facing Component (`/plant-identifier`):** A page where users can upload an image and view the identification results.
-   **Backend Service:** An API endpoint that processes the image and runs the AI model for inference.

---

## 🛠️ Technologies

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, MUI, TanStack Query | To build the user interface for image upload and result display. |
| **Backend** | Django, Django REST Framework, Ultralytics | To serve the AI model via a REST API. |
| **AI Model** | PyTorch (`.pt` format) | The pre-trained model for plant classification. |
| **Deployment**| Docker | To ensure the environment has all necessary dependencies, including the PyTorch libraries. |

---

## 🏗️ Backend Architecture (Django)

A new `plant_id` Django app will be created to encapsulate the AI logic.

### 1. Dependencies and Configuration

-   **`requirements.txt`**: The `ultralytics` library, which includes `torch` and other necessary packages, will be added to `backend/requirements.txt`.
-   **`docker-compose.yml`**: The `backend` service definition will be updated to mount the `script/` directory so the application can access the `best.pt` model file.
    ```diff
    # docker-compose.yml
    services:
      backend:
        volumes:
          - ./backend:/app
          - ./backend/media:/app/media
          - ./data:/app/data
          - ./frontend:/frontend
    +     - ./script:/app/script
    ```

### 2. API Endpoint (`/api/plant-id/identify/`)

A new view and URL will be created to handle the identification requests.

-   **View (`plant_id/views.py`)**:
    -   A new `PlantIdentificationView` will be created as a generic `APIView`.
    -   **Permissions:** `IsAuthenticated` will be required.
    -   **Model Loading:** The `best.pt` model will be loaded once when the Django app starts to avoid reloading on every request. The path will be `/app/script/best.pt` inside the container.
    -   **`post` method:**
        1.  It will accept a `multipart/form-data` request containing an `image` file.
        2.  The image will be validated (e.g., checking if a file was provided).
        3.  The image will be passed to the loaded YOLO model for inference.
        4.  The model's predictions (class names and confidence scores) will be extracted.
        5.  The results will be formatted into a clean JSON structure and returned to the client with a `200 OK` status.

-   **Serializer (`plant_id/serializers.py`)**:
    -   An `ImageUploadSerializer` will be created with a single `ImageField` to validate the uploaded file.

-   **URL (`plant_id/urls.py` and `api/urls.py`)**:
    -   A new `plant_id/urls.py` file will define the path for the view: `path('identify/', PlantIdentificationView.as_view(), name='identify-plant')`.
    -   This will be included in the main `api/urls.py` file: `path('plant-id/', include('plant_id.urls'))`.

---

## 🧩 Frontend Architecture (React)

### 1. API Service (`src/services/plantIdentifier.ts`)

A new service file will be created to communicate with the backend.

```typescript
// src/services/plantIdentifier.ts
import axios from '@/lib/axios';

interface Prediction {
  class: string;
  confidence: number;
}

export const identifyPlant = async (formData: FormData): Promise<Prediction[]> => {
  const { data } = await axios.post('/api/plant-id/identify/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
```

### 2. UI Component (`PlantIdentifier.tsx`)

The existing `PlantIdentifier.tsx` component will be updated to include the full functionality.

-   **State Management (`useState` & `useMutation`):**
    -   `useState` will be used to manage the selected file, a URL for the image preview, and the final prediction results.
    -   `useMutation` from `@tanstack/react-query` will be used to handle the API call to `identifyPlant`, providing `isLoading`, `error`, and `data` states.
-   **Layout & Components:**
    -   A styled file input area will be created, possibly with drag-and-drop support.
    -   An `<img>` tag will display a preview of the selected image.
    -   A `<Button>` will trigger the identification process. The button will be disabled while the mutation is `isLoading`.
    -   A `<CircularProgress>` or similar component will be shown during the loading state.
    -   An `<Alert>` component will display any errors returned from the backend.
    -   A results area will display the predictions, potentially as a list with plant names and confidence percentages. Each result could link to the corresponding entry in the Flora Encyclopedia.

---

## ✅ Detailed Task List

### Backend (`plant_id` app)

-   [ ] Create the new `plant_id` app: `docker-compose exec backend python manage.py startapp plant_id`.
-   [ ] Add `plant_id` to `INSTALLED_APPS` in `core/settings.py`.
-   [ ] Add `ultralytics` to `backend/requirements.txt`.
-   [ ] Update `docker-compose.yml` to mount the `script/` directory.
-   [ ] Rebuild the backend container: `docker-compose build backend`.
-   [ ] Create `plant_id/serializers.py` with `ImageUploadSerializer`.
-   [ ] Create `plant_id/views.py` with `PlantIdentificationView`.
    -   [ ] Implement model loading logic.
    -   [ ] Implement the `post` method for inference.
-   [ ] Create `plant_id/urls.py` and include it in `api/urls.py`.

### Frontend

-   [ ] **API Service (`src/services/plantIdentifier.ts`):**
    -   [ ] Create the `identifyPlant` function.
    -   [ ] Add a `Prediction` type to `src/types/`.
-   [ ] **UI Component (`PlantIdentifier.tsx`):**
    -   [ ] Implement the file input and image preview.
    -   [ ] Set up the `useMutation` hook for the API call.
    -   [ ] Add a button to submit the image.
    -   [ ] Conditionally render loading indicators, error messages, and prediction results.
-   [ ] **Navigation:**
    -   [ ] Ensure the `Plant Identifier` page is accessible from the main dashboard navigation. 