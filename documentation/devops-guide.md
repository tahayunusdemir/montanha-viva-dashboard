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

> **Note:** This `Dockerfile` packages the frontend application with Nginx in a Docker container. This method is ideal for scenarios like deploying the application to a general virtual private server (VPS) on AWS, DigitalOcean, or your own infrastructure. The **recommended deployment method** described later in this guide, Render.com's "Static Site" service, does **not** use this file and offers a simpler process.

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

## 5. Deployment - Render.com Example

For the deployment process, we will choose the [Render.com](https://render.com/) platform due to its **free starter tier** and **ease of use**. Render allows us to manage both frontend and backend services from a single place and largely automates the process by connecting to your GitHub account. This makes the process very simple, even for a user with little technical knowledge.

**Important Note:** Render's free tier is great for trial and entry-level projects, but it has some limitations:
*   **Free Database:** Expires and is deleted after 90 days. It may be necessary to switch to a paid plan for the long-term persistence of the project.
*   **Free Web Services:** They go to "sleep" if they do not receive requests for 15 minutes. It can take up to 30 seconds for them to wake up again when a new request arrives.

This platform is one of the most ideal options for quickly and cost-effectively publishing our project on the internet.

To deploy the application, the Render platform and a `render.yaml` file are used. This "Infrastructure as Code" file tells Render how to set up the project's infrastructure.
-   **Services:** The file defines three services: a database, a backend, and a frontend.
-   **Database Service (`pserv`):** Creates a managed PostgreSQL database service named `montanhaviva-db`.
-   **Backend Service (`web`):** Defines a web service to run in a Python environment. It uses the `backend` subdirectory of the GitHub repository. As the `buildCommand`, it specifies first installing dependencies with `pip install`, and then applying database changes with `python manage.py migrate`. This `migrate` command is **critically important** for automatically applying changes in your database models every time new code is pushed to production. As the `startCommand`, it specifies the `gunicorn` command for the production environment. In the `envVars` section, it specifies that `DATABASE_URL` will be automatically obtained from the newly created database service and that `SECRET_KEY` will be securely generated by Render.
-   **Frontend Service (`web`):** This service is configured using **Render's "Static Site" service type** and therefore does **not** use the `Dockerfile` in the `frontend` folder. It uses the `frontend` subdirectory of the repository. As the `buildCommand`, it specifies installing dependencies with `pnpm` and building the project (`pnpm run build`). `publishPath` indicates that the resulting `dist` folder from the build will be served. Finally, a `rewrite` rule is added that performs the function of the `nginx.conf` file and is mandatory for single-page applications, redirecting all unknown requests to `index.html`.

Render reads this file, automatically sets up the entire infrastructure, and automatically updates the application after every `push` to your GitHub repository's `main` branch.

### Alternative Deployment Method: Deployment to a Traditional Server with Docker (VPS)

Instead of using a managed platform like Render.com, you might want to deploy your project to a virtual server like an AWS EC2 or DigitalOcean Droplet, or to your own infrastructure. This scenario gives you full control over the infrastructure, and at this point, the Docker images we created in Section 3 come into play.

This approach generally involves the following steps:
1.  **Server Preparation:** You install Docker and Docker Compose on your server.
2.  **Transferring Code to the Server:** You pull your code to the server using `git clone`.
3.  **Production Environment Configuration:** Unlike the `docker-compose.yml` file used for the development environment, you can create a `docker-compose.prod.yml` file specific to the production environment. In this file:
    -   The **backend service** is started with the `gunicorn` command instead of the development server (`runserver`).
    -   The **frontend service** is configured to use the `prod` image prepared in Section 3, which includes Nginx, instead of the development server (`dev`). Ports `80` and `443` (for SSL) are used.
    -   An `.env` file for sensitive information is securely created on the server.
4.  **Starting the Application:** You start all services in the background with the `docker-compose -f docker-compose.prod.yml up -d` command.

Although this method requires more manual configuration, it offers flexibility and full control over the infrastructure.