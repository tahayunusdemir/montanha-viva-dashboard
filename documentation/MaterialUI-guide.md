# MUI Template Integration Guide

This document provides a detailed guide on how the application's original pages (Homepage, Sign-in, Sign-up) were replaced with professional, pre-built templates from Material-UI (MUI).

**Source Templates:** [MUI Templates](https://github.com/mui/material-ui/tree/v5.15.20/docs/data/material/getting-started/templates/)

---

## 1. Objective: Full UI Overhaul with MUI Templates

The objective was to **completely replace** the project's original, basic pages with polished, feature-rich templates from MUI. This action redefines the application's visual identity, creating a consistent and professional user experience across the landing page and authentication flow.

---

## 2. Advanced Theme Architecture

A key part of the integration was adopting a new, highly modular global theme architecture to ensure a consistent and maintainable look and feel. The simple, single-file theme was replaced by a multi-file structure within `frontend/src/theme/`.

- **Source:** The architecture is based on the theme from the **Marketing Page** template, but was organized into a more robust, scalable structure.
- **Structure:**
  - `themePrimitives.ts`: Defines the raw design tokens for the application, such as color palettes (`brand`, `gray`, etc.), typography scales, and shadow styles.
  - `customizations/`: This directory contains component-specific style overrides. Each file (e.g., `inputs.tsx`, `surfaces.ts`) customizes a group of related MUI components, making it easy to manage styles.
  - `AppTheme.tsx`: This is the main theme provider. It assembles the primitives and customizations into a complete theme using MUI's `createTheme` and provides it to the entire application. It also configures MUI's CSS variables for robust light and dark mode support.
- **Impact:** This advanced structure provides a centralized, organized, and scalable way to manage the application's design system.

---

## 3. Page-by-Page Integration Details

### 3.1. Homepage

The original `HomePage.tsx` was replaced with the **Marketing Page** template.

- **File Renaming:** The template's `MarketingPage.tsx` was renamed to `HomePage.tsx` and placed in `frontend/src/pages/home-page/`.
- **Component Organization:** All supporting components for the homepage (e.g., `Hero.tsx`, `Features.tsx`, `FAQ.tsx`) were placed in a dedicated directory: `frontend/src/pages/home-page/components/`.
- **Path Updates:** All import paths within the new `HomePage.tsx` and its supporting components were updated to reflect the new directory structure.

### 3.2. Sign-Up Page

The original sign-up page was replaced with the **Sign-up page** template.

- **File Placement:** The template's `SignUp.tsx` was placed in `frontend/src/pages/sign-up/`.
- **Customizations:** The template was significantly modified to better fit the project's specific backend requirements:
  - **First and Last Name:** The single "Name" field was split into separate "First Name" and "Last Name" fields.
  - **Password Confirmation:** A "Confirm Password" field was added with validation to ensure it matches the password field.
  - **Removed Features:** The "Sign up with Google" (social login) option and the "Sitemark" brand placeholder were removed for a cleaner, more focused interface.

### 3.3. Sign-In Page

The original sign-in page was replaced with the **Sign-in page** template.

- **File Placement:** The template's `SignIn.tsx` was placed in `frontend/src/pages/sign-in/`.
- **Customizations:**
  - **Removed Features:** The "Sign in with Google" (social login) option and the "Sitemark" brand placeholder were removed.

---

## 4. Final Configuration & Enhancements

- **Asset Management:** Core visual assets for the homepage, such as the `gardunha.jpg` background image and sponsor/partner logos, are now stored locally in the `frontend/src/assets/` directory and imported directly into the components. This improves reliability and performance compared to relying on external URLs.
- **Authentication-Aware UI:** The `AppAppBar` component in the homepage was enhanced to be aware of the user's authentication status. It uses the `useAuthStore` (Zustand) to conditionally display either "Sign in" / "Sign up" buttons for guests or a "Dashboard" button for logged-in users.
- **Dependencies:** The required MUI dependencies were installed: `@mui/material`, `@mui/icons-material`, `@emotion/react`, and `@emotion/styled`.
- **Path Aliases:** To simplify imports, a path alias (`@`) pointing to the `src` directory was configured in `tsconfig.app.json` and `vite.config.ts`.
- **CSS Cleanup:** The default Vite CSS in `App.css` and `index.css` was removed to rely cleanly on MUI's `CssBaseline` and the custom theme for all global styles, preventing style conflicts.
- **Verification:** The application was tested to ensure all new pages render correctly, routing works as expected, and the UI correctly reflects the authentication state.
