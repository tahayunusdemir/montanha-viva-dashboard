# Montanha Viva - Advanced Tech Stack

This document details the selected and recommended technologies for the development, testing, and deployment of the Montanha Viva project. The choices were made specifically to maximize the productivity of a single developer, ensure code quality, and facilitate the long-term maintenance of the project.

## 1. Frontend

Technologies chosen to create a modern, fast, and interactive user interface.

| Category             | Technology                       | Purpose and Rationale (Benefit for a Single Developer)                                                                                                                                                                                                          |
| -------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI Framework**     | **React**                        | Its component-based architecture allows for the creation of reusable and manageable UI parts. Its vast ecosystem makes it easy to find solutions for every need.                                                                                                |
| **Build Tool**       | **Vite**                         | Starts the development server in seconds and provides instant "Hot Module Replacement" (HMR). This means that code changes are reflected in the UI instantly, which incredibly speeds up development.                                                           |
| **Language**         | **TypeScript**                   | Provides type safety while coding, catching potential errors (e.g., `undefined` errors) at compile time. It speeds up coding with auto-completion (IntelliSense) support and increases project readability.                                                     |
| **UI Library**       | **Material UI (MUI)**            | Based on Google's Material Design principles, it offers ready-to-use and customizable components. It allows for the rapid creation of aesthetic and consistent interfaces without wasting time on design.                                                       |
| **State Management** | **Zustand**                      | It is a minimalist and simple state management solution. It allows managing global state with an easy, hook-based API without boilerplate code. Its `persist` middleware makes it very easy to store the state in the browser's memory (localStorage).          |
| **Data Fetching**    | **TanStack Query (React Query)** | It is the industry standard for server state management. It manages complex operations like data fetching from an API, caching, and invalidation with simple hooks. It reduces code repetition by automatically managing states like `isLoading` and `isError`. |
| **API Client**       | **Axios**                        | A popular HTTP client for the browser and Node.js. It offers advanced features like intercepting requests and responses, canceling requests, and managing time-outs.                                                                                            |
| **Form Management**  | **React Hook Form**              | Simplifies form state management and validation. It offers high performance by preventing unnecessary re-renders. Its integration with UI libraries like MUI is very easy.                                                                                      |

## 2. Backend

Technologies chosen to build a powerful, secure, and scalable server infrastructure.

| Category            | Technology                      | Purpose and Rationale (Benefit for a Single Developer)                                                                                                                                                      |
| ------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**       | **Django**                      | Comes with a "batteries-included" philosophy; it incredibly speeds up the development process by providing many ready-to-use features like an admin panel, ORM, and authentication. It is security-focused. |
| **API Framework**   | **Django REST Framework (DRF)** | Enables building powerful and flexible RESTful APIs on top of Django. It provides standard solutions for topics like serialization, authentication, **user registration (signup)**, and documentation.      |
| **Authentication**  | **DRF Simple JWT**              | Easily integrates a JSON Web Token (JWT) based authentication system, which is the standard for modern applications. **Used for user login.**                                                               |
| **Configuration**   | **django-environ**              | Allows managing sensitive information like API keys and database passwords in `.env` files. It makes the code more secure and portable.                                                                     |
| **CORS Management** | **django-cors-headers**         | Manages the necessary CORS headers for requests from the frontend (from a different domain/port) to be accepted by the backend.                                                                             |

## 3. Database

Technology chosen for data storage.

| Category     | Technology     | Purpose and Rationale                                                                                                                                                                     |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database** | **PostgreSQL** | It is a reliable, mature, and scalable open-source relational database. It supports advanced data types such as geographic data (with the PostGIS extension), JSON, and full-text search. |

## 4. Code Quality and Testing

Tools used to ensure the application is stable, error-free, and easy to maintain.

| Category                 | Technology                         | Purpose and Rationale                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend Format/Lint**  | **Pre-commit (black, flake8)**     | Automatically formats (black) and checks style (flake8) before code is committed. It ensures a consistent code style throughout the project, increasing readability.                                                   |
| **Frontend Format/Lint** | **ESLint & Prettier**              | ESLint catches potential errors in the code, while Prettier automatically formats the code to a standard style. This duo maximizes frontend code quality and readability.                                              |
| **Backend Test**         | **Pytest & pytest-django**         | Pytest is a modern and flexible testing framework for Python. With the `pytest-django` plugin, testing Django projects becomes extremely easy.                                                                         |
| **Frontend Test**        | **Vitest & React Testing Library** | Vitest is a next-generation testing tool that offers excellent integration with Vite. React Testing Library encourages writing tests by simulating how users interact with components, leading to more reliable tests. |

## 5. DevOps and Deployment

Tools chosen to automate the development process, ensure environment consistency, and deploy the application.

| Category             | Technology                   | Purpose and Rationale                                                                                                                                                                         |
| -------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Containerization** | **Docker & Docker Compose**  | Eliminates the "it worked on my machine" problem. It ensures that the application and all its dependencies (database, Redis, etc.) run consistently in any environment with a single command. |
| **Version Control**  | **Git & GitHub**             | Keeps a version history of the code and facilitates teamwork (if any in the future). It serves as the central repository for the project.                                                     |
| **Platform (PaaS)**  | **Render / Fly.io / Heroku** | Used to easily deploy Docker containers or code directly to a live environment without dealing with server management. They also make it easy to set up services like databases.              |
