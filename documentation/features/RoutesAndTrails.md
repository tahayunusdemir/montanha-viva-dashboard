# Routes & Trails Feature

This document outlines the implementation plan for the routes feature, allowing users to discover and learn about trails in the Serra da Gardunha. It has been updated with data extracted from provided images and design documents to serve as a comprehensive guide for development.

## 1. Core Functionality

- **As a User,** I want to browse a list of available routes, each presented with an attractive card showing a photo, distance, duration, and difficulty level.
- **As a User,** I want to click a route card to open a modal with its detailed information, including a large map, key statistics, a description, and a button to download the map.
- **As an Admin,** I want to manage all route data, including adding, updating, and deleting routes through a dedicated admin interface.

---

## 2. Backend Implementation (Django REST Framework)

A new Django app, `routes`, will be created to manage all route-related data and logic.

### 2.1. New Models (`routes/models.py`)

The models are designed to hold all the data visible in the provided route maps and allow for future integrations with QR codes and flora information.

```python
from django.db import models
import uuid

class Route(models.Model):
    class RouteType(models.TextChoices):
        CIRCULAR = 'CIRCULAR', 'Circular'
        LINEAR = 'LINEAR', 'Linear'

    class DifficultyLevel(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    # Media files for frontend display
    card_image = models.ImageField(upload_to='routes/cards/', help_text="Image for the route list display.")
    map_image = models.ImageField(upload_to='routes/maps/', help_text="Detailed route map image.")

    # Key statistics from the maps
    distance_km = models.DecimalField(max_digits=4, decimal_places=1, help_text="Total distance in kilometers.")
    duration_hours = models.PositiveIntegerField(help_text="Estimated duration in hours.")
    duration_minutes = models.PositiveIntegerField(help_text="Estimated duration in minutes.")
    route_type = models.CharField(max_length=20, choices=RouteType.choices, default=RouteType.CIRCULAR)
    difficulty = models.CharField(max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.MEDIUM, help_text="Difficulty level of the route.")
    min_altitude_m = models.PositiveIntegerField(help_text="Minimum altitude in meters.")
    max_altitude_m = models.PositiveIntegerField(help_text="Maximum altitude in meters.")
    accumulated_climb_m = models.PositiveIntegerField(help_text="Total accumulated climb in meters.")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PointOfInterest(models.Model):
    route = models.ForeignKey(Route, related_name='points_of_interest', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Order of the POI on the trail for sorting.")

    # Future-proofing for advanced features
    # These fields can be populated in later development phases.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    qr_code = models.OneToOneField('interactions.QRCode', on_delete=models.SET_NULL, null=True, blank=True, help_text="Optional: Link to a QR code from the interactions app.")
    flora = models.ForeignKey('flora.Plant', on_delete=models.SET_NULL, null=True, blank=True, help_text="Optional: Link to a plant from the flora app.")

    class Meta:
        ordering = ['route', 'order']
        unique_together = ('route', 'order', 'name')

    def __str__(self):
        return f"{self.order}: {self.name} ({self.route.name})"
```

### 2.2. API Endpoints (`routes/urls.py`)

| Method | Endpoint                 | View              | Name           | Description                                 |
| :----- | :----------------------- | :---------------- | :------------- | :------------------------------------------ |
| `GET`  | `/api/routes/`           | `RouteListView`   | `list-routes`  | Lists all active routes for public display. |
| `GET`  | `/api/routes/<uuid:id>/` | `RouteDetailView` | `detail-route` | Retrieves all details for a single route.   |

### 2.3. Serializers and Views (`routes/serializers.py`, `routes/views.py`)

- **`PointOfInterestSerializer`**: A `ModelSerializer` for the `PointOfInterest` model. It will expose `name`, `description`, and `order`.
- **`RouteListSerializer`**: A compact serializer for the list view: `id`, `name`, `card_image`, `distance_km`, `duration_hours`, `duration_minutes`, and `difficulty`.
- **`RouteDetailSerializer`**: A comprehensive serializer for the detail view. It includes all `Route` model fields (including `difficulty`) and a nested list of `PointOfInterestSerializer` results.
- **Views**:
  - Standard `ListAPIView` and `RetrieveAPIView` will be used for read-only public access, with appropriate caching strategies.
  - The `RouteDetailView`'s `retrieve` method will log a `ROUTE_VIEWED` activity using the central `create_activity` service. After logging, it will call `check_and_award_achievements` to check if the user qualifies for any new achievements (like viewing all routes).

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. Pages and Routing (`App.tsx`)

