# Montanha Viva Project

This document is the main guide for the Montanha Viva project. It contains information about what the project is, its core features, how to run it, and detailed documentation resources.

## 🚀 Project Description

Montanha Viva is a comprehensive full-stack web application designed to serve as an interactive dashboard and information hub for a nature-focused organization. The project is built with a modern and robust tech stack, emphasizing developer productivity, code quality, and long-term maintainability through extensive documentation and adherence to best practices.

The application combines a powerful, modular Django backend with a feature-rich, scalable React frontend. The entire environment is containerized with Docker, ensuring a seamless and consistent setup for local development and production deployment.

## ✨ Core Features

The application is architected with a clean separation between the backend API and the frontend client, providing a rich set of features.

### Backend (Django)

- **👤 Advanced User & Auth System:**
  - **Custom User Model:** Uses email as the primary identifier.
  - **Secure JWT Authentication:** Implements JWT for stateless authentication, using short-lived access tokens and securely storing long-lived refresh tokens in HttpOnly cookies to prevent XSS attacks.
  - **Complete Auth Flow:** Includes user registration, login (with "remember me" functionality), and a secure logout mechanism that blacklists tokens.
  - **Password Management:** Full password reset functionality via email, and a secure endpoint for users to change their own password.
  - **Role-Based Access Control:** Clear distinction between regular users and administrators (`is_staff`).
  - **Admin User Management:** A dedicated admin interface for CRUD operations on users.

- **📝 Feedback System:**
  - Allows both authenticated and anonymous users to submit feedback.
  - Admins can view, manage, and respond to all feedback submissions through a dedicated admin panel.

- **🌿 Flora & Routes Encyclopedia:**
  - A rich, read-only encyclopedia for public users to explore local flora and hiking routes.
  - Complete admin interface for CRUD management of plants and routes, including image and GPX file uploads.
  - **Data Seeding:** Includes management commands to easily populate the database with initial plant and route data.

- **🏆 QR Code Rewards System:**
  - Users can scan QR codes placed at points of interest to earn points.
  - A point-based system allows users to redeem points for discount coupons.
  - Full admin management for creating and managing QR codes.

- **📡 IoT Sensor Data Platform:**
  - An endpoint to ingest time-series data from IoT weather stations.
  - Users can view and filter sensor data by station and date range.
  - **Data Export:** Functionality to export filtered measurement data as a CSV file.
  - Admin management for sensor stations.

- **🌦️ Weather Forecast Service:**
  - Integrates with the IPMA (Portuguese Institute for Sea and Atmosphere) API.
  - **Caching:** Location and forecast data are cached to improve performance and reduce external API calls.

### Frontend (React)

- **🎨 Modern & Responsive UI:**
  - Built with **React**, **TypeScript**, and **Vite** for a fast and type-safe development experience.
  - A rich component library based on **Material-UI (MUI)**.
  - **Custom Theming:** A well-structured and customizable theme that supports both light and dark modes.

- **🚀 Scalable Architecture:**
  - **Component-Based & Feature-Driven:** Code is organized logically into features, pages, and reusable components.
  - **Advanced Routing:** Utilizes **React Router** with lazy loading for components, ensuring optimal initial page load times.
  - **Protected Routes:** Separate routes for authenticated users (`PrivateRoute`) and administrators (`AdminRoute`).

- **⚙️ State-of-the-Art State Management:**
  - **Client State:** Uses **Zustand** for lightweight, global client-side state management (e.g., auth status, user profile). The state is persisted in `localStorage` to maintain the session on page refresh.
  - **Server State:** Leverages **TanStack Query (React Query)** to manage server state, including data fetching, caching, and optimistic updates. This significantly reduces redundant API calls and simplifies data synchronization.

- **📡 Seamless API Integration:**
  - A central **Axios** instance with interceptors automatically manages JWT token injection into request headers.
  - **Automatic Token Refresh:** The Axios response interceptor handles expired access tokens by transparently calling the refresh token endpoint and retrying the original request, providing a smooth user experience.
  - **Type-Safe Services:** Dedicated service files for each backend app (`auth.ts`, `flora.ts`, etc.) to interact with the API in a structured and type-safe manner.

- **🎛️ Comprehensive Admin & User Dashboards:**
  - A full-featured dashboard for both regular users and administrators.
  - **Admin Panels:** Dedicated UI for managing users, feedback, flora, routes, QR codes, and stations, providing full CRUD functionality.
  - **User Views:** Interactive views for exploring encyclopedias, tracking rewards, viewing sensor data with charts, and managing personal profiles.

