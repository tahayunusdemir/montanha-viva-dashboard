# Montanha Viva Project - Detailed TODO List

This document outlines the detailed tasks for developing the Montanha Viva project from scratch, based on the provided documentation. Each task includes a reference to the relevant guide in the `documentation/` folder.

---

### 1. 🏗️ Project Setup & DevOps

This section covers the foundational steps for setting up the project's infrastructure, version control, and code quality tools.

- **Version Control (Git & GitHub)** (Reference: `devops-guide.md`)
  - [x] Initialize the Git repository in the project's root directory (`git init`).
  - [x] Create a `.gitignore` file to exclude sensitive information and generated files.
    - [x] Add `venv/`, `__pycache__/`, `db.sqlite3` for Python/Django.
    - [x] Add `node_modules/`, `dist/` for Node.js/Vite.
    - [x] Add `.env`, `*.env.*`, `!.env.example` for environment variables.
    - [x] Add OS/IDE-specific files like `.DS_Store`, `.vscode/`.
  - [x] Create a new repository on GitHub.
  - [x] Link the local repository to the remote (`git remote add origin <URL>`) and push the initial commit (`git push -u origin main`).

- **Code Quality (Pre-commit)** (Reference: `devops-guide.md`)
  - [x] Install the `pre-commit` tool (`pip install pre-commit`).
  - [x] Create the `.pre-commit-config.yaml` file in the project's root directory.
  - [x] Configure hooks for the backend: `black` (auto-formatting) and `flake8` (linting).
  - [x] Configure hooks for the frontend: `prettier` (auto-formatting) and `eslint` (linting).
  - [x] Activate the hooks by running `pre-commit install`.

- **Containerization (Docker & Docker Compose)** (Reference: `devops-guide.md`, `README.md`)
  - [x] **Backend (`backend/Dockerfile`)**:
    - [x] Implement a multi-stage build to optimize the final image size.
    - [x] **Stage 1 (`builder`):** Use a Python base image, copy `requirements.txt`, and compile dependencies into wheels using `pip wheel`.
    - [x] **Stage 2 (Final):** Use a slim Python image, copy compiled wheels from the `builder` stage, install them, copy the application code, and set `gunicorn` as the `CMD`.
  - [x] **Frontend (`frontend/Dockerfile`)**:
    - [x] Implement a multi-stage build for both development and production.
    - [x] **Stage 1 (`base`):** Use a Node base image, install `pnpm`, copy `package.json` files, and install dependencies.
    - [x] **Stage 2 (`dev`):** Build on `base`, copy all source code, and set the `CMD` to run the Vite dev server (`pnpm dev`).
    - [x] **Stage 3 (`build`):** Build on `base`, copy source code, and run `pnpm run build` to generate static assets.
    - [x] **Stage 4 (`prod`):** Use a lightweight `nginx` image, copy the `dist` folder from the `build` stage, and copy the custom Nginx configuration.
  - [x] **Nginx Config (`frontend/nginx.conf`)**:
    - [x] Configure Nginx to serve static files.
    - [x] Add the `try_files $uri $uri/ /index.html;` directive to handle client-side routing for the single-page application.
  - [x] **Docker Compose (`docker-compose.yml`)**:
    - [x] Define the `db` service using the official `postgres` image, setting environment variables and a volume for data persistence.
    - [x] Define the `backend` service, specifying the build context, overriding the `command` to use Django's dev server, mounting volumes for hot-reloading, and mapping port `8000`.
    - [x] Define the `frontend` service, specifying the build context with `target: dev`, mounting volumes for hot-reloading, and mapping port `5173`.

---

### 2. ⚙️ Backend Development (Django)

This section details the setup, configuration, and API endpoint creation for the Django backend application.

