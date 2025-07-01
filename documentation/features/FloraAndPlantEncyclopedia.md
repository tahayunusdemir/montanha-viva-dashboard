# Flora & Plant Encyclopedia Feature

This document outlines the implementation plan for the flora encyclopedia feature. This system will serve as a comprehensive, user-facing database of the plants found in the Serra da Gardunha, based on the content provided in `PaginaMontanhaVivaContent.md`.

## 1. Core Functionality

- **As a User,** I want to browse a visually appealing catalog of all plants.
- **As a User,** I want to be able to search for plants by their scientific or common names.
- **As a User,** I want to select a plant to view its detailed page, which includes multiple images, its common and scientific names, and detailed descriptions of its uses (medicinal, food, ornamental, etc.) and its interaction with local fauna.
- **As an Admin,** I want a dedicated interface to manage all plant data, including adding new plants, editing existing information, and uploading images.

---

## 2. Backend Implementation (Django REST Framework)

A new Django app, `flora`, will be created to house all related models and logic.

### 2.1. New Models (`flora/models.py`)

The models are designed to store the rich data extracted from the project's content documents.

```python
from django.db import models
import uuid

class Plant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scientific_name = models.CharField(max_length=255, unique=True)
    common_names = models.CharField(max_length=512, help_text="Comma-separated list of common names.")

    # Rich text fields for detailed information
    description = models.TextField(blank=True, help_text="General description of the plant.")
    fauna_interaction = models.TextField(blank=True, help_text="Details about interaction with fauna.")
    medicinal_uses = models.TextField(blank=True)
    food_uses = models.TextField(blank=True)
    ornamental_uses = models.TextField(blank=True)
    traditional_uses = models.TextField(blank=True)
    aromatic_uses = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scientific_name']

    def __str__(self):
        return self.scientific_name

class PlantImage(models.Model):
    plant = models.ForeignKey(Plant, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='flora/images/')
    caption = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['plant']

    def __str__(self):
        return f"Image for {self.plant.scientific_name}"
```

### 2.2. API Endpoints (`flora/urls.py`)

The API will provide public, read-only endpoints for the frontend and protected endpoints for the admin interface.

| Method | Endpoint                | View              | Name           | Description                                     |
| :----- | :---------------------- | :---------------- | :------------- | :---------------------------------------------- |
| `GET`  | `/api/flora/`           | `PlantListView`   | `list-plants`  | Lists all active plants for the public catalog. |
| `GET`  | `/api/flora/<uuid:id>/` | `PlantDetailView` | `detail-plant` | Retrieves all details for a single plant.       |

_Note: Admin endpoints are consolidated into a ViewSet. See the Admin Management Interface section for details._

### 2.3. Serializers & Views

- **`PlantImageSerializer`**: A `ModelSerializer` for the `PlantImage` model.
- **`PlantListSerializer`**: A compact serializer for the catalog view, including `id`, `scientific_name`, `common_names`, and the primary image.
- **`PlantDetailSerializer`**: A comprehensive serializer including all `Plant` model fields and a nested list of all `PlantImageSerializer` results.
- **Views**: Public views will be standard `ListAPIView` and `RetrieveAPIView`.
  - The `PlantDetailView`'s `retrieve` method will log a `PLANT_VIEWED` activity using the `create_activity` service. After logging, it will call `check_and_award_achievements` to verify if the user has unlocked the "view all plants" achievement.
  - Admin views will be handled by a `ModelViewSet` protected with `IsAdminUser` permissions.

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. Pages and Routing (`App.tsx`)

- **`/flora`**: `FloraCatalogPage` to display a searchable and filterable grid of all plants.
- **`/flora/:plantId`**: `FloraDetailPage` for the complete information of a selected plant.

### 3.2. Components

- **`pages/FloraCatalogPage.tsx`**:
  - Fetches data from `/api/flora/`.
  - Includes a search bar to filter plants by name.
  - Uses an MUI `Grid` to display `PlantCard` components.

- **`components/flora/PlantCard.tsx`**:
  - A presentational component showing a plant's main image, scientific name, and common names.
  - Links to the `FloraDetailPage`.

