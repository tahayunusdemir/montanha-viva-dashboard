# Montanha Viva - Station & Sensor Data System Report

This document provides a detailed analysis of the Station and Sensor Data system. It covers the end-to-end architecture, from the administrative interface for managing physical IoT stations to the powerful public-facing dashboard for visualizing the time-series data they collect.

## 1. Overview

The Station and Sensor Data system is the core of the project's real-time environmental monitoring capabilities. It is composed of two primary parts: a secure administrative area for managing the physical IoT stations and a dynamic, user-friendly interface for fetching, visualizing, and exporting the measurement data collected by these stations.

-   **Frontend (Admin)**: A standard CRUD (Create, Read, Update, Delete) interface that allows administrators to register new IoT stations, update their details (like name and location), and manage their active status.
-   **Frontend (Public)**: A sophisticated data exploration page where users can select a station, a date range, and specific measurement types to visualize data in both table and chart formats. It also includes data export functionality.
-   **Backend**: A robust Django REST Framework API that handles station management, provides a dedicated endpoint for high-volume IoT data ingestion, and serves filtered time-series data to the visualization dashboard.

## 2. Core Features

The system offers a distinct set of features for administrators and public users.

| Feature                      | User Role   | Description                                                                                                                                                             |
| :--------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Manage Stations**          | Admin       | Administrators can perform full CRUD operations on IoT stations, including setting a unique Station ID, a descriptive name, and an active status.                           |
| **Select Station & Date**    | Public      | Users can select from a list of active stations and use a date picker to define a specific time window for which they want to retrieve data.                                |
| **View Data Availability**   | Public      | After selecting a station, the UI automatically displays the date range of the earliest and latest available data for that station, guiding the user's selection.           |
| **Fetch & Visualize Data**   | Public      | Users can fetch data for the selected criteria. The data is then displayed in two switchable formats: a dynamic chart and a detailed, sortable table.                      |
| **Filter Measurement Types** | Public      | After fetching data, users can select or de-select specific measurement types (e.g., "temperature," "humidity") to dynamically update both the chart and table views.   |
| **Export Data**              | Public      | Users can export the currently displayed data as a CSV file or download a PNG image of the chart for reporting and external analysis.                                       |

---

## 3. Station Management Implementation (Admin)

The administrative functions are handled by the `AdminStationManagament.tsx` page and its related components.

-   **Layout**: The page uses the project's standard `AdminTemplate`, ensuring a consistent management experience with a title, "Add New Station" button, and a data grid.
-   **Data Display**: All registered stations are fetched via the `useStations` hook and displayed in a data grid, showing the Station ID, Name, Location, and a colored "Active/Inactive" status chip.
-   **Add/Edit Modal (`AddEditStationModal.tsx`)**:
    -   A single modal is used for both creating and editing stations.
    -   It uses `react-hook-form` for validation.
    -   Key fields include `station_id` (which is read-only in edit mode), `name`, `location`, and an `is_active` toggle switch.
-   **Details Modal (`StationDetailsModal.tsx`)**: A simple modal for viewing all details of a selected station in a read-only format.

---

## 4. Sensor Data Visualization Implementation (Public)

The `SensorData.tsx` page is a sophisticated data exploration tool.

### 4.1. Control Panel

-   **Workflow**: The UI guides the user through a 3-step process: select a station, select a date range, and click "Get Data."
-   **`StationSelector.tsx`**: A dropdown populated with all active stations from the `GET /api/stations/` endpoint.
-   **`DateRangePicker.tsx`**: Uses MUI X Date Pickers to provide a calendar interface for selecting a start and end date. It is dynamically updated with the min/max available dates fetched from the `GET /api/stations/{id}/availability/` endpoint.
-   **`MeasurementTypeSelector.tsx`**: After data is fetched, this component displays a series of `Chip` buttons for each available measurement type. Users can click these chips to toggle the visibility of that data series in the chart and table.

### 4.2. Data Display

-   **Tabbed View**: Users can switch between "Table" and "Chart" views of the data.
-   **`MeasurementTable.tsx`**:
    -   This component receives the raw measurement data and "pivots" it, transforming the row-based data into a column-based format where each measurement type becomes its own column.
    -   It uses the MUI X `DataGrid` to display the pivoted data, providing automatic sorting and pagination.
-   **`SensorChart.tsx`**:
    -   This component performs a similar data pivot to prepare the data for charting.
    -   It uses the `recharts` library to render a `LineChart`, automatically assigning different colors to the line for each measurement type.
    -   It exposes an `exportAsPng` function via a `ref`, allowing the parent component to trigger a PNG download of the chart.

### 4.3. Data Export

-   **CSV Export**: When viewing the table, a "Download as CSV" button triggers a mutation that converts the pivoted data into a CSV string and uses `file-saver` to initiate a download.
-   **PNG Export**: When viewing the chart, a "Download as PNG" button calls the chart's exported function and uses `html-to-image` and `file-saver` to download the chart as an image.

---

## 5. Backend Implementation (`stations` App)

The backend is architected to handle both admin management and high-volume data operations efficiently.

### 5.1. Data Models (`models.py`)

-   **`Station`**: A simple model representing a physical IoT device. The `station_id` is the primary key and is intended to be a unique identifier sent by the device itself.
-   **`Measurement`**: Stores individual data points. It has a `ForeignKey` to a `Station` and stores the `measurement_type` (e.g., "temperature"), the `value`, and the `recorded_at` timestamp.

### 5.2. API Endpoints and Views (`views.py`)

-   **`StationViewSet`**: A `ModelViewSet` that dynamically adjusts permissions. `GET` requests are allowed for any authenticated user (but are filtered to only show active stations for non-admins), while write operations (`POST`, `PUT`, `DELETE`) are restricted to admin users.
-   **`MeasurementViewSet`**: A `ReadOnlyModelViewSet` that serves measurement data. It performs server-side filtering based on `station_id`, `start`, and `end` query parameters, ensuring the client only receives the data it has requested.
-   **`DataIngestionView` (`POST /api/iot-data/`)**: A dedicated, unauthenticated (for now) endpoint designed to receive data from IoT devices. It expects a JSON payload containing a `station_id` and a list of measurements. It automatically creates the `Station` if it doesn't exist and is optimized to handle bulk measurement creation. It uses a special `MeasurementCreateSerializer` to handle incoming Unix timestamps.
-   **`StationDataAvailabilityView` (`GET /api/stations/{id}/availability/`)**: A highly efficient, read-only endpoint that performs a single database query to find the minimum and maximum `recorded_at` timestamp for a given station. This allows the frontend to know the valid date range for a station without having to fetch any actual measurement data.
