# Montanha Viva - Authentication System Report

This document provides a comprehensive analysis of the user authentication and management system implemented in the Montanha Viva project. It covers the architecture, features, security measures, and the technical implementation on both the backend and frontend.

## 1. Overview

The authentication system is built on a modern, secure, and robust stack, designed to provide a seamless user experience while ensuring data protection. It uses a token-based authentication mechanism with **JSON Web Tokens (JWT)**.

-   **Backend**: Django REST Framework handles the API logic, user management, and token generation.
-   **Frontend**: React (with Vite and TypeScript) provides the user interface, with libraries like Zustand for state management and TanStack Query for server state synchronization.
-   **Security**: The core security strategy revolves around a hybrid token model using HttpOnly cookies for refresh tokens to mitigate XSS attacks.

## 2. Core Features

The system supports a full suite of user management features for both standard users and administrators.

| Feature                      | User Role   | Description                                                                                                                              |
| :--------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **User Registration**        | Public      | New users can create an account using their name, email, and a secure password.                                                          |
| **Login & Session**          | Public      | Registered users can sign in with their email and password. A "Remember Me" option provides an extended session (30 days).                |
| **Logout**                   | User        | Authenticated users can securely log out, which invalidates their session on the backend by blacklisting the refresh token.              |
| **Password Reset**           | Public      | Users who have forgotten their password can request a reset link via email and set a new password through a secure, token-validated page.  |
| **Profile Management**       | User        | Logged-in users can view their profile, update their name, and change their password. They also have the option to delete their account. |
| **Admin User Management**    | Admin       | Administrators (`is_staff=True`) have access to a dedicated UI to perform CRUD (Create, Read, Update, Delete) operations on all users.   |
| **Administrator Privileges** | Admin       | Admins can modify user details, including their role (Admin/User), active status, and points.                                            |

---

## 3. Security Architecture

Security is a primary concern, addressed through several layers of protection.

### 3.1. Token-Based Authentication (JWT)

The system uses a standard JWT flow with two types of tokens:

1.  **Access Token**: A short-lived (e.g., 5-15 minutes) token sent in the `Authorization: Bearer <token>` header of every authenticated API request. It is stored **in-memory** on the frontend to prevent access from XSS attacks.
2.  **Refresh Token**: A long-lived token used to obtain a new access token when the current one expires.

### 3.2. Secure Token Storage (HttpOnly Cookie)

To maximize security, the `refresh_token` is not stored in `localStorage`. Instead:

-   **Backend**: Upon successful login, the backend sets the `refresh_token` in a secure, `HttpOnly` cookie. This makes the token inaccessible to client-side JavaScript, effectively preventing token theft via XSS. The cookie is scoped to the `/api/users/` path.
-   **Frontend**: The frontend never directly handles the refresh token. The browser automatically sends the cookie with requests to the `/api/users/token/refresh/` endpoint.

### 3.3. Password Policy

-   **Backend**: Password complexity is enforced by Django's built-in `AUTH_PASSWORD_VALIDATORS`. These rules (e.g., minimum length, numeric characters) are checked during registration and password changes.
-   **Frontend**: The sign-up and password reset forms provide real-time validation feedback to guide the user in creating a strong password.

### 3.4. Audit Logging

-   **Backend**: Python's `logging` module is used to record security-sensitive events to the console (which is captured by Docker logs).
-   **Events Logged**:
    -   Successful user logins (logged in `MyTokenObtainPairView`).
    -   Administrative actions such as user creation, updates, or status changes (logged in `AdminUserViewSet`).
    -   Password reset requests and confirmations.

### 3.5. Rate Limiting

The code includes commented-out decorators for `django-ratelimit`. While not currently active, this indicates a planned feature to protect critical endpoints (`/token/`, `/register/`, `/password-reset/`) from brute-force and denial-of-service (DoS) attacks.

---

## 4. Backend Implementation (Django)

The backend is organized within the `users` Django app.

### 4.1. User Model (`users/models.py`)

-   A `CustomUser` model inherits from Django's `AbstractUser`.
-   **Email as Username**: The `username` field is removed, and `email` is set as the `USERNAME_FIELD` for authentication.
-   **Fields**: Includes `first_name`, `last_name`, `is_staff` (for admin permissions), and a custom `points` field for a rewards system.
-   A `CustomUserManager` is implemented to handle user creation with email instead of a username.

### 4.2. API Endpoints (`users/urls.py`)

All authentication endpoints are grouped under the `/api/users/` path.

