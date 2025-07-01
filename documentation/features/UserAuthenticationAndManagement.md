# User Authentication & Management Feature

This document outlines the implementation plan for user authentication and management, covering registration, login, password management, and profile features. It includes enhanced security measures, user experience improvements, and detailed technical specifications.

## 1. User Stories

- **As a new user,** I want to sign up with my full name, email, and a password so I can create an account.
- **As a registered user,** I want to sign in with my email and password to access my dashboard.
- **As a logged-in user,** I want to be redirected to the main dashboard after a successful login.
- **As a user who forgot my password,** I want to request a password reset link by providing my email address.
- **As a user who requested a reset,** I want to click a link in my email to set a new password.
- **As a logged-in user,** I want to navigate to my profile page to view and update my profile information (name, last name) or change my current password.
- **As a logged-in user,** I want the option to delete my account permanently after confirming my choice.
- **As a user logging in,** I want to check a "Remember me" box so that my session persists for a longer duration.
- **As a developer,** I want all authentication to be handled via JWT (JSON Web Tokens), with refresh tokens stored securely in HttpOnly cookies.
- **As a logged-in user,** I want to click a "Logout" button that securely invalidates my session on the backend.
- **As an administrator,** I want to view a list of all users in the system so I can manage their accounts.
- **As an administrator,** I want to create a new user account through a dedicated interface.
- **As an administrator,** I want to edit an existing user's information (role).
- **As an administrator,** I want to toggle a user's account between active and inactive states.
- **As an administrator,** I want to delete a user's account permanently from the system.

### Technical Constraints

- No user profile pictures will be implemented.
- No two-factor authentication (2FA) is required.
- No email verification or social media login (OAuth2) will be implemented in this phase.
- All code and documentation will be in English.

---

## 2. Backend Implementation (Django REST Framework)

The backend will provide a secure API for all user management functionalities, following the patterns defined in `docs/TODO-BACKEND.md`.

### 2.1. User Model (`users/models.py`)

- **`CustomUser(AbstractUser)`**:
  - Inherits all fields from Django's `AbstractUser`, including `is_staff`, which will be used to designate administrators.
  - `email` will be the unique identifier (`USERNAME_FIELD`).
  - `username` field will be removed (`username = None`).
  - `first_name` and `last_name` will be used for the user's full name.
  - `points = models.PositiveIntegerField(default=0, help_text="User's accumulated points for the rewards system.")`
  - `REQUIRED_FIELDS` will be `['first_name', 'last_name']`.

### 2.2. API Endpoints (`users/urls.py`)

| Method                   | Endpoint                             | View                       | Name                     | Description                                                                               |
| :----------------------- | :----------------------------------- | :------------------------- | :----------------------- | :---------------------------------------------------------------------------------------- |
| `POST`                   | `/api/users/register/`               | `RegisterView`             | `register`               | Creates a new user.                                                                       |
| `POST`                   | `/api/users/token/`                  | `MyTokenObtainPairView`    | `token_obtain_pair`      | Logs a user in, returns JWT access token in body and refresh token in an HttpOnly cookie. |
| `POST`                   | `/api/users/token/refresh/`          | `TokenRefreshView`         | `token_refresh`          | Refreshes an expired access token using an HttpOnly cookie.                               |
| `GET`, `PATCH`, `DELETE` | `/api/users/me/`                     | `UserProfileView`          | `current-user-profile`   | Retrieves, updates, or deletes the authenticated user's profile.                          |
| `POST`                   | `/api/users/password-reset/`         | `PasswordResetRequestView` | `password-reset-request` | User sends email to request a password reset link.                                        |
| `POST`                   | `/api/users/password-reset/confirm/` | `PasswordResetConfirmView` | `password-reset-confirm` | User provides token and new password to reset it.                                         |
| `POST`                   | `/api/users/me/change-password/`     | `ChangePasswordView`       | `user-change-password`   | Authenticated user changes their own password.                                            |

### 2.3. Serializers (`users/serializers.py`)

