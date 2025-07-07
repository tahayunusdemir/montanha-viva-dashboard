# Montanha Viva - QR Code System Report

This document provides a detailed analysis of the QR Code system. It covers the end-to-end architecture, from the user-facing scanning interface to the backend APIs for processing scans and the administrative tools for QR code management.

## 1. Overview

The QR Code system is a key gamification and engagement feature of the Montanha Viva project. It encourages users to explore physical locations along mountain trails by rewarding them with points for scanning QR codes placed at various points of interest. This system is designed with a clear separation between the user scanning experience and the administrative management interface.

- **Frontend**: A simple, mobile-friendly interface allows authenticated users to scan codes using their device's camera. An administrative section provides full CRUD (Create, Read, Update, Delete) functionality for managing the scannable codes.
- **Backend**: A robust Django REST Framework application validates scans, awards points, prevents duplicate submissions, and automatically generates QR code images.

## 2. Core Features

The system offers distinct features for standard users and administrators, promoting interaction and ensuring easy management.

| Feature                        | User Role | Description                                                                                                                                                     |
| :----------------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scan QR Code**               | User      | Authenticated users can use their device's camera to scan a QR code and earn points.                                                                            |
| **Earn Points**                | User      | Upon a successful and unique scan, points associated with the QR code are added to the user's account total.                                                    |
| **One-Time Scan per Code**     | User      | The system prevents a user from earning points for the same QR code more than once, though it will inform them that they have already scanned it.               |
| **Generate & Manage QR Codes** | Admin     | Administrators can create new QR codes by defining a name, the text/URL to be encoded, and the points value. The image is generated automatically.              |
| **View All QR Codes**          | Admin     | Admins can view a list of all existing QR codes in a data grid, with details like name, points, and creation date.                                              |
| **View Rewards History**       | User      | Users can view their current point total, a history of all the QR codes they have successfully scanned, and a list of any discount coupons they have generated. |
| **Generate Discount Coupons**  | User      | Once a user accumulates enough points (e.g., 100), they can exchange them for a unique, time-limited discount coupon.                                           |
| **View QR Code Details**       | Admin     | Admins can view the details of a specific QR code, including its generated image, and download it for printing and placement.                                   |
| **Delete QR Codes**            | Admin     | Admins can delete QR codes from the system.                                                                                                                     |

---

## 3. User-Facing Implementation

The user-facing side of the QR system is split into two distinct pages: one for scanning codes and another for viewing points and rewards.

### 3.1. Scanning Page (`QRCodes.tsx`)

The primary user interaction with the system happens on the "Scan QR Code" page within the user dashboard.

- **Technology Stack**: The page is built with React and Material-UI. It uses the `html5-qrcode` library to handle the camera and scanning logic, and `@tanstack/react-query` to manage the API call for validating the scan.
- **User Interface**:
  - An introductory `<Alert>` explains how the system works to the user.
  - A large viewfinder area is provided for the camera feed, which is only displayed when scanning is active.
  - Simple "Start Scan" and "Stop Scan" buttons control the camera state.
- **Scanning Process**:
  - When the user clicks "Start Scan," the component requests camera access (using `facingMode: "environment"` to prefer the rear camera).
  - The `html5-qrcode` library displays the camera feed in the viewfinder and actively looks for a QR code.
  - Once a code is successfully decoded, the scanner automatically stops, and the decoded text is sent to the backend via the `useScanQRCode` mutation.
- **API Interaction & Feedback**:
  - The `useScanQRCode` hook manages the API request state.
  - While the request is processing, a "Processing Scan..." message is displayed.
  - Upon receiving a response from the backend, a `<Snackbar>` provides clear feedback to the user, whether it's a success message (e.g., "You have earned 10 points!") or an error/info message (e.g., "Invalid QR code," "You have already scanned this QR code.").
  - On a successful scan, the user's points total in the main dashboard navigation is also updated in real-time.

### 3.2. Rewards Page (`PointsAndRewards.tsx`)

This page serves as the user's hub for all gamification-related information.

- **Data Fetching**: The page uses a `useQuery` hook to call the `getRewardsData` service, which fetches all necessary information from a single backend endpoint.
- **Layout**: The page is structured with several key components:
  - **Points Summary**: A prominent `<Card>` at the top displays the user's current total points.
  - **Coupon Generation**: A "Generate Coupon" button is displayed, which is disabled if the user does not have enough points. Clicking it triggers a `useMutation` to the `generate-coupon` endpoint. On success, the rewards data is automatically refetched to show the updated point total and the new coupon.
  - **Tabbed View**: A `<Tabs>` component separates the display of "Scan History" and "My Coupons" for a clean user interface.
    - The **Scan History** tab lists every QR code the user has successfully scanned, showing the code's name, points awarded, and the date it was scanned.
    - The **My Coupons** tab lists all generated discount coupons, displaying the unique coupon code, the points it cost, and its expiration date.

