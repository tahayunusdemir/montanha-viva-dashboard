# Montanha Viva - Plant AI Identifier System Report

This document provides a detailed analysis of the Plant Identifier system. It covers the end-to-end architecture, from the user-facing interface for image submission to the backend service that runs a real-time AI model for inference.

## 1. Overview

The Plant Identifier is an advanced, AI-driven feature designed to engage users by allowing them to identify plants from their own photos. It serves as a bridge between user-generated content and the project's structured flora database, providing a fun and educational tool for exploring the region's biodiversity.

-   **Frontend**: A clean, user-friendly interface allows users to upload an image of a plant. The system then displays a list of potential matches with confidence scores.
-   **Backend**: A dedicated Django app serves a pre-trained PyTorch model via a REST API. It receives an image, processes it, and returns a list of predictions from the model.

## 2. Core Features

The system's features are designed around a simple, intuitive user workflow.

| Feature                           | User Role | Description                                                                                                                                                                                                    |
| :-------------------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Image Upload**                  | User      | Users can either drag and drop an image file or click to open a file selector to upload a picture of a plant they wish to identify.                                                                              |
| **AI-Powered Identification**     | User      | After uploading, a user can click the "Identify Plant" button to submit the image for real-time analysis by the backend AI model.                                                                                |
| **View Ranked Predictions**       | User      | The system returns a ranked list of the most likely plant species, each with a calculated confidence score (e.g., "92% confidence").                                                                              |
| **View Detailed Information**     | User      | If a prediction matches a plant that exists in the project's Flora Encyclopedia, the user can click on the result to open the familiar `FloraDetailModal` and explore its full database entry.                   |
| **Confidence Level Indicator**    | User      | Each result is accompanied by a visual "High Confidence" or "Low Confidence" chip, giving the user a quick understanding of the AI's certainty.                                                                   |

---

## 3. Frontend Implementation (`PlantIdentifier.tsx`)

The entire user-facing experience is encapsulated in a single, well-structured React component.

-   **Technology Stack**: The component is built with React, Material-UI, and uses the `react-dropzone` library for the file upload functionality. It leverages `@tanstack/react-query` for both fetching the existing list of all plants (to link predictions to the encyclopedia) and for managing the `useMutation` hook that calls the identification API.
-   **User Interface & Workflow**:
    1.  **Upload**: The initial view presents a large dropzone area. When a user drops an image or selects a file, it is displayed in a preview area.
    2.  **Submission**: Below the preview, an "Identify Plant" button appears. Clicking this button triggers the `identifyPlant` mutation, sending the image to the backend for analysis and showing a loading indicator.
    3.  **Results**: Once the API call is complete, the results are displayed in a clean, interactive `<List>`. Each `ListItemButton` shows the predicted plant's name and confidence percentage.
-   **Integration with Flora Encyclopedia**:
    -   After receiving the prediction results from the backend (e.g., a list of scientific names), the component checks if any of these names exist in the data fetched from the `floraService`.
    -   If a match is found, the list item for that prediction becomes clickable. Clicking it opens the `FloraDetailModal` with the detailed information for that plant, creating a seamless bridge between the AI tool and the curated database.

---

## 4. Backend Implementation (`plant_id` App)

The backend implementation consists of a dedicated Django app (`plant_id`) responsible for serving the AI model.

-   **Dependencies**: The system relies on the `ultralytics` library, which includes `torch` and other necessary packages for running the PyTorch model. This is specified in the `backend/requirements.txt` file.

-   **AI Model**: The project uses a pre-trained model file located at `script/best.pt`. The `docker-compose.yml` file is configured to mount the `script/` directory into the backend container at `/app/script`, making the model accessible to the Django application.

-   **API Endpoint**: A single endpoint handles all identification requests:
    -   **`POST /api/plant-id/identify/`**: This endpoint is handled by the `PlantIdentificationView`.

-   **View (`PlantIdentificationView`)**:
    -   **Permissions**: The view requires `IsAuthenticated`, meaning only logged-in users can use the identification feature.
    -   **Model Loading**: The `best.pt` YOLO model is loaded once when the Django application starts up. This is a crucial optimization to prevent the expensive operation of loading the model from disk on every single API request.
    -   **Inference Logic**: The view's `post` method accepts a `multipart/form-data` request containing an `image`. It uses a simple `ImageUploadSerializer` to validate the file. The image is then passed to the pre-loaded model for inference. The view extracts the top predictions (class names and confidence scores) from the model's output, formats them into a JSON array, and returns the response to the frontend.