- **Project Setup & Basic Configuration** (Reference: `backend-guide.md`)
  - [x] Create the `backend/` directory and `cd` into it.
  - [x] Create and activate a Python virtual environment (e.g., `python -m venv venv && venv\Scripts\activate`).
  - [x] Install required packages: `pip install django djangorestframework psycopg2-binary django-environ djangorestframework-simplejwt django-cors-headers gunicorn`.
  - [x] Freeze dependencies: `pip freeze > requirements.txt`.
  - [x] Create the Django project (`django-admin startproject core .`) and an app (`python manage.py startapp api`).

- **Environment Variables & Settings** (Reference: `backend-guide.md`)
  - [x] Create `.env` file with `SECRET_KEY`, `DEBUG=True`, and `DATABASE_URL=postgres://user:password@db:5432/dbname`.
  - [x] Create a corresponding `.env.example` file.
  - [x] Configure `core/settings.py`:
    - [x] Add `rest_framework`, `corsheaders`, `rest_framework_simplejwt`, and `api` to `INSTALLED_APPS`.
    - [x] Add `corsheaders.middleware.CorsMiddleware` to the top of the `MIDDLEWARE` list.
    - [x] Configure `DATABASES` to read from `DATABASE_URL` using `django-environ`.
    - [x] Set `CORS_ALLOWED_ORIGINS` to include the frontend development URL (e.g., `http://localhost:5173`).
    - [x] Configure `REST_FRAMEWORK` to set `DEFAULT_AUTHENTICATION_CLASSES` to use `JWTAuthentication` and `DEFAULT_PERMISSION_CLASSES` to `IsAuthenticated`.
    - [x] Configure `SIMPLE_JWT` to set token lifetimes.

- **URL Routing** (Reference: `backend-guide.md`, `api-documentation.md`)
  - [x] In `core/urls.py`, route `/api/` to `api.urls` using `include()`.
  - [x] In `core/urls.py`, add paths for `TokenObtainPairView` (`/api/token/`) and `TokenRefreshView` (`/api/token/refresh/`).
  - [x] Manually create the `api/urls.py` file.

- **API Endpoints** (Reference: `backend-guide.md`, `api-documentation.md`, `database-guide.md`)
  - [x] **User Registration (`/register/`)**:
    - [x] In `api/serializers.py`, create `UserRegistrationSerializer`.
      - [x] Make `first_name` and `last_name` required fields.
      - [x] In the `validate` method, use Django's built-in `validate_password` to enforce strong passwords.
      - [x] Override the `create` method to assign `email` to the `username` field and use `set_password` to hash the password.
    - [x] In `api/views.py`, create `UserRegistrationView` as a `CreateAPIView` with `permission_classes = [AllowAny]`.
    - [x] Override the `create` method in the view to generate and return `access` and `refresh` tokens along with user data upon successful registration.
    - [x] Add the `path('register/', ...)` to `api/urls.py`.
  - [x] **Current User Info (`/users/me/`)**:
    - [x] In `api/serializers.py`, create `UserSerializer` exposing only `id`, `first_name`, `last_name`, and `email`.
    - [x] In `api/views.py`, create `UserProfileView` as a `RetrieveAPIView` with `permission_classes = [IsAuthenticated]`.
    - [x] Override the `get_object` method to simply return `self.request.user`.
    - [x] Add the `path('users/me/', ...)` to `api/urls.py`.
  - [x] **Sample Data Endpoints**:
    - [x] In `api/models.py`, create the `Message` model with `content`, `created_at`, and a `author` foreign key to the `User` model.
    - [x] Register the `Message` model in `api/admin.py`.
    - [x] Run `python manage.py makemigrations` and `python manage.py migrate`.
    - [x] In `api/views.py`, create `PublicDataView` (`AllowAny`) and `ProtectedDataView` (`IsAuthenticated`).
    - [x] Add paths for `/public-data/` and `/protected-data/` to `api/urls.py`.

- **Administration** (Reference: `backend-guide.md`)
  - [x] Create a superuser: `python manage.py createsuperuser`.
  - [x] Use the superuser credentials to test the `/api/token/` endpoint.

---

### 3. 🎨 Frontend Development (React)

This section covers the setup of the React application with Vite, adding core libraries, and creating the necessary UI/UX flow.