- **`RegisterSerializer`**:
  - Validates `email`, `password`, `first_name`, `last_name`.
  - Includes a `create` method that uses `CustomUser.objects.create_user()` to correctly hash the password.
- **`UserProfileView`**:
  - Used by `UserProfileView` to handle user data (`id`, `email`, `first_name`, `last_name`, `points`). It will be read-only for some fields as needed.
- **`PasswordResetRequestSerializer`**:
  - Validates the `email` field.
- **`PasswordResetConfirmSerializer`**:
  - Validates `token`, `new_password`, and `confirm_password`.
- **`ChangePasswordView`**:
  - Validates `old_password`, `new_password`, and `confirm_password`.
- **`AdminUserSerializer`**: A new serializer for admin operations.
  - Handles fields: `id`, `email`, `first_name`, `last_name`, `points`, `is_staff`, and `is_active`.
  - Includes `date_joined` as a read-only field.
  - The `password` field will be write-only and optional on updates.
  - It will manage user creation and updates, including password hashing.

### 2.4. Views (`users/views.py`)

- **`RegisterView`**: A `generics.CreateAPIView` with `AllowAny` permission.
- **`UserProfileView`**: A `generics.RetrieveUpdateDestroyAPIView` with `IsAuthenticated` permission to handle the user's own profile (`GET`, `PATCH`, `DELETE` on `/api/users/me/`).
- **`PasswordReset...View` / `ChangePasswordView`**: `APIView`s to handle their respective logic with appropriate permissions.
- **`LogoutView`**: An `APIView` that takes a refresh token directly from the request's HttpOnly cookie and adds it to the blacklist.
- **`MyTokenObtainPairView`**: A custom view that subclasses `TokenObtainPairView`. After successful validation, it will:
  1.  Set the refresh token in an HttpOnly cookie.
  2.  Log the successful login event: `create_activity(user=user, activity_type=UserActivity.ActivityType.USER_LOGGED_IN)`.
  3.  Call `check_and_award_achievements(user)` to check for any new achievements.

### 2.1.1. Admin Role

- A user with the `is_staff` flag set to `True` is considered an administrator.
- This flag will be used with Django REST Framework's `IsAdminUser` permission class to protect admin-only endpoints, such as the feedback management API.
- The `UserSerializer` will be updated to include the `is_staff` field, allowing the frontend to conditionally render administrative UI components.

### 2.5. Admin User Management API

To empower administrators, a dedicated set of CRUD endpoints will be created for user management. These endpoints will be protected and accessible only to users with the `is_staff` flag.

**API Endpoints (`users/urls.py` using a ViewSet)**

A `ModelViewSet` will be registered under an admin-specific path (e.g., `/api/admin/users/`) to handle all user management actions.

| Method      | Endpoint                 | ViewSet            | Action     | Name                | Description                      |
| :---------- | :----------------------- | :----------------- | :--------- | :------------------ | :------------------------------- |
| `GET`       | `/api/admin/users/`      | `AdminUserViewSet` | `list`     | `admin-user-list`   | Admin lists all users.           |
| `POST`      | `/api/admin/users/`      | `AdminUserViewSet` | `create`   | `admin-user-create` | Admin creates a new user.        |
| `GET`       | `/api/admin/users/{id}/` | `AdminUserViewSet` | `retrieve` | `admin-user-detail` | Admin retrieves a specific user. |
| `PUT/PATCH` | `/api/admin/users/{id}/` | `AdminUserViewSet` | `update`   | `admin-user-update` | Admin updates a user's details.  |
| `DELETE`    | `/api/admin/users/{id}/` | `AdminUserViewSet` | `destroy`  | `admin-user-delete` | Admin deletes a user.            |

**View (`users/views.py`)**

- **`AdminUserViewSet`**: A `viewsets.ModelViewSet` for the `CustomUser` model.
  - **Permissions**: `IsAdminUser` to ensure only administrators can access it.
  - **Logic**: Will override `perform_create`, `perform_update`, and `perform_destroy` methods to log activities using the `create_activity` service (e.g., `ADMIN_USER_UPDATED`, `ADMIN_USER_STATUS_CHANGED`).

