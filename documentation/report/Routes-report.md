# Montanha Viva - Routes System Report

This document provides a detailed analysis of the Routes system. It covers the end-to-end architecture, from the public-facing "Routes Encyclopedia" for users to the comprehensive administrative interface for creating and managing trail routes.

## 1. Overview

The Routes system is a core feature designed to provide users with detailed information about hiking and exploration trails. It serves as both a public-facing guide for adventurers and a powerful content management system for administrators to curate the available routes.

- **Frontend (Public)**: A rich, interactive "Routes Encyclopedia" where users can browse, search, and filter available trails. A detailed modal view provides comprehensive information for each route, including key stats, a map, and points of interest.
- **Frontend (Admin)**: A full CRUD (Create, Read, Update, Delete) interface within the admin dashboard. It allows administrators to manage every detail of a route, including uploading map images and GPX files.
- **Backend**: The Django REST Framework API is cleanly divided into two parts: a public, read-only set of endpoints for the encyclopedia and a secure, admin-only set of endpoints for all management tasks.

## 2. Core Features

The system provides a distinct set of features for public users and administrators.

| Feature                  | User Role | Description                                                                                                                                                       |
| :----------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discover Routes**      | Public    | All users can browse a visually appealing grid of available trail routes.                                                                                         |
| **Search & Filter**      | Public    | Users can search for routes by name or description and filter the list by difficulty level ("Easy," "Medium," "Hard").                                            |
| **View Route Details**   | Public    | Clicking a route opens a detailed modal with key statistics (distance, duration, altitude), a description, an image of the map, and a list of points of interest. |
| **Download Map**         | Public    | From the detail view, users can download the route's map image for offline use.                                                                                   |
| **Create & Edit Routes** | Admin     | Administrators can create new routes or edit existing ones through a comprehensive form that includes all route parameters.                                       |
| **Upload Route Files**   | Admin     | Admins can upload a "card image" for the encyclopedia, a "map image" for the detail view, and an optional GPX file for GPS devices.                               |
| **Manage Route Details** | Admin     | The admin form allows for detailed input of route stats, descriptions, and a comma-separated list of points of interest.                                          |
| **Delete Routes**        | Admin     | Administrators can permanently remove a route and its associated files from the database.                                                                         |

---

## 3. Public-Facing Implementation (Routes Encyclopedia)

The public encyclopedia is designed to be an intuitive and informative portal for trail discovery.

### 3.1. Main View (`RoutesEncyclopedia.tsx`)

- **Technology Stack**: Built with React, Material-UI, and `@tanstack/react-query` to fetch and cache the list of public routes.
- **Layout & Filtering**:
  - The page features a main search bar and a "Filter by Difficulty" dropdown.
  - The `usePublicRoutes` hook from the route service is called with the search and filter parameters. The backend API handles the filtering logic, ensuring that only relevant data is sent to the client.
- **Display**: Routes are displayed in a responsive grid of `RouteCard` components. The page handles loading and error states, showing a progress indicator or an alert message as needed.

### 3.2. Route Card (`RouteCard.tsx`)

- **Purpose**: This component provides an attractive, at-a-glance summary of a route in the main grid.
- **Visuals**: It displays the route's primary card image with a custom-styled `DifficultyChip` that changes color based on the difficulty level (green for Easy, yellow for Medium, red for Hard).
- **Information**: Key stats like duration, distance, and accumulated climb are displayed with icons for quick recognition.
- **Interaction**: The entire card is a clickable area that opens the `RouteDetailModal`.

### 3.3. Detail Modal (`RouteDetailModal.tsx`)

- **Functionality**: This modal presents all the detailed information for a selected route.
- **Content**:
  - It displays a large version of the route's map image.
  - A dedicated `DetailItem` component is used to neatly display all key stats (Distance, Duration, Difficulty, Altitude, etc.).
  - It parses the comma-separated `points_of_interest` string from the API and displays it as a formatted list.
- **Actions**: The modal includes a "Download Map" button (which opens the map image in a new tab) and a "Close" button.

---

## 4. Admin Management Implementation

The admin interface provides complete and granular control over the routes database.

### 4.1. Main View (`AdminRoutesManagement.tsx`)

- **Layout**: Follows the project's standard by using the `AdminTemplate` component, ensuring a consistent UI with a title, "Add New Route" button, search functionality, and a data grid.
- **Data Management**: Uses the `useRoutes` hook to fetch all routes for the admin grid and `useDeleteRoute` for deletions. The component manages the state for the add/edit and view modals.
- **Data Grid**: The MUI X `DataGrid` is configured to show key administrative columns: ID, Name, Difficulty, Distance, and Duration.

### 4.2. Add/Edit Modal (`AddEditRouteModal.tsx`)

- **Dual Purpose**: A single, powerful modal handles both creating and editing routes.
- **Validation**: It uses the `zod` library (`zodResolver`) for robust, schema-based form validation, ensuring all required fields are correctly formatted before submission.
- **File Handling**: The form includes three separate file inputs for the **Card Image**, **Map Image**, and optional **GPX File**.
  - A reusable `FileInput` component is used to provide a consistent UI for these uploads.
  - When editing, the modal shows the name of the existing file. A new file can be uploaded to replace it.
- **API Interaction**: The `useCreateRoute` and `useUpdateRoute` mutation hooks are used to submit the form data. As the form includes files, the submission is sent as `multipart/form-data`.

---

## 5. Backend Implementation (`routes` App)

The backend is architected to cleanly separate public and administrative concerns.

### 5.1. Data Model (`models.py`)

- **`Route`**: A single, comprehensive model contains all information about a trail.
  - It uses `choices` on fields like `route_type` and `difficulty` to enforce data consistency at the database level.
  - It includes three distinct file fields: `image_card`, `image_map`, and `gpx_file`, each configured to upload to its respective directory in the `media` folder.

### 5.2. API Endpoints and Views (`urls.py` & `views.py`)

- **Segregated ViewSets**: The application uses two different `ModelViewSet`s to handle requests:
  1.  **`PublicRouteViewSet`**: A `ReadOnlyModelViewSet` that only allows `list` and `retrieve` operations. It has `AllowAny` permission and is configured with `SearchFilter` and `DjangoFilterBackend` to power the public encyclopedia's search and filter features directly in the database query.
  2.  **`AdminRouteViewSet`**: A full `ModelViewSet` that allows all CRUD operations. It is protected by the `IsAdminUser` permission, ensuring only administrators can create, update, or delete routes. It uses the `MultiPartParser` to handle the file uploads from the admin form.
- **URL Segregation**: The two viewsets are registered on different URL paths. Public routes are at `/api/routes/`, while the admin routes are located at `/api/routes/admin/`, providing a clear separation of concerns.

### 5.3. Serializer (`serializers.py`)

- **`RouteSerializer`**: A single `ModelSerializer` is sufficient for this system. It directly maps to the `Route` model and includes all fields, making it suitable for both reading route data (for the public) and writing route data (for the admin).

---

## 6. Data Seeding

To facilitate initial setup and testing, the project includes a data seeding command to populate the database with predefined trail routes.

- **Command**: `python manage.py load_routes_data`
- **Functionality**:
  - The script reads route data from a predefined structure within the command file.
  - For each route, it creates or updates the corresponding `Route` instance in the database.
  - It handles local file paths for images (`image_card`, `image_map`) and copies them into the Django `media` directory, linking them correctly to the created `Route` objects.
  - This allows developers to quickly spin up a new instance of the application with a full set of sample data without manual entry.