- **`/routes`**: `RoutesPage` to display a grid of all available routes. Clicking a route will open a detail modal.
- **`/routes/:routeId`**: This route can still be used for direct linking. When visited, it should render the `RoutesPage` with the corresponding route's detail modal opened by default.

### 3.2. Components

- **`pages/RoutesPage.tsx`**:
  - Fetches data from `/api/routes/` using the `routeService`.
  - Uses an MUI `Grid` to responsively display `RouteCard` components.
  - Manages the state of the `RouteDetailModal` (e.g., which route is selected and whether the modal is open).

- **`components/routes/RouteCard.tsx`**:
  - A presentational component that receives a single route's data as props.
  - Displays `card_image`, `name`, and key stats including distance, duration, and a color-coded chip for `difficulty`.
  - On click, it triggers a handler passed from `RoutesPage` to open the detail modal with its data.

- **`components/routes/RouteDetailModal.tsx`**:
  - A modal dialog that receives a selected route's data.
  - **Layout:**
    - Prominently displays the route `name`.
    - Shows the large `map_image`.
    - Includes a **"Download Map" button** that lets the user save the map image file directly.
    - Displays all key stats (distance, duration, altitude, difficulty) using MUI `Paper` and `Typography`.
    - Renders the route `description`.
    - Lists all `points_of_interest` with their name and description.

### 3.3. API Service (`api/routeService.ts`)

```typescript
// api/routeService.ts
import { axiosInstance } from "./axiosInstance";
import { Route, RouteDetail } from "@/types/routes"; // Types to be created

export const routeService = {
  getAllRoutes: async (): Promise<Route[]> => {
    const response = await axiosInstance.get("/api/routes/");
    return response.data;
  },

  getRouteById: async (id: string): Promise<RouteDetail> => {
    const response = await axiosInstance.get(`/api/routes/${id}/`);
    return response.data;
  },
};
```

---

## 4. Admin Management Interface

The admin interface for CRUD operations on routes and their points of interest will be built using the standardized **Admin Toolkit**. For more details on the toolkit, see `AdminPanelArchitecture.md`.

### 4.1. Backend API Extensions

Admin-only endpoints, protected by `IsAdminUser` permissions, will be created under `/api/admin/routes/`. They will use a `ModelViewSet` to handle all CRUD operations for `Route` and `PointOfInterest` models, including `multipart/form-data` for image uploads.

| Method   | Endpoint                  | ViewSet Action | Name                 | Description               |
| :------- | :------------------------ | :------------- | :------------------- | :------------------------ |
| `GET`    | `/api/admin/routes/`      | `list`         | `admin-list-routes`  | List all routes.          |
| `POST`   | `/api/admin/routes/`      | `create`       | `admin-create-route` | Create a new route.       |
| `PATCH`  | `/api/admin/routes/<id>/` | `update`       | `admin-update-route` | Update an existing route. |
| `DELETE` | `/api/admin/routes/<id>/` | `destroy`      | `admin-delete-route` | Delete a route.           |

_Similar endpoints will be available for Points of Interest, likely nested under their parent route._

### 4.2. Frontend Admin Page

- **Routing and Layout:** A new page at `/admin/routes` will be added, rendered within the `AdminLayout.tsx` component.
- **Page (`/pages/admin/RoutesManagementPage.tsx`):**
  - Will use the `ResourceTable.tsx` component to list all routes.
  - An "Add New Route" button will open the `ResourceFormModal`.
  - Edit/Delete actions in the table will trigger the `ResourceFormModal` and `ConfirmDeleteDialog`.
  - The page will also include a way to manage the `PointsOfInterest` for each route, potentially in a detail view or a nested table.