---

## 3. Frontend Implementation (React, MUI, Zustand)

The frontend will implement the UI for all user flows, following the patterns in `docs/TODO-FRONTEND.md`.

### 3.1. Pages & Routing (`App.tsx`)

- **`/signup`**: `SignUpPage` - Public route for new user registration.
- **`/signin`**: `SignInPage` - Public route for user login.
- **`/reset-password`**: `ResetPasswordPage` - Public route for users who have requested a password reset via email. It will accept a token from the URL to authorize the password change.
- **`/dashboard`**: `DashboardPage` - A single, protected route for all authenticated users. It will act as a container that renders different "views" (e.g., `HomeView`, `ProfileView`, `AdminUsersView`) based on user interaction with the side menu.

### 3.2. State Management (`store/authStore.ts`)

- A Zustand store will manage:
  - `isAuthenticated` (boolean)
  - `user` (object | null) - `id`, `email`, `first_name`, `last_name`, `is_staff`, `points`
  - `accessToken` (string | null) - **Stored in memory only, not persisted to `localStorage`.**
  - `actions`: `login(token, userData)`, `logout()`, `setUser(userData)`, `refresh()`.
- The `persist` middleware saves `isAuthenticated` and `user` to `localStorage` to maintain the session across page reloads.

### 3.3. Forms (`react-hook-form`)

- **Validation**: Forms are built using `react-hook-form`. Validation is handled directly within the components using `rules` and `Controller` components, rather than a separate validation library like `zod`.
- **UI & Logic**:
  - **`SignUpPage` / `SignInPage`**: Use `react-hook-form` for validation and submission.
  - **`ProfileView.tsx`**: The forms for updating user info and changing the password have also been standardized to use `react-hook-form` for consistency.

### 3.4. API Services (`services/auth.ts`, `services/user.ts`)

Dedicated services with strongly-typed functions for all auth-related and user-management API calls are implemented, using a shared `axiosInstance`.

- `register(data)`
- `login(credentials)`
- `logout()` (This will call the `/api/users/logout/` endpoint to invalidate the refresh token on the backend)
- `getCurrentUser()`
- `updateProfile(data)`
- `deleteAccount()`
- `requestPasswordReset(email)`
- `confirmPasswordReset(token, newPassword)`
- `changePassword(passwords)`

All functions will use the shared `axiosInstance`.

### 3.5. Admin User Management UI

The admin user management interface will be the pilot implementation for the **Admin Toolkit**. It will not be a separate page but a **view within the main dashboard**, accessible only to administrators.

- **Access Control**: The link to the "User Management" view in the dashboard's side menu (`SideMenu`) will be conditionally rendered, visible only if `authStore.user.is_staff` is `true`.

- **View (`pages/dashboard/views/AdminUsersView.tsx`)**:
  - This component will be loaded into the `DashboardPage`'s content area.
  - It will use the `AdminLayout.tsx` component to provide a consistent header and structure for the admin content.
  - It will orchestrate the reusable `ResourceTable`, `ResourceFormModal`, and `ConfirmDeleteDialog` components, configured for managing users.

- **Components (`components/admin/shared/`)**:
  - The generic toolkit components (`ResourceTable.tsx`, `ResourceFormModal.tsx`, etc.) will be used as described in the `AdminPanelArchitecture.md` document.

- **API Service (`services/user.ts`)**:
  - A service contains functions like `getUsers`, `createUser`, `updateUser`, and `deleteUser`.

- **State Management (`react-query`)**:
  - Instead of a separate Zustand store for admin data, server state (such as the list of users) is managed directly within the `AdminUserManagement` component using `@tanstack/react-query`'s `useQuery` and `useMutation` hooks. This approach is efficient for handling asynchronous data, caching, and state synchronization with the server.

---

## 4. Security Enhancements

To ensure the application is robust and secure, the following measures will be implemented.

### 4.1. Detailed Password Policy