- **`pages/FloraDetailPage.tsx`**:
  - Fetches data for a single plant from `/api/flora/:plantId/`.
  - **Layout:**
    - A main title with the `scientific_name` and `common_names`.
    - An image gallery/carousel to display all `images`.
    - Dedicated sections for each information field (Description, Medicinal Uses, etc.), only rendering a section if the data exists.

### 3.3. API Service (`api/floraService.ts`)

A new `floraService.ts` will be created with functions like `getAllPlants()` and `getPlantById(id)`.

### 3.4. Views

- **`PlantDetailView`**: A comprehensive serializer including all `Plant` model fields and a nested list of all `PlantImageSerializer` results.
- **Views**: Public views will be standard `ListAPIView` and `RetrieveAPIView`. Admin views will handle CRUD logic and will be protected with `IsAdminUser` permissions.
  - The `PlantDetailView`'s `retrieve` method will log a `PLANT_VIEWED` activity using the `create_activity` service. After logging, it will call `check_and_award_achievements` to verify if the user has unlocked the "view all plants" achievement.

---

## 4. Admin Management Interface

The flora database will be managed through a dedicated, admin-only UI built with the reusable **Admin Toolkit**. This ensures a consistent and efficient workflow. For more details on the toolkit, see `AdminPanelArchitecture.md`.

- **Routing and Layout:** A new page at `/admin/flora` will be created, protected and rendered within the main `AdminLayout.tsx`. A link will appear in the admin side menu.

- **Page (`/pages/admin/FloraManagementPage.tsx`):**
  - Will use the generic `ResourceTable.tsx` to list all plants, with columns for scientific name, common names, and status.
  - The "Add Plant" button will open the `ResourceFormModal`.
  - "Edit" and "Delete" actions in the table will use the `ResourceFormModal` and `ConfirmDeleteDialog`, respectively.

- **Form (`components/admin/shared/ResourceFormModal.tsx`):**
  - The generic form modal will be configured for the `Plant` model's fields.
  - It will include a multi-file upload component for managing the plant's images, which can be a specialized field type within the form configuration.

- **API Service (`api/adminService.ts`):**
  - The shared admin service will be extended with functions for `getPlants`, `createPlant`, `updatePlant`, and `deletePlant`, which will handle `multipart/form-data` for image uploads.

- **API:** A `ModelViewSet` at `/api/admin/flora/` will provide full CRUD functionality, protected by `IsAdminUser` permissions.

---

## 5. Integrations with Other Features

The Flora feature is a central content hub and will connect to several other systems.

- **Routes & Trails:**
  - The `PointOfInterest` model in the `routes` app already has a `ForeignKey` to the `flora.Plant` model.
  - When viewing a route, a POI linked to a plant will display the plant's name as a link to its `FloraDetailPage`.

- **AI Plant Identification:**
  - When the `ai_features` system successfully identifies a plant, the result will be a direct `ForeignKey` link to an entry in the `flora.Plant` model. This robust connection ensures data integrity.
  - A successful identification by the AI will trigger the `PLANT_DISCOVERED` activity in the `core` app, which is used for gamification.
  - The results screen will show the plant's name and a prominent link: "Learn more about [Plant Name]", which navigates to the corresponding `FloraDetailPage`.

- **Achievements & Gamification:**
  - A new achievement criterion will be added in `achievements/models.py`:
    `('PLANTS_DISCOVERED', 'Unique Plants Discovered')`
  - **Discovery Mechanism**: A plant is considered "discovered" by a user when one of two conditions is met:
    1.  The user successfully identifies the plant using the **AI feature**.
    2.  The user scans a **QR code** at a `PointOfInterest` that is linked to that specific plant via the `flora` field.
  - This system rewards active engagement rather than passive browsing. The `check_and_award_achievements` service will track these discoveries.
  - **Example Achievements:**
    - **"Curious Observer"**: Discover your first plant.
    - **"Budding Botanist"**: Discover 10 different plants.
    - **"Serra Expert"**: Discover all plants in the catalog.
