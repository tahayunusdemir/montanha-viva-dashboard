# Montanha Viva Project

This document is the main guide for the Montanha Viva project. It contains information about what the project is, how to run it, and detailed documentation resources.

## 🚀 Project Description

Montanha Viva is a web application developed with a modern and robust tech stack. This project is designed to maximize the productivity of a single developer, ensure code quality, and facilitate long-term maintenance.

## ⚡️ Quick Start

You can start all the project's services (frontend, backend, database) in your local development environment with a single command.

**Requirements:**
-   [Docker](https://www.docker.com/products/docker-desktop/)
-   [Docker Compose](https://docs.docker.com/compose/install/)

**Steps:**

1.  **Clone the Project:**
    ```bash
    git clone https://github.com/tahayunusdemir/montanha-viva-dashboard.git
    cd montanha-viva-dashboard
    ```

2.  **Set Up Environment Variables:**
    -   **Backend:** Create a file named `.env` in the project's root directory. Add the variables specified in the "Creating the `.env` File" section of the [backend-guide.md](documentation/backend-guide.md) document.
    -   **Frontend:** Create a file named `.env` inside the `frontend` folder and add the `VITE_API_BASE_URL=http://127.0.0.1:8000/api` variable.

3.  **Start the Application:**
    While in the project's root directory, run the following command:
    ```bash
    docker-compose up --build
    ```
    This command will build the necessary images and start all services.

-   **Frontend:** `http://localhost:5173`
-   **Backend API:** `http://localhost:8000/api`
-   **Backend Admin:** `http://localhost:8000/admin`


## 🛠️ Tech Stack

The project utilizes a modern and efficient set of technologies.

-   **Frontend:** React, Vite, TypeScript, Material-UI, TanStack Query, Zustand
-   **Backend:** Django, Django REST Framework, Python
-   **Database:** PostgreSQL
-   **DevOps:** Docker, Docker Compose, Pre-commit

For a complete list of technologies and the rationale behind their selection, please review the **[TechStack.md](documentation/TechStack.md)** document.

## 📚 Detailed Documentation

This project is extensively documented to facilitate development, onboarding, and long-term maintenance. All guides are located in the `documentation/` folder.

| Document | Description |
| --- | --- |
| 📄 **[API Documentation](documentation/api-documentation.md)** | The API "contract." Details all endpoints, request/response formats, and authentication logic. |
| ⚙️ **[Backend Guide](documentation/backend-guide.md)** | Step-by-step instructions for setting up the Django backend from scratch. |
| 🎨 **[Frontend Guide](documentation/frontend-guide.md)** | Step-by-step instructions for setting up the React frontend from scratch. |
| 📦 **[Database Guide](documentation/database-guide.md)** | Explains the data models, database schema (ERD), and relationships. |
| 💅 **[Design Guide](documentation/design-guide.md)** | Defines the UI/UX standards, color palette, typography, and component usage rules. |
| 🚀 **[DevOps Guide](documentation/devops-guide.md)** | Covers version control, code quality hooks, containerization with Docker, and deployment. |

## 🏗️ Project Structure

The repository is organized into the following main directories:

-   `backend/`: Contains the Django backend application.
-   `frontend/`: Contains the React frontend application.
-   `documentation/`: Contains all detailed project documentation guides.
-   `docker-compose.yml`: Defines the multi-container setup for local development.
-   `.pre-commit-config.yaml`: Configuration for pre-commit hooks to ensure code quality.

---

This README serves as a central hub. We encourage you to explore the detailed documentation to fully understand the project's architecture and conventions.