- **Backend:** Django's built-in `AUTH_PASSWORD_VALIDATORS` will be configured in `settings.py` to enforce password complexity (e.g., minimum length, numeric characters, etc.).
- **Frontend:** The `SignUpPage` and `ResetPasswordPage` will provide real-time feedback to the user on whether the password meets the required criteria as they type.

### 4.2. Rate Limiting

- **Backend:** To prevent brute-force and denial-of-service attacks, critical authentication endpoints (`/token/`, `/logout/`, `/register/`, `/password-reset/`) will be rate-limited using a library like `django-ratelimit`.

### 4.3. Secure Token Management (HttpOnly Cookies & In-Memory Access Token)

To mitigate XSS risks, the project uses a hybrid token strategy.

- **Backend:**
  - The `refresh_token` is sent to the client in a secure, `HttpOnly` cookie. This prevents it from being accessed by client-side JavaScript.
  - The `access_token` is returned in the JSON response body.
- **Frontend:**
  - The `access_token` is **stored in memory only** (in the Zustand store) and is **not persisted** to `localStorage`.
  - On application load, if the user's session is persisted (`isAuthenticated: true`), a request is immediately made to the `/token/refresh/` endpoint. This request uses the `HttpOnly` cookie to get a new `access_token`, which is then loaded into memory.
  - The `axiosInstance` request interceptor automatically attaches the in-memory `access_token` to all subsequent authenticated requests.
  - Upon logout, the frontend will call the `/api/users/logout/` endpoint, which blacklists the `refresh_token` on the server, invalidating the session.

### 4.4. Audit Logging

- **Backend:** Python's built-in `logging` module is used to log security-sensitive events to the console, which is ideal for a Dockerized environment.
- **Events Logged:** Successful logins, administrative user updates, and administrative user deletions.

---

## 5. User Experience & Profile Management

These enhancements improve the user flow and provide more account control.

### 5.1. "Remember Me" Functionality

- **Frontend:** The `SignInPage` will include a "Remember me" checkbox. Its value will be sent with the login request.
- **Backend:** Based on the "Remember me" flag, the expiration of the `refresh_token` cookie will be adjusted.
  - **If checked:** The token will have a long-lived duration of 30 days.
  - **If unchecked:** The token will be a session cookie, which expires when the browser is closed. This will be managed in our `MyTokenObtainPairView`.

### 5.2. Better Error and Success Notifications

- **Backend:** API error responses will be specific and user-friendly (e.g., `"A user with this email address already exists."`).
- **Frontend:** MUI's `Alert` and `Snackbar` components are used to display clear, non-intrusive notifications for both successful operations (e.g., "Profile updated successfully!") and errors, using the specific messages from the backend.

### 5.3. Expanded Profile Management

- **Profile Updates:** Users will be able to update their `first_name` and `last_name` in the `ProfileView` within the dashboard.
- **Account Deletion:** Users will have the option to permanently delete their account from the `ProfileView`. This action will require an explicit confirmation via a modal dialog to prevent accidental deletion.

---

## 6. Technical Implementation & Testing

### 6.1. Expanded Test Strategy

- **Backend:** `pytest` tests will be expanded to cover new functionality and security features:
  - Verify password policy enforcement during registration.
  - Test rate-limiting behavior for authentication endpoints.
  - Ensure that requests with expired or invalid `access_token` are rejected.
  - Test the `HttpOnly` cookie-based token refresh mechanism.
  - Test the logout functionality to ensure the refresh token is successfully blacklisted.
  - Validate all authorization checks for profile management endpoints.

### 6.2. Email Service Configuration

- **Development Environment:** For password reset functionality, the backend will use Django's `console.EmailBackend`. This will print the password reset link directly to the standard output (visible in the Docker container logs), removing the need to configure an external email service during local development.
- **Production Environment:** For production, the project will be configured to use a transactional email service (like SendGrid, Mailgun, or AWS SES) via the `django-anymail` package. API keys and service settings will be stored securely in the `.env` file, not in the codebase.