---

## 4. Admin Management Implementation

The administrative functions are consolidated within the `AdminQRManagement.tsx` page and its related components, providing a consistent management experience.

### 4.1. Main View (`AdminQRManagement.tsx`)

- **Layout**: The page leverages the reusable `AdminTemplate` component, ensuring a consistent UI with other admin pages (e.g., User Management). This template provides a title, a "Generate QR Code" button, and a data grid.
- **Data Display**: All existing QR codes are fetched using the `useQRCodes` hook and displayed in an MUI X `<DataGrid>`. The columns show the QR Code ID, Name, Points, and Creation Date.
- **Actions**: The data grid includes action buttons for each row, allowing an administrator to **View** or **Delete** a QR code. The `useDeleteQRCode` mutation is called when an admin confirms a deletion.

### 4.2. Add QR Code Modal (`AddQRCodeModal.tsx`)

- **Functionality**: This modal is opened from the "Generate QR Code" button. It contains a form for creating a new QR code.
- **Form Handling**: It uses `react-hook-form` to manage and validate the input fields:
  - **Name**: A descriptive name for the QR code.
  - **Text or URL**: The content that will be embedded in the QR code.
  - **Points**: The number of points awarded for scanning.
- **API Interaction**: On submission, the `useCreateQRCode` mutation is called. The form is cleared and the modal is closed upon success.

### 4.3. View QR Code Modal (`ViewQRCodeModal.tsx`)

- **Functionality**: This modal opens when an admin clicks the "View" action on a QR code in the grid.
- **Content**: It displays all the details of the selected QR code:
  - A large preview of the **QR code image**.
  - A **Download** link for the image file.
  - Other details such as ID, Name, Points, Text Content, and Creation Date.

---

## 5. Backend Implementation (`qr` App)

The backend logic is encapsulated within the `qr` Django app, providing security and robust data handling.

### 5.1. Data Models (`models.py`)

- **`QRCode`**: The central model for the system.
  - **Fields**: `name`, `text_content` (must be unique), `points`, `qr_image`, and `created_at`.
  - **Automatic Image Generation**: The model's `save()` method is overridden. When a new `QRCode` object is created, it uses the `qrcode` Python library to automatically generate a PNG image based on the `text_content` and saves it to the `media/qr_codes/` directory. This means administrators only need to provide the text content, not upload an image.
- **`UserScannedQR`**: A relational table that links a `user` to a `qr_code`.
  - **Purpose**: It records every unique scan event.
  - **Constraint**: It has a `unique_together` constraint on the `user` and `qr_code` fields. This is the critical rule that enforces the "one scan per user per code" logic at the database level, ensuring data integrity.
- **`DiscountCoupon`**: Stores generated discount coupons.
  - **Fields**: Links to a `user`, stores the unique `code`, the `points_spent`, creation and expiration dates, and a boolean `is_used` flag.

### 5.2. API Endpoints (`urls.py` & `views.py`)

The API is separated into administrative and user-facing endpoints.

| Endpoint                        | View                    | Permission(s)     | Description                                                                                                                                                                                           |
| :------------------------------ | :---------------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ViewSet /api/qr/qrcodes/`      | `QRCodeViewSet`         | `IsAdminUser`     | Provides full CRUD functionality (`GET`, `POST`, `PATCH`, `DELETE`) for managing QR codes. This is used by the `AdminQRManagement` page.                                                              |
| `POST /api/qr/scan/`            | `ScanQRCodeAPIView`     | `IsAuthenticated` | Handles a user's scan submission. It finds the `QRCode` by its `text_content`, checks if the user has scanned it before, and if not, awards points and records the scan in the `UserScannedQR` table. |
| `GET /api/qr/rewards/`          | `RewardsAPIView`        | `IsAuthenticated` | Retrieves a consolidated object containing the user's current points, their full scan history, and all their generated discount coupons.                                                              |
| `POST /api/qr/generate-coupon/` | `GenerateCouponAPIView` | `IsAuthenticated` | Allows a user to spend a fixed number of points to generate a new `DiscountCoupon`. It returns an error if the user has insufficient points.                                                          |

### 5.3. Serializers (`serializers.py`)

- **`QRCodeSerializer`**: A `ModelSerializer` for the `QRCode` model. It defines the fields to be included in API responses. The `qr_image` is marked as `read_only` because it is generated by the server.
- **`ScanSerializer`**: A simple `Serializer` that expects a single field: `text_content`. It is used to validate the data sent from the frontend when a user scans a code.
- **`UserScannedQRSerializer`**: A `ModelSerializer` for the `UserScannedQR` model. It includes nested data from the `QRCodeSerializer` to provide full details about each scanned code in the history list.
- **`DiscountCouponSerializer`**: A `ModelSerializer` for the `DiscountCoupon` model, used for displaying coupon details to the user.
