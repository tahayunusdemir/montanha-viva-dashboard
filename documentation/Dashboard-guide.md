# Dashboard Integration & Feature Guide

This document provides a detailed guide on how the application's dashboard was built, starting from a professional Material-UI (MUI) template and evolving into a full-featured user portal.

**Source Template:** [MUI Joy UI Dashboard Template](https://mui.com/joy-ui/getting-started/templates/dashboard/) (adapted for MUI Material)

---

## 1. Objective: Professional & Interactive Dashboard

The initial goal was to integrate a feature-rich, data-centric dashboard to provide a professional interface for application metrics. This evolved into creating a comprehensive portal where users can manage their data, access various features, and interact with the platform's services.

---

## 2. Initial Template Integration

The dashboard was first implemented by adapting components from the source template and integrating them into the project's existing architecture.

- **Component Structure:** All dashboard-related components are organized within the `frontend/src/pages/dashboard/` directory.
- **Styling and Theming:** The dashboard uses a dedicated set of theme overrides located in `frontend/src/pages/dashboard/theme/customizations/`.
- **Dependencies:** Specialized MUI X components were added to `package.json`:
  - `@mui/x-charts`: For data visualization.
  - `@mui/x-data-grid-pro`: For advanced data tables.
  - `@mui/x-tree-view`: For hierarchical data display.
  - `@mui/x-date-pickers`: For date selection controls.

---

## 3. Evolution into a Multi-Page Portal

The initial single-page dashboard was expanded into a multi-page portal with distinct sections for users and administrators. This was achieved through a significant refactoring of the routing and navigation structure.

### 3.1. Advanced Routing

A nested routing system was implemented in `frontend/src/App.tsx` under the main `/dashboard` private route. This allows each feature to have its own dedicated URL and view, creating a clean and scalable structure.

```tsx
// Example from App.tsx
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route index element={<HomeView />} />
    <Route path="about" element={<About />} />
    <Route path="profile" element={<Profile />} />
    {/* Admin Routes */}
    <Route path="admin/user-management" element={<AdminUserManagement />} />
    {/* ... other routes */}
  </Route>
</Route>
```

### 3.2. Consistent Page Layout

A new `PageLayout.tsx` component was created to act as a wrapper for every view within the dashboard. This component ensures a consistent layout, providing a standard container for the page title and content, which simplifies the development of new pages.

### 3.3. Dynamic Navigation Menu

The main navigation menu, defined in `MenuContent.tsx`, was updated to be a comprehensive list of links to all the new public and admin pages. This provides users with a clear and easy way to navigate the entire portal.

---

## 4. Feature Implementation

Numerous features were added, transforming the dashboard into a dynamic and interactive platform.

### 4.1. Public User Views

These are the primary pages available to all authenticated users:

- **`HomeView.tsx`**: The main landing page of the dashboard, featuring statistical cards, charts, and an overview of key metrics.
- **`About.tsx`**: A detailed page providing information about the Montanha Viva project, its mission, and the development team.
- **`Profile.tsx`**: A comprehensive, multi-tabbed user profile management page where users can:
  - View and update their personal information (`ProfileInformationTab.tsx`).
  - Change their password (`PasswordResetTab.tsx`).
  - Permanently delete their account (`DeleteAccountTab.tsx`).
- **`SendFeedback.tsx`**: A form that allows users to submit feedback, bug reports, or feature requests, complete with category selection and file upload capabilities.
- **Placeholder Views**: A suite of other pages (`FloraEncyclopedia.tsx`, `RoutesEncyclopedia.tsx`, `PlantIdentifier.tsx`, etc.) have been created as placeholders to be developed in the future.

### 4.2. Admin Panel Views

A set of placeholder pages has been established under the `admin/` route to build out the future administration panel. These include `AdminUserManagement.tsx`, `AdminRoutesManagement.tsx`, and `AdminFeedbackManagement.tsx`, providing a foundation for role-specific functionalities.

### 4.3. Backend Service Integration

To support the new frontend features, the `frontend/src/services/auth.ts` file was expanded with new functions to communicate with the backend API:

- `updateMe`: To save changes to the user's profile information.
- `changePassword`: To handle the password reset flow.
- `deleteAccount`: To securely delete a user's account.

These services are integrated into the corresponding React components (e.g., `Profile.tsx`) to create a seamless data flow between the client and server.

---

## 5. Final Configuration

- **Verification:** All new pages and components were tested to ensure they render correctly. The profile management and logout functionalities were verified to work as expected across both desktop and mobile views.
- **Logout Flow:** The logout functionality in `SideMenu.tsx` and `SideMenuMobile.tsx` was connected to the `useAuthStore` to properly clear the user's session and redirect them upon logout.
