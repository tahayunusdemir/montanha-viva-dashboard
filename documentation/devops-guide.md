# DevOps and Deployment Roadmap (From Scratch to Live)

This document covers the steps to automate the development processes, run the application consistently in a local environment, and deploy the application (frontend and backend) for the Montanha Viva project. Instead of code blocks, the logic of files and configurations is explained in text.

## 1. Version Control (Git & GitHub)

We will use Git and GitHub to manage the codebase and track changes.

1.  **Initialize Git Repository:** An empty Git repository is created in the project's main folder with the `git init` command.

2.  **Create `.gitignore` File:** A file named `.gitignore` is added to the project's root directory. This file specifies which files and folders Git should not track. Typically, `node_modules`, `__pycache__`, virtual environment folders (`venv/`), environment variable files (`.env`), and OS/IDE-specific files (`.vscode/`, `.DS_Store`) are added to this list. This keeps the repository clean and ensures that unnecessary files are not versioned.

3.  **Create and Link GitHub Repository:** A new private repository is created on GitHub. Then, you connect your local repository to this remote repository with the `git remote add origin <URL>` command and push your initial code with `git push -u origin main`.

## 2. Code Quality (Pre-commit)

`pre-commit` is used to ensure that the code adheres to certain quality standards before being pushed to the repository. It is configured by creating a `.pre-commit-config.yaml` file in the project's root directory. This file specifies the tools that will run before a commit. For example:
-   **For the Backend:** `black` automatically formats the code, while `flake8` checks for Python code style errors. These checks cover all backend code, including the **newly added user registration and login APIs**.
-   **For the Frontend:** `prettier` formats all JavaScript/TypeScript/CSS files, while `eslint` checks for logical errors and style issues in the code. This also includes all frontend code, such as the **new `SignInPage` and `SignUpPage` components**.

These hooks are activated with the `pre-commit install` command, and with every `commit` attempt, the relevant checks run automatically only for the changed files. This ensures that both the backend and frontend codebases remain consistent and high-quality.

## 3. Containerization (Docker)

Docker puts the application and its dependencies into isolated, portable packages called "containers." This solves the "it worked on my machine" problem.

### a. Backend `Dockerfile`

This file in the `backend` folder builds the Docker image for the Django application and uses a multi-stage build:
-   **Stage 1 (`builder`):** Starts with a clean Python image. It copies only the `requirements.txt` file and compiles all dependencies into the "wheel" format using the `pip wheel` command. This is a preparatory step that speeds up the installation in the next stage.
-   **Stage 2 (Final):** Starts again with a clean, small Python image. It copies and installs the wheels compiled in the `builder` stage. This is faster than compiling from scratch. Finally, it copies the entire project code into the image and sets the `CMD` to start the `gunicorn` server when the image is run. This is an image optimized for the production environment.

### b. Frontend `Dockerfile` (Multi-stage)

This file in the `frontend` folder has a complex, four-stage structure that can produce images for both development and production environments:

> **Note:** This `Dockerfile` packages the frontend application with Nginx in a Docker container. This method is ideal for scenarios like deploying the application to a general virtual private server (VPS) on AWS, DigitalOcean, or your own infrastructure. The **recommended deployment method** described later in this guide "Static Site" service, does **not** use this file and offers a simpler process.

-   **Stage 1 (`base`):** Starts with a basic Node.js image, installs the `pnpm` package manager, and installs all Node.js dependencies using only the `package.json` and `pnpm-lock.yaml` files. This stage creates a base for the other stages and prevents dependencies from being reinstalled repeatedly.
-   **Stage 2 (`dev`):** Based on the `base` image, it copies all project code and runs the Vite development server (`pnpm dev`) as the `CMD`. This stage is used by Docker Compose for local development.
-   **Stage 3 (`build`):** Also based on the `base` image, it copies all the code and runs the `pnpm run build` command to create the project's optimized static files (`dist` folder) for the production environment.
-   **Stage 4 (`prod`):** Starts with a very small `nginx` image. It copies the contents of the `dist` folder created in the `build` stage to Nginx's web server root directory. It also copies a custom `nginx.conf` file required for single-page applications like React Router, and finally starts the Nginx server with the `CMD` command. This is the production image.

### `frontend/nginx.conf`
This file configures how Nginx responds to incoming requests. The most important part is the `try_files` directive. This directive tells Nginx to first look for a file or folder at the requested path (e.g., `/routes/castelo-novo`). If it cannot find one, it redirects the request to `/index.html`. This is a critical step for single-page applications to work correctly, as it allows routing to be handled client-side by React Router.

## 4. Local Development (Docker Compose)

The `docker-compose.yml` file is located in the project's root directory and allows all services (frontend, backend, database) to be started for the development environment with a single command.
-   **Services:** The file defines three services: `db`, `backend`, and `frontend`.
-   **`db` service:** Uses the official `postgres` image. Information such as the database name, user, and password is set in the `environment` section. `volumes` are used to ensure that the database data is stored permanently on your computer.
-   **`backend` service:** Builds its own image using the `Dockerfile` in the `backend` folder. The `command` overrides the `gunicorn` command in the Dockerfile and instead runs Django's development server (`python manage.py runserver`), which reflects code changes instantly. `volumes` link the local `backend` folder to the `/app` folder inside the container, so any changes made to the code are immediately reflected in the container. `ports` forward port 8000 of the container to port 8000 of the host machine, allowing API requests from the frontend (`http://127.0.0.1:8000`) to reach the backend.
-   **`frontend` service:** Uses the `Dockerfile` in the `frontend` folder, but thanks to the `target: dev` setting, it only runs up to the `dev` stage. `volumes` provide code synchronization, and the `5173:5173` port forwarding allows access to the Vite development server from the browser.