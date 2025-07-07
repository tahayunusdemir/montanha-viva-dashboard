# Montanha Viva - Weather System Report

This document provides a detailed analysis of the integrated Weather system. It covers the architecture from the user-facing dashboard widget to the backend service that acts as a proxy and cache for the external IPMA (Portuguese Institute for Sea and Atmosphere) API.

## 1. Overview

The Weather system is a user experience enhancement feature designed to provide real-time, relevant weather information directly within the Montanha Viva dashboard. It functions as an intelligent proxy, fetching data from an official external source (IPMA) and caching it efficiently to ensure both data freshness and system performance. This provides users with immediate environmental context, helping them plan their activities related to other platform features like Routes and Flora exploration.

-   **Frontend**: A compact and intuitive `WeatherWidget` is integrated into the main dashboard navigation. It provides at-a-glance weather information and allows users to explore forecasts for different locations.
-   **Backend**: A lightweight, model-less Django app that serves as a dedicated proxy. It handles all communication with the external IPMA API and implements a robust caching strategy to minimize redundant external calls.

## 2. Core Features

The system is designed for efficiency and user convenience.

| Feature                      | User Role   | Description                                                                                                                                                             |
| :--------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **List Available Locations** | User        | Users can retrieve a list of all official weather monitoring locations (districts and islands) provided by IPMA.                                                        |
| **View 5-Day Forecast**      | User        | For any selected location, users can view a detailed 5-day weather forecast, including temperature, precipitation probability, and weather conditions.                    |
| **Efficient Caching**        | System      | To optimize performance and respect the external API's limits, location data is cached for 24 hours, and specific forecast data is cached for 15 minutes.                |
| **Seamless UI Integration**  | User        | The feature is presented as a clean, self-contained widget in the dashboard's header, providing quick access without cluttering the main content area.                     |

---

## 3. Frontend Implementation (`WeatherWidget.tsx`)

As detailed in the `DashboardGeneral-report.md`, the weather feature is encapsulated in a reusable `WeatherWidget.tsx` component.

-   **Location and Display**: The widget is prominently placed in the dashboard's `Header` (for desktop) and `AppNavbar` (for mobile), ensuring it's always accessible.
-   **Workflow**:
    1.  The widget fetches the list of available locations from the `/api/weather/locations/` endpoint.
    2.  It displays the current weather for a default or previously selected location.
    3.  Users can click on the widget to open a popover or dropdown.
    4.  Inside the popover, users can select a different location from the list.
    5.  Upon selection, the widget calls the `/api/weather/forecast/<location_id>/` endpoint to retrieve and display the new forecast data.
-   **User Feedback**: The component is designed to handle loading states (while fetching data) and potential error states (e.g., if the backend reports that the IPMA API is unavailable), providing clear feedback to the user.

---

## 4. Backend Implementation (`weather` App)

The backend implementation is a prime example of a microservice-oriented approach within a monolith. It's a self-contained Django app with no database models, whose sole responsibility is to communicate with the IPMA API.

### 4.1. API Endpoints (`urls.py`)

The app exposes two clear, public-facing endpoints.

| Method | Endpoint                             | View                 | Name                 | Description                                    |
| :----- | :----------------------------------- | :------------------- | :------------------- | :--------------------------------------------- |
| `GET`  | `/api/weather/locations/`            | `LocationListView`   | `weather-locations`  | Returns a cached list of all IPMA locations.   |
| `GET`  | `/api/weather/forecast/<int:location_id>/` | `ForecastView`       | `weather-forecast`   | Returns a cached 5-day forecast for a specific location ID. |

### 4.2. Views & Caching Strategy (`views.py`)

The views handle the logic for fetching, caching, and serving the data.

-   **`LocationListView`**:
    -   **Action**: Fetches the list of all districts and islands from the IPMA "open-data" endpoint.
    -   **Logic**: Before making an external call, it first checks for a cached result using the key `"weather_locations"`.
    -   **Output**: If no cache is found, it fetches the data, sorts it alphabetically by location name, saves it to the cache for 24 hours, and then returns it.
-   **`ForecastView`**:
    -   **Action**: Fetches a 5-day forecast for a specific `location_id`.
    -   **Logic**: It uses a dynamic cache key (`f"weather_forecast_{location_id}"`) to store forecasts for each location independently. It checks for a cached result before making the external API call.
    -   **Output**: If no cache is found, it fetches the data, saves it to the cache for 15 minutes, and returns it.
-   **Error Handling**: Both views are wrapped in `try...except` blocks. If the external `requests.get()` call fails for any reason (e.g., timeout, 4xx/5xx error from IPMA), the view catches the `RequestException` and returns a `503 Service Unavailable` response to the frontend, clearly indicating that the issue is with the external data provider. 