- **Project Setup & Dependencies** (Reference: `frontend-guide.md`)
  - [x] Create the project: `pnpm create vite frontend --template react-ts`.
  - [x] Install main dependencies: `pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom @tanstack/react-query axios zustand react-hook-form`.
  - [x] Install dev dependencies: `pnpm add -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react vitest @testing-library/react`.

- **Configuration & Project Architecture** (Reference: `frontend-guide.md`)
  - [x] Establish the `src/` folder structure: `assets`, `components`, `hooks`, `lib`, `pages`, `services`, `store`, `theme`, `types`.
  - [x] Configure `eslint.config.js` and `.prettierrc` for code quality.
  - [x] Configure `vite.config.ts` to set up a `jsdom` test environment.
  - [x] Create `frontend/.env` with `VITE_API_BASE_URL=http://127.0.0.1:8000/api`.

- **Core Systems Implementation** (Reference: `frontend-guide.md`, `design-guide.md`)
  - [x] **MUI Theme (`src/theme/`)**: Create a theme file that defines the `palette` (with primary color `#1976D2`, error color `#D32F2F`, etc.) and `typography` scales as specified in the design guide. Wrap the application in `<ThemeProvider>`.
  - [x] **Axios (`src/lib/axios.ts`)**:
    - [x] Create and export a central `axios` instance with the `baseURL` set from environment variables.
    - [x] Implement a **request interceptor** to read the `accessToken` from the Zustand store and add the `Authorization: Bearer <token>` header to every outgoing request.
    - [x] Implement a **response interceptor** to handle `401 Unauthorized` errors.
      - [x] On `401`, attempt to fetch a new `accessToken` using the `refreshToken` from the store via the `/token/refresh/` endpoint.
      - [x] If successful, update tokens in the store and automatically retry the original failed request.
      - [x] If refresh fails, trigger the `logout` action in the store and redirect the user to the login page.
  - [x] **API Services (`src/services/auth.ts`)**: Create and export typed functions for `register`, `login`, and `getMe` that use the central axios instance.
  - [x] **State Management (`src/store/authStore.ts`)**:
    - [x] Create a Zustand store with `accessToken`, `refreshToken`, `user`, and `isAuthenticated` state.
    - [x] Define actions: `login` (saves tokens), `setUser` (saves user profile), `logout` (clears state).
    - [x] Wrap the store with the `persist` middleware to save state to `localStorage`, ensuring the session survives page reloads.

- **Pages & Routing** (Reference: `frontend-guide.md`)
  - [x] **Routing (`App.tsx`)**: Set up all routes using `react-router-dom`.
  - [x] **Protected Routes**: Create a `PrivateRoute` component that checks `isAuthenticated` from the Zustand store and uses `<Navigate to="/sign-in" />` to redirect unauthenticated users.
  - [x] **Global User Fetch**: In `App.tsx`, use a `useEffect` hook to check for a token on app load. If a token exists, call the `getMe` service to fetch and store user data globally.
  - [ ] **`SignUpPage.tsx` (`/sign-up`)**: Use `react-hook-form` for a form with `firstName`, `lastName`, `email`, and `password` fields. Use `useMutation` from TanStack Query to call the `register` service. On success, redirect to `/dashboard`. Display backend validation errors using the `error` state from the mutation and an MUI `<Alert>`.
  - [ ] **`SignInPage.tsx` (`/sign-in`)**: Use `react-hook-form` for a form with `email` and `password` fields. Use `useMutation` from TanStack Query to call the `login` service. On success, redirect to `/dashboard`. Display backend validation errors using the `error` state from the mutation and an MUI `<Alert>`.
  - [ ] **`DashboardPage.tsx` (`/dashboard`)**: Display user data and provide options to sign out.
  - [ ] **`SignOutPage.tsx` (`/sign-out`)**: Redirect to sign-in page after sign out.
  - [ ] **`NotFoundPage.tsx` (`/not-found`)**: Display a 404 error page.
