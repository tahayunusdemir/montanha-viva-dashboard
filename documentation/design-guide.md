# UI/UX and Design System Guide

This document defines the basic design rules and standards for the user interface (UI) and user experience (UX) of the Montanha Viva project. Its purpose is to ensure visual and interactive consistency throughout the application.

**Core Library:** [Material-UI (MUI)](https://mui.com/)

---

## 🎨 Color Palette

The main colors to be used throughout the application are defined below. These colors form the basis of the MUI theme object (`theme.palette`).

| Usage          | Color Name       | Hex Code  | Description                                            |
| -------------- | ---------------- | --------- | ------------------------------------------------------ |
| **Primary**    | Primary Blue     | `#1976D2` | Main action buttons, active links, highlighted areas.  |
| **Secondary**  | Secondary Purple | `#9C27B0` | Buttons of secondary importance, filters.              |
| **Error**      | Error Red        | `#D32F2F` | Error messages, invalid fields.                        |
| **Warning**    | Warning Orange   | `#ED6C02` | Warning notifications, situations requiring attention. |
| **Info**       | Info Blue        | `#0288D1` | Informational messages, tips.                          |
| **Success**    | Success Green    | `#2E7D32` | Successful action notifications, confirmation icons.   |
| **Background** | Background Gray  | `#F4F6F8` | General background color for pages and components.     |
| **Text**       | Text Black       | `#212121` | Main text color.                                       |

---

## typography (Font and Sizes)

A standard typography scale is used throughout the application to ensure readability and hierarchy.

- **Font Family:** `Roboto`, `Helvetica`, `Arial`, `sans-serif` (MUI default)
- **Scale:** Used with the `variant` prop of MUI's `<Typography>` component.

| Variant     | Use Case                                  | Example                          |
| ----------- | ----------------------------------------- | -------------------------------- |
| `h1`        | -                                         | _Generally not used, too large._ |
| `h2`        | Page titles (very rare)                   | `<h1>Dashboard</h1>`             |
| `h3`        | Main section headings                     | `<h3>Profile Information</h3>`   |
| `h4`        | Card titles, subsection headings          | `<h4>Recent Activities</h4>`     |
| `h5`        | Smaller headings                          | `<h5>User Settings</h5>`         |
| `h6`        | Labels, small titles                      | `<h6>Preferences</h6>`           |
| `subtitle1` | Descriptions under headings               |                                  |
| `body1`     | Main paragraph and text content (default) | `<p>This is the main text.</p>`  |
| `body2`     | Helper or smaller text                    | `<p>Forgot password?</p>`        |
| `button`    | Button text                               | `<Button>Login</Button>`         |
| `caption`   | Captions under icons, small notes         |                                  |

---

## 📏 Spacing & Layout

MUI's theme-based spacing system is used to maintain consistent spacing between components and elements.

- **Rule:** Instead of using fixed values like `px`, the `theme.spacing()` function should be used.
- **Default Value:** `theme.spacing(1)` = `8px`
- **Example:**

  ```jsx
  import { Box } from "@mui/material";

  // Applies a padding of 16px (2 * 8px)
  <Box sx={{ padding: (theme) => theme.spacing(2) }}>Content</Box>;
  ```

- **Layout Components:** The `<Box>`, `<Grid>`, and `<Stack>` components should be preferred for aligning and structuring elements. The `<Stack>` component is particularly useful for vertical or horizontal lists.

---

## 🧩 Component Usage Rules

When designing new interfaces, use MUI's rich set of components first instead of creating them from scratch.

#### **Buttons (`<Button>`)**

- **`variant="contained"`:** Used for the most important and primary action on the page (e.g., "Save", "Login").
- **`variant="outlined"`:** Used for secondary actions (e.g., "Cancel", "Go Back").
- **`variant="text"`:** Used for the least important actions or links within cards (e.g., "Read More").

#### **Form Elements**

- **Text Input:** `<TextField>` should be used for all text, email, and password inputs.
- **Validation:** For form validation, it should be integrated with the `react-hook-form` library. Error messages should be displayed using the `helperText` and `error` props of the `<TextField>`.

#### **Notifications**

- **Feedback:** The `<Alert>` component should be used to inform the user about the result of an action (success, error, warning). It is ideal for post-form submissions.
- **Short Notifications:** The `<Snackbar>` component can be preferred for short and temporary notifications.
