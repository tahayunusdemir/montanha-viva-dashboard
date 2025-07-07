# Montanha Viva - Flora & Wiki System Report

This document provides a detailed analysis of the Flora & Wiki system. It covers the end-to-end architecture, from the public-facing flora encyclopedia and its interactive details to the comprehensive administrative interface for managing the wiki's content.

## 1. Overview

The Flora & Wiki system serves a dual purpose: it is a public-facing educational tool for users to learn about regional plant life, and a powerful content management system for administrators. This creates a rich, data-driven "Flora Encyclopedia" for all users.

-   **Frontend (Public)**: A beautifully designed, searchable encyclopedia allows any user to browse plants. An interactive modal provides in-depth details, including image galleries and specific uses.
-   **Frontend (Admin)**: A complete CRUD (Create, Read, Update, Delete) interface, seamlessly integrated into the admin dashboard, allows administrators to manage every aspect of the plant database.
-   **Backend**: A flexible Django REST Framework API serves plant data to the public encyclopedia and provides secure, admin-only endpoints for content management, including a dedicated endpoint for handling image uploads separately from plant data submission.

## 2. Core Features

The system offers a distinct set of features for public users and administrators.

| Feature                      | User Role   | Description                                                                                                                                                             |
| :--------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Flora Encyclopedia**  | Public      | All users (authenticated or not) can view a grid of all plants in the database.                                                                                         |
| **Search and Filter**        | Public      | Users can perform a real-time search to filter plants by their scientific or common names.                                                                                |
| **View Plant Details**       | Public      | Clicking on a plant opens a detailed modal with an image gallery, common names, fauna interaction, and categorized uses (e.g., Food, Medicinal).                            |
| **Create & Edit Plants**     | Admin       | Administrators can create new plant entries or edit existing ones through a comprehensive modal form.                                                                   |
| **Manage Plant Images**      | Admin       | Admins can upload multiple images for a plant. The images are uploaded independently and then associated with a plant entry upon saving.                                     |
| **Manage Plant Uses**        | Admin       | The admin form includes detailed text fields for various uses (food, medicinal, etc.). The system automatically generates "Use Indicator" chips based on which fields are filled out. |
| **Delete Plants**            | Admin       | Administrators can permanently remove a plant and its associated images from the database.                                                                                |

---

## 3. Public-Facing Implementation (Flora Encyclopedia)

The public part of the system is designed to be an engaging and informative user experience.

### 3.1. Main View (`FloraEncyclopedia.tsx`)

-   **Technology Stack**: Built with React, Material-UI, and `@tanstack/react-query` for fetching and caching plant data.
-   **Layout**: The page displays all plants in a responsive MUI `<Grid>`. Each plant is shown as an MUI `<Card>` with its primary image, scientific name, and common names.
-   **Search Functionality**: A search bar at the top allows users to filter the grid of plants in real-time. The filtering logic is implemented on the client-side using `useMemo` for efficiency.
-   **Interaction**: Clicking on any plant card triggers the `handleOpenModal` function, which sets the selected plant in the state and opens the detail modal.

### 3.2. Detail View (`FloraDetailModal.tsx`)

-   **Functionality**: This modal provides a deep dive into a selected plant's information.
-   **Image Gallery**: If a plant has multiple images, the modal displays them in a gallery with a main image, a scrollable row of thumbnails, and next/previous navigation buttons.
-   **Structured Data**: Plant details are presented in a clean, two-column layout using a custom `DetailItem` component for consistency.
-   **Use Flags**: The modal dynamically displays a collection of MUI `<Chip>` components representing the plant's uses (e.g., "Food," "Medicinal"). These chips are only rendered if the corresponding data field for that use exists on the plant object, making the UI clean and data-driven.

---

## 4. Admin Management Implementation (Wiki Management)

The administrative interface provides complete control over the flora database.

### 4.1. Main View (`AdminWikiManagement.tsx`)

