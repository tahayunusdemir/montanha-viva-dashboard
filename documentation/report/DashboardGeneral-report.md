# Montanha Viva - Dashboard System Report

This document provides a general architectural overview of the authenticated user dashboard. It details the main layout, core components, navigation system, and the design principles that create a cohesive and powerful user experience.

## 1. Overview

The Montanha Viva Dashboard is a comprehensive, feature-rich single-page application (SPA) environment for authenticated users. It serves as the central hub for all user interactions, from viewing real-time sensor data to managing system entities (for administrators). The architecture is designed to be modular, scalable, and maintainable, using a component-based approach with clear separation of concerns.

-   **Layout**: A classic and responsive dashboard layout with a persistent side navigation for desktops and a top navigation bar for mobile devices.
-   **Routing**: Utilizes `react-router-dom`'s nested routing capabilities with the `<Outlet />` component to dynamically render different views within a consistent layout.
-   **Styling & Theming**: Leverages Material-UI (MUI) for all UI components, but goes a step further by implementing deep theme customizations for advanced `MUI X` components (Data Grids, Charts, etc.) to ensure a unique and branded look and feel.
-   **Role-Based Access Control (RBAC)**: The dashboard clearly distinguishes between standard user views and administrator views, with navigation and access controlled based on the user's `is_staff` status from the backend.

---

## 2. Core Layout & Structure (`Dashboard.tsx`)

The file `Dashboard.tsx` is the foundational component for the entire authenticated experience. It establishes the main layout and integrates all primary UI elements.

-   **Main Structure**: The layout is built using a primary Flexbox container (`<Box sx={{ display: 'flex' }}>`) that holds the navigation and the main content area.
-   **Navigation Components**:
    -   **`SideMenu`**: A permanent vertical navigation drawer displayed on desktop screens (`md` and up).
    -   **`AppNavbar`**: A horizontal top app bar that is displayed only on mobile screens (`xs` and `sm`).
-   **Content Area**:
    -   A `<Box component="main">` serves as the container for all page content.
    -   **`Header`**: A header section within the main content area (for desktops) that displays breadcrumbs and key widgets.
    -   **`<Outlet />`**: This is the most critical part for content rendering. It's a placeholder from `react-router-dom` where all nested child routes (the different dashboard pages/views) are rendered. This allows the main layout (navigation, header) to remain persistent while the content changes.
-   **Theme Integration**: It wraps the entire layout in a custom `<AppTheme />`, injecting specialized theme overrides (`xThemeComponents`) for advanced components like charts and data grids, ensuring they match the project's design system.

---

## 3. Navigation System

The dashboard employs a responsive and role-aware navigation system.

-   **`SideMenu.tsx` (Desktop)**:
    -   Provides a permanent, clear navigation structure on the left side of the screen.
    -   Displays the project logo, which links back to the dashboard home.
    -   Contains the main navigation links via the `MenuContent` component.
    -   Includes a user profile section at the bottom, showing the logged-in user's name and email, along with a prominent **Logout** button.

-   **`AppNavbar.tsx` & `SideMenuMobile.tsx` (Mobile)**:
    -   The `AppNavbar` provides a compact top bar with the logo, essential widgets (`WeatherWidget`, user points), a theme toggle, and a hamburger menu icon.
    -   The hamburger menu icon toggles the `SideMenuMobile` drawer, which slides in from the right and contains the full navigation menu (`MenuContent`) and user information.

-   **`MenuContent.tsx` (The Brains of Navigation)**:
    -   This component defines the actual list of navigation links.
    -   It uses `react-router-dom`'s `<Link>` component for navigation.
    -   **Conditional Rendering (RBAC)**: It checks the `user.is_staff` property from the `useAuthStore`. If the user is an admin, it renders an additional list of "Admin" navigation links, effectively implementing frontend access control.
    -   Links are grouped logically into "Public," "Admin" (if applicable), and "Secondary" (Profile, About, etc.) sections.

-   **`NavbarBreadcrumbs.tsx`**: Provides contextual navigation, showing the user their current path within the dashboard (e.g., `Dashboard > Profile > Settings`). This greatly improves usability in a complex application.

---

## 4. Reusable Components & Widgets

The dashboard is built upon a rich set of shared, reusable components found in `frontend/src/pages/dashboard/components/`.

-   **Data Visualization**:
    -   **Charts**: A suite of custom chart components built on `MUI X Charts` (`ChartUserByCountry`, `PageViewsBarChart`, `SessionsChart`) are available for displaying analytics.
    -   **Data Grid (`CustomizedDataGrid.tsx`)**: A heavily styled and pre-configured `MUI X DataGrid` for displaying tabular data.
    -   **Stat Cards (`StatCard.tsx`)**: Small cards for displaying key statistics with a trend indicator and a sparkline chart.

-   **Admin Building Blocks (`views/admin/components/AdminTemplate/`)**:
    -   This is a cornerstone of the administrative section. `AdminTemplate.tsx` provides a generic, reusable layout for all CRUD (Create, Read, Update, Delete) management pages.
    -   It includes a title, an "Add New" button, a search bar, and a data grid.
    -   It handles the logic for opening confirmation dialogs for deletions and passes down functions for `onAdd`, `onEdit`, `onDelete`, and `onView`.
    -   This architecture makes adding new admin management pages extremely fast and consistent.

-   **Utility Widgets**:
    -   **`WeatherWidget.tsx`**: A self-contained component that fetches and displays real-time weather data for selected locations, complete with a popover for a 5-day forecast.
    -   **Points Chip**: A `Chip` component integrated into the `Header` and `AppNavbar` that displays the user's points and links to the rewards page.

---

## 5. Views (Pages)

The actual content pages are located in `frontend/src/pages/dashboard/views/` and are separated by access level.

-   **`views/public/`**: Contains all pages accessible to any authenticated user, such as the main `HomeView`, `Profile`, `FloraEncyclopedia`, `SensorData`, etc.
-   **`views/admin/`**: Contains pages that are only accessible to and linked for administrators. These pages, like `AdminUserManagement` and `AdminRoutesManagement`, are built using the `AdminTemplate` for consistency.

This clear separation in the folder structure mirrors the RBAC logic in the navigation, making the codebase easy to understand and maintain.
