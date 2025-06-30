# API Documentation (Contract)

This document describes how to interact with the backend API for the Montanha Viva project. It serves as a "contract" for frontend and backend developers.

**API Base URL:** `http://127.0.0.1:8000`

---

## 🔑 Authentication

The API uses **JWT (JSON Web Token)** based authentication for protected endpoints.

- **Method:** JWT (JSON Web Token)
- **Flow:**
  1.  User registers (`/api/users/register/`) or logs in (`/api/token/`) to receive `access` and `refresh` tokens.
  2.  `access` token is sent in the `Authorization: Bearer <token>` header for all protected requests.
  3.  Expired `access` tokens are renewed using the `refresh` token at the `/api/token/refresh/` endpoint.

### Endpoints

The API base URL is `http://127.0.0.1:8000`. All API routes are prefixed with `/api`.

**User & Auth (`users` app):**

- `POST /api/users/register/`: Public endpoint to create a new user. Returns user data and tokens.
- `POST /api/token/`: Public endpoint to log in. Requires `username` (which is the user's email) and `password`.
- `POST /api/token/refresh/`: Public endpoint to refresh an access token.
- `GET /api/users/me/`: Protected endpoint to get the current logged-in user's profile.

**Sample Data (`data` app):**

- `GET /api/public-data/`: Public endpoint for non-sensitive data.
- `GET /api/protected-data/`: Protected endpoint requiring authentication.

### Data Model

---

## Endpoints

### 👤 User and Authentication

#### 1. User Registration

Creates a new user and returns tokens upon successful registration.

- **Endpoint:** `POST /api/users/register/`
- **Description:** This endpoint is public.
- **Request Body:**
  ```json
  {
    "first_name": "Example",
    "last_name": "User",
    "email": "user@example.com",
    "password": "AStrongPassword123!"
  }
  ```
- **Successful Response (201 Created):**
  ```json
  {
    "id": 1,
    "first_name": "Example",
    "last_name": "User",
    "email": "user@example.com",
    "tokens": {
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (400 Bad Request):**
  - If email is already in use:
    ```json
    {
      "email": ["This email address is already in use."]
    }
    ```
  - If password is weak:
    ```json
    {
      "password": [
        "This password is too common.",
        "Password must be at least 8 characters long."
      ]
    }
    ```

#### 2. User Login (Get Token)

Gets `access` and `refresh` tokens with user credentials.

- **Endpoint:** `POST /api/token/`
- **Description:** Due to Django's default authentication mechanism, the email address must be sent in the `username` field.
- **Request Body:**
  ```json
  {
    "username": "user@example.com",
    "password": "AStrongPassword123!"
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "detail": "No active account found with the given credentials"
  }
  ```

#### 3. Refresh Access Token

Used to renew an expired `access` token.

- **Endpoint:** `POST /api/token/refresh/`
- **Request Body:**
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 4. Get Current User Information

Returns the profile information of the logged-in user.

- **Endpoint:** `GET /api/users/me/`
- **Authentication:** Required (`Bearer Token`).
- **Successful Response (200 OK):**
  ```json
  {
    "id": 1,
    "first_name": "Example",
    "last_name": "User",
    "email": "user@example.com"
  }
  ```
- **Error Response (401 Unauthorized):** If the token is missing or invalid.

### 📊 Sample Data Endpoints

#### 1. Public Data

Returns sample data that does not require authentication.

- **Endpoint:** `GET /api/public-data/`
- **Authentication:** Not required.
- **Successful Response (200 OK):**
  ```json
  {
    "message": "This is public data."
  }
  ```

#### 2. Protected Data

Returns sample data that is only accessible to logged-in users.

- **Endpoint:** `GET /api/protected-data/`
- **Authentication:** Required (`Bearer Token`).
- **Successful Response (200 OK):**
  ```json
  {
    "message": "This is protected data and can only be seen by logged-in users."
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "detail": "Authentication credentials were not provided."
  }
  ```