-   **Layout**: Utilizes the standard `AdminTemplate`, providing a familiar interface with a title, "Add New Plant" button, search bar, and data grid.
-   **Data Management**: It uses `@tanstack/react-query`'s `useQuery` to fetch plants and `useMutation` for create, update, and delete operations. After any successful mutation, it automatically invalidates the `plants` query cache (`queryClient.invalidateQueries`) to refetch data and keep the UI in sync.
-   **Actions**: The data grid includes `onEdit`, `onView`, and `onDelete` actions for each plant entry, which trigger the corresponding modals or mutations.

### 4.2. Add/Edit Modal (`AddEditPlantModal.tsx`)

-   **Dual Purpose**: A single modal handles both creating and editing plants. It checks if a `plant` prop is passed to determine if it's in "Edit Mode."
-   **Form Handling**: A complex `react-hook-form` manages all the plant's text fields.
-   **Decoupled Image Uploads**:
    -   The modal has a dedicated section for image management. When an admin uploads an image, the `uploadMutation` is triggered immediately, sending the file to the `POST /api/flora/plants/upload_image/` endpoint.
    -   The backend returns the ID and URL of the newly created `PlantImage` object. The frontend stores these IDs in a local state array (`images`).
    -   When the main form is submitted, this array of `uploaded_image_ids` is sent along with the rest of the plant data. This architecture cleanly separates the concerns of file uploading and data submission.
-   **Dynamic Use Indicators**: The modal watches the text fields for different uses. As an admin types in a use field (e.g., `food_uses`), the corresponding "Use Indicator" chip at the bottom of the form automatically highlights, providing instant visual feedback.

### 4.3. Admin Detail View (`PlantDetailsModal.tsx`)

This component is very similar to the public `FloraDetailModal` but is used within the admin context to allow administrators to quickly view the complete details of a plant before deciding to edit or delete it.

---

## 5. Backend Implementation (`flora` App)

The backend is built to be flexible and secure, with clear permissions separating public access from administrative control.

### 5.1. Data Models (`models.py`)

-   **`Plant`**: Contains all the textual information about a plant, including its scientific and common names, and various optional `TextField`s for its uses.
-   **`PlantImage`**: A separate model that stores an `ImageField` and has a `ForeignKey` relationship to the `Plant` model. This one-to-many relationship allows a single plant to have multiple images.

### 5.2. API Endpoints and Views (`urls.py` & `views.py`)

A single `PlantViewSet` manages all API interactions.

-   **Permissions**: The `get_permissions` method dynamically sets permissions based on the request's action:
    -   `list` and `retrieve` actions (i.e., `GET` requests) have `AllowAny` permission, making the encyclopedia public.
    -   All other actions (`create`, `update`, `destroy`, etc.) require `IsAdminUser`, securing the content management system.
-   **Custom Image Upload Endpoint**:
    -   The ViewSet includes a custom `@action` named `upload_image` at the `POST /api/flora/plants/upload_image/` endpoint.
    -   This action specifically handles `multipart/form-data` to receive an image file, create a `PlantImage` object, and return its ID and URL. This allows the frontend to upload images before the main plant form is even submitted.

### 5.3. Serializers (`serializers.py`)

-   **`PlantSerializer`**:
    -   **Nested Images**: It uses a nested `PlantImageSerializer` to include a list of image objects when a plant is retrieved.
    -   **Computed `uses` Field**: A `SerializerMethodField` named `get_uses` dynamically creates the `uses` object in the JSON response by checking if the various `*_uses` text fields are empty or not. This is what powers the dynamic "Use Flags" on the frontend.
    -   **`uploaded_image_ids`**: A `write_only` field that accepts a list of image IDs from the client. The serializer's `create` and `update` methods contain the logic to look up these `PlantImage` objects by their IDs and associate them with the `Plant` being created or updated.

---

## 6. Data Seeding

To quickly populate the Flora Encyclopedia with initial data for development and demonstration, a custom management command is provided.

-   **Command**: `python manage.py load_flora_data`
-   **Functionality**:
    -   The script reads from a predefined JSON-like structure containing plant data.
    -   It iterates through the data, creating `Plant` objects.
    -   Crucially, it also handles the associated images. It locates the image files in the project's `frontend/src/assets/` directory, copies them to the backend's `media/flora_images/` directory, and creates the corresponding `PlantImage` objects, linking them to the correct plant.
    -   This automates the entire setup process for the flora database.