- **Form (`components/admin/shared/ResourceFormModal.tsx`):**
  - The generic form will be configured for the `Route` model, including fields for all its properties and image uploads for `card_image` and `map_image`.

---

## 5. Route Data & Content

This section contains the structured data extracted from the provided images. It should be used to create initial data migrations.

| Route Name                            | Distance | Duration | Type     | Difficulty | Alt. Min/Max | Climb | Points of Interest                                                                                                                                                                                  |
| :------------------------------------ | :------- | :------- | :------- | :--------- | :----------- | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rota do Carvalhal**                 | 12.9 km  | 4h 30min | Circular | Hard       | 508m / 997m  | 695m  | 1. Souto da Casa, 2. Azenhas, Moinhos e Levadas, 3. Senhora da Gardunha, 4. Sítio do Carvalhal, 5. Flora Aquífera, 6. Pinhal Florestal                                                              |
| **Rota dos Castanheiros**             | 13.0 km  | 4h 00min | Circular | Hard       | 497m / 825m  | 591m  | 1. Donas, 2. Cerejais, 3. "Levadas" e Moinhos, 4. Soutos (Bosque de Castanheiro), 5. Alcongosta                                                                                                     |
| **Caminho Histórico de Castelo Novo** | 2.7 km   | 1h 54min | Circular | Easy       | 582m / 664m  | 126m  | _(Numbered points on map, to be detailed later)_                                                                                                                                                    |
| **Rota da Cereja**                    | 9.9 km   | 3h 30min | Circular | Medium     | 580m / 889m  | 534m  | 1. Alcongosta, 2. Cerejais, 3. Cestaria e Esparto, 4. Miradouros                                                                                                                                    |
| **Rota da Gardunha**                  | _TBD_    | _TBD_    | _TBD_    | _TBD_      | _TBD_        | _TBD_ | _(Descriptive text in brochure, key points: Minas do Barroqueiro, Castelo Velho, Poldras da Fórnea). Requires manual data entry._                                                                   |
| **Rota da Marateca**                  | 14.0 km  | 3h 30min | Circular | Medium     | 375m / 450m  | 100m  | 1. Vila da Soalheira, 2. Quintas e Campos de Pastoreiro, 3. Albufeira de Santa Águeda, 4. Habitats de Avifauna, 5. Queijarias                                                                       |
| **Rota da Pedra d'Hera**              | 6.7 km   | 1h 50min | Circular | Medium     | 507m / 824m  | 318m  | 1. Zona Antiga do Fundão, 2. Cerejais, 3. Castro de São Brás, 4. Bosque de Fagáceas, 5. Conjunto de Pedra d'Hera e Miradouro, 6. Convento e Capela de Nossa Senhora do Seixo, 7. Parque do Convento |
| **Rota da Portela da Gardunha**       | 12.8 km  | 3h 40min | Circular | Medium     | 523m / 750m  | 472m  | 1. Alcaide, 2. Portela da Gardunha, 3. Biodiversidade, 4. Vale de Prazeres                                                                                                                          |

---

## 6. Gamification & Future Integrations

- **QR Codes**: The enhanced `PointOfInterest` model includes an optional link to a `QRCode`, allowing a direct connection between a physical location and digital content. Scanning a code will reveal information about the POI.
- **Route Completion Logic**: A route is considered "completed" by a user when they have successfully scanned the QR codes linked to _all_ `PointOfInterest` records associated with that route. After each successful scan, the `check_and_award_achievements` service should check if this scan completes a route.
- **Achievements**: The `AchievementsAndGamification.md` document should be updated to include route-based criteria.
  - **New Criteria**: `'ROUTES_VIEWED'` (when a user views a route's detail page) and `'ROUTES_COMPLETED'` (when the completion logic is met).
  - **Example Achievements**:
    - "Armchair Tourist": View details for 3 different routes.
    - "Trailblazer": Complete your first route.
    - "Gardunha Master": Complete all 8 routes.
- **Flora Integration**: The `PointOfInterest` model's `flora` field allows a direct link to a plant in the encyclopedia. If a user scans a QR code at a POI linked to a plant, this action should also trigger the `PLANT_DISCOVERED` activity, contributing to flora-related achievements.