| Method                   | Endpoint                             | View                       | Name                     | Description                                            |
| :----------------------- | :----------------------------------- | :------------------------- | :----------------------- | :----------------------------------------------------- |
| `POST`                   | `/register/`                         | `RegisterView`             | `user-register`          | Creates a new user and returns tokens.                 |
| `POST`                   | `/token/`                            | `MyTokenObtainPairView`    | `token_obtain_pair`      | Logs in a user, returns tokens, sets HttpOnly cookie.  |
| `POST`                   | `/token/refresh/`                    | `CookieTokenRefreshView`   | `token_refresh`          | Refreshes the access token using the HttpOnly cookie.  |
| `POST`                   | `/logout/`                           | `LogoutView`               | `user-logout`            | Blacklists the refresh token and clears the cookie.    |
| `POST`                   | `/password-reset/`                   | `PasswordResetRequestView` | `password-reset-request` | Initiates the password reset flow via email.           |
| `POST`                   | `/password-reset/confirm/`           | `PasswordResetConfirmView` | `password-reset-confirm` | Sets a new password using the token from the email.    |
| `GET`, `PATCH`, `DELETE` | `/me/`                               | `UserProfileView`          | `user-me`                | Manages the authenticated user's own profile.          |
| `PUT`                    | `/me/change-password/`               | `ChangePasswordView`       | `user-change-password`   | Allows an authenticated user to change their password. |
| `ViewSet`                | `/admin/users/`                      | `AdminUserViewSet`         | `admin-user-*`           | Full CRUD operations on all users for administrators.  |

### 4.3. Views & Serializers

-   **Registration (`RegisterView`, `UserRegistrationSerializer`)**: Creates a user and immediately generates and returns JWT tokens, providing a smooth onboarding flow where the user is logged in right after signing up.
-   **Login (`MyTokenObtainPairView`, `MyTokenObtainPairSerializer`)**:
    -   Extends the default SimpleJWT view to handle the `rememberMe` flag from the frontend.
    -   If `rememberMe` is `true`, the refresh token's lifetime is extended to 30 days. Otherwise, it's a session token.
    -   The view's `finalize_response` method is overridden to set the `refresh_token` in the `HttpOnly` cookie.
-   **Token Refresh (`CookieTokenRefreshView`, `CookieTokenRefreshSerializer`)**: Custom views that read the `refresh_token` directly from the request's cookie instead of the request body.
-   **Password Reset (`PasswordReset...View` and `...Serializer`)**: A two-step process:
    1.  `PasswordResetRequestView`: Validates the user's email, generates a unique token (`account_activation_token_generator`), and sends a reset link to the user.
    2.  `PasswordResetConfirmView`: Validates the token from the URL, and if valid, allows the user to set a new password.
-   **Admin Management (`AdminUserViewSet`, `AdminUserSerializer`, `AdminUserCreationSerializer`)**: A `ModelViewSet` protected by `IsAdminUser` permission, providing a complete RESTful API for managing all users. It uses different serializers for creation and updates to handle password fields correctly.

### 4.4. Email Service

-   **Development**: Uses Django's `console.EmailBackend`, which prints email content (like the password reset link) directly to the Docker logs. This avoids the need for an external SMTP service during local development.
-   **Production**: The settings are prepared to use a transactional email service (e.g., SendGrid) via environment variables.

---

## 5. Frontend Implementation (React)

The frontend implements the UI for all user flows, ensuring a responsive and intuitive experience.

### 5.1. Core Libraries

-   **State Management**: `Zustand` is used for simple, powerful global state management. The `authStore` holds the user's session data.
-   **API Communication**: `Axios` is used for all API calls. A central `axiosInstance` is configured with interceptors to automatically handle token attachment and refresh logic.
-   **Server State**: `@tanstack/react-query` manages server state, caching, and data fetching (e.g., `useQuery` for fetching data, `useMutation` for CUD operations).
-   **Forms**: `react-hook-form` handles all form state, validation, and submission logic efficiently.

### 5.2. Key Pages and Components

-   **`SignIn.tsx`**: The login page. It uses `react-hook-form` and a `useMutation` hook to call the login API. It includes a link to the sign-up page and a "Forgot Password?" link that opens the `ForgotPassword.tsx` modal.
-   **`SignUp.tsx`**: The registration page. On successful registration, the backend automatically logs the user in. The frontend was designed to redirect to login, but a more seamless flow is possible where it redirects directly to the dashboard.
-   **`ForgotPassword.tsx`**: A modal component where users can enter their email to receive a password reset link.
-   **`ResetPasswordPage.tsx`**: A page that validates the `uidb64` and `token` from the URL search parameters. If the token is valid, it presents a form to set a new password.
-   **`PrivateRoute.tsx`**: A routing component that checks if the user is authenticated (via `authStore`). If not, it redirects them to the `/sign-in` page, protecting dashboard routes.

### 5.3. State Management (`authStore.ts`)

-   The Zustand store manages `isAuthenticated`, `user`, and `accessToken`.
-   It uses the `persist` middleware to save `isAuthenticated` and `user` data to `localStorage`. This keeps the user logged in across page reloads.
-   Crucially, the `accessToken` is **not** persisted to `localStorage` for security reasons. It is only held in memory. When the app loads, if the user is authenticated, a refresh request is made to get a new in-memory access token.

### 5.4. API Interaction (`axios.ts`)

A single, global Axios instance simplifies API calls and centralizes authentication logic:

-   **Request Interceptor**: Before any request is sent, this interceptor attaches the in-memory `accessToken` to the `Authorization` header.
-   **Response Interceptor**: This interceptor handles `401 Unauthorized` errors. When a `401` is received (indicating an expired access token), it automatically and transparently calls the `/api/users/token/refresh/` endpoint to get a new access token. It then retries the original failed request with the new token. If the refresh attempt fails, it logs the user out.
