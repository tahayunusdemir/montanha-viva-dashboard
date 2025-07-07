# Montanha Viva - Profile Management System Report

This document provides a detailed breakdown of the user profile management system. It outlines the architecture, features, and components that allow authenticated users to manage their personal information, security settings, and account status.

## 1. Overview

The Profile Management page is a secure, centralized area within the user dashboard where authenticated users can control their account details. It is designed to be intuitive and follows the established UI/UX patterns of the application, utilizing Material-UI (MUI) components and a consistent layout.

The system is built as a single, tab-based interface, allowing users to easily navigate between different management functions without leaving the page.

## 2. Core Features

The profile page provides three primary functionalities, each segregated into its own tab:

| Feature                 | Description                                                                                             |
| :---------------------- | :------------------------------------------------------------------------------------------------------ |
| **Profile Information** | Users can view and update their personal details, such as their first and last name.                    |
| **Password Reset**      | Authenticated users can change their current password by providing their old one and setting a new one. |
| **Account Deletion**    | Users have the option to permanently delete their account and all associated data from the platform.    |

---

## 3. Page Architecture (`Profile.tsx`)

The main `Profile.tsx` component serves as the container and controller for the entire profile management experience.

- **Structure**: It is built upon the standard `PageLayout` component, ensuring consistency with the rest of the dashboard. The core of its UI is an MUI `<Card>` containing a `<Tabs>` component.
- **Tabbed Interface**: The page is organized into three distinct tabs: "Profile Information," "Password Reset," and "Delete Account." The `Profile.tsx` component manages the state of the currently active tab and renders the corresponding content panel (`<TabPanel />`).
- **State Management**:
  - It uses `React.useState` to manage local UI state, including the active tab index (`tabValue`), loading indicators (`loading`), and the visibility of the delete confirmation dialog (`openDeleteDialog`).
  - It leverages the global `useAuthStore` (Zustand) to get the current `user` data and to access the `setUser` and `logout` actions.
- **Data Fetching**: On initial load, if the user data is not present in the Zustand store, it calls the `getMe()` API service to fetch the user's profile information. This ensures the page always has up-to-date data.
- **User Feedback**: It utilizes a centralized `<Snackbar>` component to provide consistent success or error messages to the user for all actions performed on the page (e.g., "Profile updated successfully," "Error deleting account").

---

## 4. Component Deep Dive

Each tab's content is rendered by a dedicated, specialized component.

### 4.1. Profile Information (`ProfileInformationTab.tsx`)

This component handles the viewing and editing of a user's personal details.

- **Fields Displayed**: It displays the user's `First Name`, `Last Name`, `Email`, and `Points`. The email and points fields are always read-only.
- **Edit Mode**: The component has two modes:
  1.  **View Mode (Default)**: All fields are disabled. An "Edit" button is shown.
  2.  **Edit Mode**: Activated by clicking the "Edit" button. The `First Name` and `Last Name` fields become editable. "Save" and "Cancel" buttons are displayed.
- **Form Handling**: It uses `react-hook-form` to manage the form state for the editable fields.
- **Update Logic**: When the user clicks "Save," it calls the `updateMe` API service. On success, it invokes the `onUpdate` prop to update the global user state in Zustand via the parent `Profile.tsx` component and uses the `onSnackbar` prop to show a success message.

### 4.2. Password Management (`PasswordResetTab.tsx`)

This tab provides a secure form for an authenticated user to change their password.

- **Form Fields**: The form requires the user to input their "Current Password," a "New Password," and a "New Password (Confirm)."
- **Validation**: It uses `react-hook-form` for robust client-side validation:
  - All fields are required.
  - The new password must be at least 8 characters long.
  - The "New Password (Confirm)" field must match the "New Password" field.
- **Security**: Includes a toggle button to show/hide the current password for better usability.
- **Update Logic**: On submission, it calls the `changePassword` API service. It provides user feedback on success or failure using the `onSnackbar` prop, displaying specific error messages returned from the backend (e.g., "Current password is not correct").

### 4.3. Account Deletion (`DeleteAccountTab.tsx`)

This component provides the interface for the final and most critical user action: deleting their account.

- **User Experience**: It clearly communicates the permanent and irreversible nature of the action with a descriptive text and a prominent MUI `<Alert>` with `severity="error"`.
- **Two-Step Confirmation**: The account deletion process is designed to prevent accidental deletions:
  1.  **Step 1 (`DeleteAccountTab.tsx`)**: The user clicks the "Delete My Account" button. This does not immediately delete the account but instead calls the `onDelete` prop.
  2.  **Step 2 (`Profile.tsx`)**: The `onDelete` handler in the parent `Profile.tsx` component opens a modal `<Dialog>`. This dialog asks the user for final confirmation ("Are you sure you want to permanently delete your account?").
- **Deletion Logic**: Only after the user clicks "Yes, Delete" in the dialog does the `handleDeleteAccount` function in `Profile.tsx` get executed. This function calls the `deleteAccount` API service, logs the user out on success, and navigates them back to the sign-in page.
