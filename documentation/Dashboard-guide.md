# Dashboard Template Integration Guide

This document provides a detailed guide on how the application's dashboard was built using a professional, pre-built template from Material-UI (MUI).

**Source Template:** [MUI Joy UI Dashboard Template](https://mui.com/joy-ui/getting-started/templates/dashboard/) (adapted for MUI Material)

---

## 1. Objective: Professional Dashboard UI

The goal was to integrate a feature-rich, data-centric dashboard to provide users with a professional and intuitive interface for viewing application metrics. The template was chosen for its clean layout and comprehensive set of data visualization components.

---

## 2. Template Integration & Refactoring

The dashboard was implemented by adapting components from the source template and integrating them into the project's existing architecture.

- **Component Structure:** All dashboard-related components are organized within the `frontend/src/pages/dashboard/` directory. This includes individual components (`components/`), data sources (`internals/data/`), and theme customizations (`theme/customizations/`).

- **Styling and Theming:** The dashboard uses a dedicated set of theme overrides located in `frontend/src/pages/dashboard/theme/customizations/`. These files provide specific styling for the data grid, charts, date pickers, and tree view, ensuring they integrate seamlessly with the application's global theme. The main `Dashboard.tsx` component injects these theme customizations into the `AppTheme` provider.

- **Dependencies:** The dashboard relies on several specialized MUI X components, which were added to `package.json`:
  - `@mui/x-charts`: For data visualization (bar charts, line charts, pie charts).
  - `@mui/x-data-grid-pro`: For advanced data table features.
  - `@mui/x-tree-view`: For hierarchical data display.
  - `@mui/x-date-pickers`: For date selection controls.
  - `dayjs`: A required peer dependency for date pickers.

---

## 3. Customizations and Refinements

The base template was modified to align with the project's specific needs and branding.

- **Mobile Navigation Branding:** The custom icon and "Dashboard" text in the mobile top navigation bar (`AppNavbar.tsx`) were replaced with the official application `Logo` component. This creates a more consistent brand experience between the mobile and desktop views.

- **Logout Functionality:** A complete logout flow was implemented in both the desktop (`SideMenu.tsx`) and mobile (`SideMenuMobile.tsx`) menus.
  - The components now connect to the `useAuthStore` (Zustand).
  - User information (name and email) is dynamically displayed.
  - The logout button now properly clears the user's session and redirects them to the homepage (`/home-page`).

- **Removed Components:** The following components from the original template were identified and removed or were not included in the final version to simplify the interface:
  - The top header no longer contains a global search bar or a date range picker.
  - No alert or notification cards (`CardAlert.tsx`) are currently implemented in the main grid.
  - The user avatar was removed from the bottom of the main desktop side menu to create a cleaner look.

---

## 4. Final Configuration

- **Routing:** A private route was configured in `App.tsx` to ensure that the `/dashboard` path is only accessible to authenticated users.
- **Verification:** The dashboard was tested to ensure all components render correctly, data is displayed properly, and the logout functionality works as expected across both desktop and mobile views.
