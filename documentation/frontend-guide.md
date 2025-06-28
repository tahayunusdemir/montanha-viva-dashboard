# Frontend Development Roadmap (From Scratch to Live)

This document provides a detailed explanation of the steps to set up, develop, and prepare the frontend of the Montanha Viva project for deployment from scratch, using the technologies specified in `TechStack.md`. Instead of code blocks, the logic of files and code is explained in text.

## 1. Project Setup (Vite + React + TypeScript)

We will use Vite for a modern, fast, and efficient development environment.

**Requirements:**
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [pnpm](https://pnpm.io/installation) (a fast and efficient package manager)

**Steps:**

1.  **Create the Project:**
    In your terminal, navigate to the directory where you want to create your project and run the following command to create a React and TypeScript project named `frontend`.
    ```bash
    pnpm create vite frontend --template react-ts
    ```

2.  **Enter Project Directory and Install Dependencies:**
    ```bash
    cd frontend
    pnpm install
    ```

3.  **Start the Development Server:**
    ```bash
    pnpm dev
    ```
    This command will run your project at an address like `http://localhost:5173` and will instantly reflect any changes you make in the browser.

## 2. Adding Core Dependencies

To install the UI library, state management, and other tools that form the cornerstones of the application, run the following commands while in the `frontend` project folder.

```bash
# Material UI (MUI) and related packages
pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material

# React Router (For page routing)
pnpm add react-router-dom

# TanStack Query (For data fetching and server state management)
pnpm add @tanstack/react-query

# Axios (For API requests)
pnpm add axios

# Zustand (For global state management)
pnpm add zustand

# React Hook Form (For form management and validation)
pnpm add react-hook-form

# Code Quality Tools (As development dependencies)
pnpm add -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react vitest @testing-library/react
```
These commands add both regular and development (`-D`) dependencies to your project.

## 3. Project Structure and Configuration Files

To keep the code organized, readable, and manageable, a folder structure and additional configuration files like the following are created:

```
frontend/
├── .eslintrc.cjs        # ESLint configuration file
├── .prettierrc          # Prettier configuration file
├── vitest.config.ts     # Vitest configuration file
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components (Button, Input, etc.)
│   ├── hooks/           # Custom React hooks (e.g., useAuth, useUser)
│   ├── lib/             # Central library configurations (e.g., axios)
│   ├── pages/           # Application pages (e.g., HomePage, SignInPage, SignUpPage, DashboardPage)
│   ├── services/        # Modules managing API calls (e.g., authService)
│   ├── store/           # Global state management (Zustand)
│   ├── theme/           # MUI theme configuration
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component and Route management
│   └── main.tsx         # Application entry point
└── ...
```
-   **.eslintrc.cjs:** This file specifies which rules (plugins) ESLint will use and which TypeScript/React features it will check.
-   **.prettierrc:** Defines code formatting rules (e.g., line length, semicolon usage).
-   **vitest.config.ts:** Contains settings for configuring the test environment (e.g., JSDOM) and specifying where to find test files.

## 4. Environment Variables (`.env`)

To separate sensitive information and environment-specific values from the code, create a `.env` file in the root directory of the `frontend` folder.

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```
Vite automatically makes these variables, prefixed with `VITE_`, available to the application. This file should be added to `.gitignore` for security reasons.

## 5. Implementing the Core Flow

### a. Central `axios` Configuration (`src/lib/axios.ts`)

To manage API requests from a single location, a central `axios` instance is created in the `src/lib/axios.ts` file. The `baseURL` property of this instance is now read from the `.env` file: `import.meta.env.VITE_API_BASE_URL`. An "interceptor" will also be defined in this file to automatically add the authentication token to every API request.

### b. API Service Layer (`src/services/auth.ts`)

This layer contains functions corresponding to the API endpoints on the backend. For example, two functions are defined in the `auth.ts` file:
-   **`register` function:** Takes a name, surname, email, and password and sends a POST request to the backend's `/api/register/` endpoint.
-   **`login` function:** Takes a username (email) and password and sends a POST request to the backend's `/api/token/` endpoint.
-   **`getMe` function:** Sends a GET request to the newly created `/api/users/me/` endpoint on the backend (with the token in the Authorization header) to retrieve the logged-in user's information.

### c. Global State Management (`src/store/authStore.ts`)

`zustand` is used to manage the user's authentication status, tokens, and user information throughout the application. A structure like the following is created in the `src/store/authStore.ts` file:
-   **State:** Contains states like `accessToken`, `refreshToken`, `isAuthenticated`, and `user` (an object holding information like `firstName`, `lastName`).
-   **Actions:**
    -   `login`: Saves the `accessToken` and `refreshToken` to the state after a successful login.
    -   `setUser`: Writes the user data returned from the `getMe` function to the `user` state.
    -   `logout`: Ends the user's session by clearing tokens and user information from the state and browser storage.
-   **State Persistence:** To prevent the user from losing their login state when they refresh the page or close and reopen the browser, `zustand`'s `persist` middleware is used. This middleware automatically saves data from the store (usually `accessToken` and `user`) to the browser's `localStorage` and restores this data when the application reloads. This is easily configured by wrapping the `create` function with `persist`.

### d. Automatically Adding Tokens with an Axios Interceptor

In the `src/lib/axios.ts` file, "interceptors" are added to the created `axios` instance to intercept both before requests are sent and after responses are received.

#### d.1. Request Interceptor (Before Request)
This interceptor intervenes just before a request is sent, reads the `accessToken` from the `zustand` store, and if a token exists, adds it to the request's `Authorization` header as `Bearer <token>`. This way, every request to protected endpoints (e.g., `/api/users/me/`) automatically includes authentication.

#### d.2. Response Interceptor (After Response) - Token Refresh
This interceptor is critical for a seamless user experience. Since `accessToken`s are short-lived, it activates when a `401 Unauthorized` error is received from the API.
-   **Flow:**
    1.  A response containing a `401` error is caught from the API.
    2.  The interceptor uses the `refreshToken` stored in the `zustand` store to send a request to the backend's `/api/token/refresh/` endpoint to get a new token.
    3.  If the refresh is successful, the new `accessToken` and `refreshToken` returned are updated in the `zustand` store.
    4.  The original request that resulted in the `401` error is automatically resent with the new `accessToken`. The user does not notice this process.
    5.  If the `refreshToken` is also invalid (refresh fails), the user's session is terminated (`logout` action is called) and they are redirected to the login page.

This mechanism ensures that the user can use the application smoothly throughout their session.

### e. Pages and Route Management (`App.tsx`)

#### 1. Home Page (`HomePage`)
This page is the entry point of the application (`/` path). It is public.
-   It contains a simple "Welcome" message.
-   It includes two buttons (`Sign Up` and `Sign In`) that direct the user to the `/sign-up` and `/sign-in` routes.

#### 2. Sign Up Page (`SignUpPage`)
This page is located at the `/sign-up` path.
-   It contains a form managed with `react-hook-form` that takes the user's **Name, Surname, Email, and Password**. Input validation (e.g., email format) is handled by this library.
-   When the form is submitted, it calls the `register` function in `authService`.
-   Upon successful registration, the **JWT tokens** (`accessToken` and `refreshToken`) returned from the backend are directly received and saved to the `zustand` store. This eliminates the need for an extra login API call, and the user is directly redirected to the **Dashboard (`/dashboard`)**. In case of a registration error (e.g., email already in use) or password validation error, the error message from the backend (read from `TanStack Query`'s `error` object) is caught and displayed to the user with an MUI component like `Alert`.
-   > *Note: This efficient flow requires updating the `/api/register/` endpoint specified in `backend-guide.md` to return tokens upon successful registration. This is a modern and recommended approach.*

#### 3. Sign In Page (`SignInPage`)
This page is located at the `/sign-in` path.
-   It contains a form managed with `react-hook-form` that takes the user's **Email and Password**.
-   When the form is submitted, it calls the `login` function in `authService`.
-   If successful, the returned tokens are saved to the `zustand` store, and the user is redirected to the **Dashboard (`/dashboard`)**. In case of incorrect credentials, the error from the backend is caught and a clear message is displayed to the user on the form or in a separate `Alert` component.
-   This page also includes a link to the sign-up page.

#### 4. Dashboard Page (`DashboardPage`)
This page is at the `/dashboard` path and is a **protected route**.
-   The page displays user information by reading it directly from the `zustand` store. It does not need to call the `getMe` function, as this data will have already been fetched when the application first loaded (as explained below).
-   It displays a welcome message containing the user's first and last name (read from the `zustand` store) (e.g., "Welcome, Taha PAKSU").
-   It includes a **Log Out** button. Clicking this button triggers the `logout` action in the `zustand` store, and the user is redirected to the **Home Page (`/`)**.

#### 5. Protected Routes and Global User Data
In `App.tsx`, it is ensured that routes like `DashboardPage` are accessible only by logged-in users. To manage this, the best practice is to create a reusable `PrivateRoute` component that checks the `isAuthenticated` status in the `zustand` store. This component renders the underlying page (`children` prop) if the user is logged in; otherwise, it automatically redirects the user to the **Sign In Page (`/sign-in`)** using the `Navigate` component (from react-router-dom).

**Global User Data Strategy:**
To ensure user data (`user` object) is consistent throughout the application, a more robust approach is to call the `getMe` function within a `useEffect` hook in the main application component (`App.tsx`), rather than just on a specific page. This `useEffect`, runs when the application first loads, checks for the presence of a token from the `zustand` store (via `localStorage`), and if a token exists, it makes a `getMe` request to write the user information to the store. This way, no matter which protected page the user visits or if they refresh the page, their information is always ready.

### f. Writing Tests (`src/components/MyComponent.test.tsx`)

Writing component tests with `Vitest` and `React Testing Library` is quite simple.
-   A file like `MyComponent.test.tsx` is created next to the component to be tested.
-   Inside, the test scenario is grouped with `describe`, and individual tests are defined with `it` (`it('should render correctly', ...)`).
-   The component is rendered to a virtual DOM with the `render` function, and elements within it are accessed using the `screen` object.
-   Expectations are checked with `expect`. For example, `expect(screen.getByText('Hello')).toBeInTheDocument()`.
-   **Authentication Tests:** Tests should be written for scenarios like ensuring `SignInPage` and `SignUpPage` render correctly, contain form elements, and display error messages on invalid data entry. A test should also be added to verify that `DashboardPage` redirects to the sign-in page when an unauthenticated user tries to access it.

## 6. Development Process

During the development process, it is recommended to break down your code into parts:
-   **API Requests:** Collect all your API calls in the `services` layer.
-   **Data Fetching:** Use `useQuery` for reading data from the server (like user information).
-   **Data Mutation:** Use the `useMutation` hook for writing data to the server (login, register).
-   **Global State Management:** Prefer `zustand` for application-wide states like user information and tokens.
-   **Forms:** Use the `react-hook-form` library for complex forms and validations.
-   **Tests:** Increase the stability of your code by writing tests for every important component or hook.

## 7. Production Build

To get the application ready for deployment, run the following command:

```bash
pnpm build
```

This command compiles and optimizes your project, creating a `dist` folder that contains all the static files (HTML, CSS, JS). This folder can be uploaded to any static site hosting service.

For detailed steps on how to deploy your application and for different deployment scenarios (Render.com or a traditional server with Docker), please review the "Deployment" section in the `devops-guide.md` document. 