## 🛠️ Tech Stack

### Backend

- **Framework:** Python, Django & Django REST Framework
- **Authentication:** `djangorestframework-simplejwt` with HttpOnly cookies for refresh tokens.
- **Database:** PostgreSQL (via `psycopg2-binary`)
- **File & Image Handling:** `Pillow`, `qrcode`
- **Testing:** `pytest` and `pytest-django`

### Frontend

- **Core:** React, TypeScript, Vite
- **UI:** Material-UI (MUI)
- **State Management:** Zustand (Client State), TanStack Query (Server State)
- **Routing:** React Router
- **API Communication:** Axios
- **Form Handling:** React Hook Form
- **Linting & Formatting:** ESLint, Prettier

### DevOps

- **Containerization:** Docker & Docker Compose
- **Web Server:** Gunicorn (Backend), Nginx (Frontend)
- **Code Quality:** `pre-commit` hooks

For a complete list of technologies and the rationale behind their selection, please review the **[TechStack.md](documentation/TechStack.md)** document.

## ⚡️ Quick Start

You can start all the project's services (frontend, backend, database) in your local development environment with a single command.

**Requirements:**

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

**Steps:**

1.  **Clone the Project:**

    ```bash
    git clone https://github.com/tahayunusdemir/montanha-viva-dashboard.git
    cd montanha-viva-dashboard
    ```

2.  **Set Up Environment Variables:**
    - **Backend:** Create a file named `.env` in the `backend/` directory. You can copy `backend/.env.example` and fill in the values. The default `docker-compose.yml` values are suitable for local development.
    - **Frontend:** Create a file named `.env` inside the `frontend/` directory and add the `VITE_API_BASE_URL=http://127.0.0.1:8000/api` variable.

3.  **Install Git Hooks (Recommended):**
    To ensure code quality and consistency, this project uses pre-commit hooks. Install them by running:

    ```bash
    pre-commit install
    ```

4.  **Start the Application:**
    While in the project's root directory, run the following command:

    ```bash
    docker-compose up --build
    ```

    This command will build the necessary images and start all services.
    - **Frontend:** `http://localhost:5173`
    - **Backend API:** `http://localhost:8000/api`
    - **Backend Admin:** `http://localhost:8000/admin`

5.  **Populate the Database with Initial Data (Optional):**
    After the application is running, you can load initial data into the database. Open a new terminal and run the following commands.
    - **Create a Superuser:** This allows you to access the Django admin interface.

      ```bash
      docker-compose exec backend python manage.py createsuperuser
      ```

    - **Load Initial Data:** The following commands load data for stations, flora, and routes. These commands are idempotent and can be run multiple times.
      ```bash
      docker-compose exec backend python manage.py load_station_data data/dados_com_colunas_personalizadas.csv
      docker-compose exec backend python manage.py load_flora_data
      docker-compose exec backend python manage.py load_routes_data
      ```

## 📚 Detailed Documentation

This project is extensively documented to facilitate development, onboarding, and long-term maintenance. All guides are located in the `documentation/` folder.

| Document                                                       | Description                                                                                    |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 📄 **[API Documentation](documentation/api-documentation.md)** | The API "contract." Details all endpoints, request/response formats, and authentication logic. |
| ⚙️ **[Backend Guide](documentation/backend-guide.md)**         | Step-by-step instructions for setting up the Django backend from scratch.                      |
| 🎨 **[Frontend Guide](documentation/frontend-guide.md)**       | Step-by-step instructions for setting up the React frontend from scratch.                      |
| 📦 **[Database Guide](documentation/database-guide.md)**       | Explains the data models, database schema (ERD), and relationships.                            |
| 💅 **[Design Guide](documentation/design-guide.md)**           | Defines the UI/UX standards, color palette, typography, and component usage rules.             |
| 🚀 **[DevOps Guide](documentation/devops-guide.md)**           | Covers version control, code quality hooks, containerization with Docker, and deployment.      |

## 🏗️ Project Structure

The repository is organized into the following main directories:

- `backend/`: Contains the Django backend application, with each feature in a separate app.
- `frontend/`: Contains the React frontend application.
- `documentation/`: Contains all detailed project documentation guides.
- `docker-compose.yml`: Defines the multi-container setup for local development.
- `.pre-commit-config.yaml`: Configuration for pre-commit hooks to ensure code quality.

---

This README serves as a central hub. We encourage you to explore the detailed documentation to fully understand the project's architecture and conventions.
