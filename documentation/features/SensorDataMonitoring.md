# Sensor Data Monitoring Feature

This document outlines the implementation plan for the sensor data monitoring feature, which allows users to view and analyze data from IoT weather stations. The architecture is designed to integrate seamlessly with the existing Django backend and React frontend.

## 1. Core Functionality

- **As a User,** I want to view time-series data from various weather stations.
- **As a User,** I want to select a specific station from a list.
- **As a User,** I want to select a date and time range to filter the data.
- **As a User,** I want to use pre-set quick filters like "Last Hour," "Last Day," and "Last Week."
- **As a User,** I want to choose which data types (e.g., Temperature, Humidity, Wind Speed) are displayed in the results table.
- **As an Admin,** I want a dedicated interface to manage all IoT stations (CRUD operations).
- **As an Admin,** I want to view the status of each station, including its last reported data point.
- **As an Admin,** I want to set a station to be `active` or `inactive`.

---

## 2. Backend Implementation (Django REST Framework)

A new Django app, `sensors`, will be created to manage all logic related to IoT stations and their data. This approach replaces the standalone Flask application (`app.py`) to ensure tight integration with the main project.

### 2.1. New Models (`sensors/models.py`)

```python
from django.db import models
import uuid

class Station(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # The unique identifier sent by the physical device, e.g., '1w6230'
    station_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255, help_text="A human-readable name for the station.")
    location = models.CharField(max_length=255, blank=True, help_text="Descriptive location of the station.")
    is_active = models.BooleanField(default=True, help_text="Controls whether the station is shown to users.")
    last_seen = models.DateTimeField(null=True, blank=True, help_text="Timestamp of the last received measurement.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.station_id})"

class Measurement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='measurements')
    measurement_type = models.CharField(max_length=100, db_index=True, help_text="e.g., 'temperature_°c', 'humidity_%'")
    value = models.FloatField()
    timestamp = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['station', 'measurement_type', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.measurement_type}: {self.value} at {self.timestamp}"
```

### 2.2. API Endpoints

| Method | Endpoint                     | ViewSet/View          | Name                  | Description                                        |
| :----- | :--------------------------- | :-------------------- | :-------------------- | :------------------------------------------------- |
| `POST` | `/api/sensors/ingest/`       | `IngestDataView`      | `ingest-data`         | **Secured Endpoint** for IoT devices to post data. |
| `GET`  | `/api/sensors/stations/`     | `StationListView`     | `list-stations`       | Lists all `active` stations for user selection.    |
| `GET`  | `/api/sensors/measurements/` | `MeasurementDataView` | `get-measurements`    | Fetches measurement data based on filter criteria. |
| `GET`  | `/api/admin/stations/`       | `AdminStationViewSet` | `admin-list-stations` | **Admin Only.** Manages all station information.   |

### 2.3. Views & Logic

- **`IngestDataView`**:
  - Secured via an API Key or another token mechanism.
  - Receives data in the format defined by `send_iot_data.py`.
  - Uses `get_or_create` to register a new `Station` if the `station_id` is new. Updates `last_seen`.
  - Bulk-creates `Measurement` objects for efficiency.
- **`MeasurementDataView`**:
  - A `ListAPIView` that accepts query parameters: `station_id`, `start_date`, `end_date`, `types` (comma-separated).
  - Logs user activity: `create_activity(user, 'SENSOR_DATA_VIEWED', ...)`
- **`AdminStationViewSet`**:
  - A `ModelViewSet` for `Station`, using the `IsAdminUser` permission.
  - Follows the pattern of the [Admin Panel Architecture](mdc:docs/Features/AdminPanelArchitecture.md).

---

## 3. Frontend Implementation (React, MUI)

### 3.1. New Page (`pages/dashboard/views/SensorDataView.tsx`)

This new view will be added to the main dashboard layout and navigation.

- **State Management:** Will use local state or a dedicated Zustand store for managing filters and fetched data.
- **Controls:**
  - An MUI `Select` component to choose from the list of stations fetched from `/api/sensors/stations/`.
  - Date and time pickers (e.g., from MUI X) for setting the start and end of the query range.
  - A `ButtonGroup` for quick filters: "Last Hour," "Last Day," "Last Week."
  - An MUI `Autocomplete` with `multiple` enabled for selecting which measurement types to display.
- **Data Display:**
  - An MUI `DataGrid` will display the results. It will be configured with columns corresponding to the available sensor data types.
  - **Table Columns:** The primary columns will be:
    - `Timestamp`: The date and time of the measurement.
    - `Temperature (°C)`
    - `Humidity (%)`
    - `Pressure (hPa)`
    - `Wind Speed (km/h)`
    - `Max Wind Speed (km/h)`
    - `Precipitation (mm)`
    - `Wind Direction`
    - `Soil Moisture (%)`
  - **CSV Export:** The `DataGrid`'s built-in toolbar will be enabled to provide users with a one-click option to download the currently displayed data as a CSV file.
  - The grid will be filterable and sortable.
  - A loading overlay will be shown while data is being fetched.
  - A simple chart component could be added later to visualize the data.

### 3.2. New API Service (`api/sensorService.ts`)

```typescript
// api/sensorService.ts
import { axiosInstance } from "./axiosInstance";
import { Station, Measurement } from "@/types/sensors";

export const sensorService = {
  getActiveStations: async (): Promise<Station[]> => {
    const response = await axiosInstance.get("/api/sensors/stations/");
    return response.data;
  },
  getMeasurements: async (params: URLSearchParams): Promise<Measurement[]> => {
    const response = await axiosInstance.get(
      `/api/sensors/measurements/?${params.toString()}`,
    );
    return response.data;
  },
};
```

### 3.3. Admin Management Interface

The station management UI will be built using the reusable **Admin Toolkit**.

- **New Admin Page (`/pages/admin/AdminStationsView.tsx`):**
  - A new route `/admin/stations` will be added.
  - The page will use `ResourceTable.tsx` to list all stations from `/api/admin/stations/`.
  - Columns will include `name`, `station_id`, `location`, `is_active` (with a toggle switch), and `last_seen`.
  - "Create", "Edit", and "Delete" actions will be handled by the `ResourceFormModal.tsx` and `ConfirmDeleteDialog.tsx` components, configured for the `Station` model.
- **API Service:** The `api/adminService.ts` file will be updated to include CRUD functions for stations.

---

## 4. Integration with Core Systems

- **User Activity:** A new activity type will be added to `core/models.py` to track user engagement with this feature.
- **Gamification:** A new achievement can be created to reward users for exploring sensor data.
