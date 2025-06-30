# Backend Development Roadmap (From Scratch to Production)

This document outlines the steps to set up, develop, and configure the backend for the Montanha Viva project from scratch using Django, Django REST Framework, and PostgreSQL. Instead of code blocks, the logic of the files and code is explained textually.

## 1. Project Setup (Python + Django)

We will use Python and Django for a robust and secure backend infrastructure.

**Requirements:**

- [Python](https://www.python.org/downloads/) (version 3.9+)
- `pip` (Python package manager)

**Steps:**

1.  **Create Project Folder:**

    ```bash
    mkdir backend
    cd backend
    ```

2.  **Create and Activate Virtual Environment:**
    A virtual environment isolates project dependencies from the system-wide Python packages.

    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

    You should see `(venv)` at the beginning of your terminal command line.

3.  **Install Required Packages:**
    Let's install all the backend libraries specified in `TechStack.md`.

    ```bash
    pip install django djangorestframework psycopg2-binary django-environ djangorestframework-simplejwt django-cors-headers gunicorn
    ```

    - `gunicorn`: A WSGI server for the production environment. The configuration and use of this server are detailed in the "Deployment" process in the `devops-guide.md` document.

4.  **Freeze Dependencies:**
    Saving the project's dependencies to a `requirements.txt` file allows the project to be easily set up in another environment.

    ```bash
    pip freeze > requirements.txt
    ```

5.  **Create Django Project and App:**

    ```bash
    # Creates the project in the current directory (the '.' is important)
    django-admin startproject core .

    # We are creating the app that will host our API endpoints
    python manage.py startapp api
    ```

    > **Note:** The `startapp` command creates the `api` folder but does not include a `urls.py` file within it. We will create this file manually in later steps.

## 2. Basic Configurations (`core/settings.py`)

Our project's basic settings are managed through the `core/settings.py` file. Using the `django-environ` library, sensitive information (passwords, API keys) is securely read from a `.env` file outside the code.

The main configurations made in the `settings.py` file are as follows:

- **App Registration:** New applications like `rest_framework`, `corsheaders`, `rest_framework_simplejwt`, and our created `api` app are added to the `INSTALLED_APPS` list. This allows Django to recognize these applications.
- **Middleware Registration:** `corsheaders.middleware.CorsMiddleware` is added to the `MIDDLEWARE` list. This manages the CORS (Cross-Origin Resource Sharing) headers necessary for the server to allow requests from the frontend (from a different origin).
- **Database:** The `DATABASES` setting defines how to connect to the PostgreSQL database using the `DATABASE_URL` variable read from the `.env` file.
- **CORS Permissions:** The `CORS_ALLOWED_ORIGINS` list specifies which frontend origins can make requests to the backend (e.g., `http://localhost:5173`).
- **DRF and JWT:** The `REST_FRAMEWORK` dictionary defines the default settings for Django REST Framework. Here, it specifies that `JWTAuthentication` will be used as the authentication method across the API and that by default, all endpoints will be protected (`IsAuthenticated`). The `SIMPLE_JWT` dictionary sets the validity periods for the tokens.
- **URL Configuration:** The `ROOT_URLCONF` setting specifies that the project's main URL routing file is `core.urls`.
- **Advanced Password Validation:** Django provides built-in validators that enforce certain rules for user passwords. The `AUTH_PASSWORD_VALIDATORS` list in `settings.py` defines these rules (minimum length, numeric characters, etc.). This setting should be left as default or strengthened as needed to enhance project security.

### Configuring Main URLs (`core/urls.py`)

The project's main `urls.py` file (e.g., `core/urls.py`) acts like a traffic cop, directing incoming requests to the correct application.

- Requests to `/admin/` are directed to Django's admin panel.
- All requests starting with `/api/` are delegated to our `api` app's own `urls.py` file using the `include` function. This keeps the project modular.
- The paths `/api/token/` and `/api/token/refresh/` are linked to the ready-made views of `djangorestframework-simplejwt`. These two endpoints handle user login (getting a token in exchange for a username and password) and refreshing an existing token, respectively.

## 3. Creating the `.env` File

The `.env` file created in the project's root directory stores sensitive configuration information. This file contains variables such as `SECRET_KEY`, `DEBUG` mode (`True` for development, `False` for production), allowed hosts (`ALLOWED_HOSTS`), and most importantly, `DATABASE_URL`. `DATABASE_URL` is a standard connection string that includes the database type, username, password, host, port, and database name. **This file should never be added to version control (Git).**

To specify which environment variables new developers will need, it is best practice to create a `.env.example` file in the project's root directory with content like `SECRET_KEY=` and `DATABASE_URL=` and add it to Git.

## 4. Creating API Endpoints

We will create the API endpoints that the frontend will use to consume data and manage users.

> **Note for Long-Term Projects: Custom User Model**
> This guide uses Django's built-in `User` model for a quick start. This is sufficient for many projects. However, if you anticipate that the project may expand in the future (e.g., needing to add new fields like date of birth or a profile picture to the user profile), the best practice is to create a **Custom User Model** inheriting from `AbstractUser` at the very beginning of the project. Taking this step at the start of the project eliminates the need for complex database changes later. For simplicity, this guide proceeds with the built-in model.

### a. User Registration (Sign-up) Endpoint

We need to create a public endpoint for users to register with their first name, last name, email, and password.

#### Creating the Serializer (`api/serializers.py`)

First, we define a serializer to validate the incoming data and create a new user. `UserRegistrationSerializer` is added to the `api/serializers.py` file. The key logical adjustments in this serializer are:

- **Required Fields:** The `first_name` and `last_name` fields are made mandatory to prevent them from being sent empty.
- **Password Validation:** The most significant improvement is adding custom validation to the password field. This validation enforces Django's built-in, strong password security rules (`AUTH_PASSWORD_VALIDATORS` from `settings.py`) for every new password coming through the API. If a user submits a weak password like "123", the serializer will reject it, and the API will return a clear error message explaining why it's invalid (e.g., `"This password is too common."`). This significantly enhances the application's overall security.
- **User Creation:** The serializer's `create` method automatically assigns the `email` field to the `username` field in Django's `User` model and ensures the password is securely hashed and saved to the database using the `set_password` method.

#### Creating the View (`api/views.py`)

Next, in `api/views.py`, we create the `UserRegistrationView` that uses this serializer. This view extends its standard behavior to provide the efficient flow specified in `frontend-guide.md`:

- **Public Access:** The view is configured as a public, non-authenticated endpoint with the setting `permission_classes = [AllowAny]`.
- **Token Generation:** Unlike a standard `CreateAPIView`, the `create` method of this view is customized. After the serializer validates the incoming data and successfully creates the new user, the process doesn't stop. It immediately generates an `access` and a `refresh` token for this new user using the `djangorestframework-simplejwt` library.
- **Enriched Response:** Finally, these generated tokens are added to the response, which contains the standard user information. This way, when the frontend receives a `201 Created` response, it not only knows the user has been created but also obtains the necessary tokens to log into the application with a single API call. This eliminates the need to make an extra login request after registration.

> **API Error Handling:** With this structure, when a user tries to register with an existing email, Django REST Framework automatically returns a `400 Bad Request` status code with a structured error message like `{"email": ["This email address is already in use."]}`. Similarly, if the password is not complex enough, the validation in the serializer will result in an error like `{"password": ["This password is too common."]}`. The frontend can use this standard error format to clearly show the user which field is invalid and why.

#### Configuring URLs (`api/urls.py`)

Finally, we add the `/register/` path to the `api` app's `urls.py` file, linking it to the `UserRegistrationView`.

```python
# api/urls.py
from django.urls import path
from .views import UserRegistrationView #... and other views

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    # ... other urls
]
```

> **Note:** For the login process, the frontend should send a request to the `/api/token/` endpoint, putting the user's email into the `username` field. This is because Django's default `User` model expects a `username` for authentication, and we automatically assign the user's email address to this `username` field during registration. This simplifies the backend implementation.

### b. Sample Data Endpoints (Public & Protected)

Let's create two simple endpoints for the frontend to fetch data: one public and one accessible only to logged-in users.

#### Model, Admin, and Migration

These steps are the same as in a "Hello, World" example. A `Message` model is created to store messages in the database, registered in the admin panel, and applied to the database with the `makemigrations`/`migrate` commands.

#### Creating the Serializer (`api/serializers.py`)

The `MessageSerializer` is used to convert data from the `Message` model into JSON format, and this part is also the same as the previous example.

#### Creating Views (`api/views.py`)

Two separate views are created in `api/views.py`:

- **`PublicDataView`:** This view returns public data. Thanks to the `permission_classes = [AllowAny]` setting, no authentication is required to access this endpoint. It fetches or creates a public message from the database.
- **`ProtectedDataView`:** This view returns protected data. The `permission_classes = [IsAuthenticated]` setting specifies that this endpoint can only be accessed with a valid JWT (i.e., by a logged-in user). If the request lacks a valid token, DRF automatically returns a `401 Unauthorized` error. This view can return a message specific to that user from the database or provide a generic message like "This is protected data."

#### Configuring URLs (`api/urls.py`)

In the `urls.py` file within the `api` folder, the created views are linked to URLs. For example, the `public-data/` path is directed to `PublicDataView`, and the `protected-data/` path is directed to `ProtectedDataView`.

### c. User Information Endpoint (`/api/users/me/`)

To display a welcome message like "Hello, [First Name] [Last Name]" on the dashboard, the frontend needs an endpoint to securely fetch the logged-in user's information.

#### Creating the Serializer (`api/serializers.py`)

First, we create a new serializer to safely expose non-sensitive user data (excluding fields like the password).

```python
# api/serializers.py

# ... after UserRegistrationSerializer ...

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')
```

#### Creating the View (`api/views.py`)

Next, we create a view that uses this serializer to return only the authenticated user's own information. DRF's `RetrieveAPIView` is perfect for this. The `IsAuthenticated` permission ensures that this endpoint can only be accessed with a valid token.

```python
# api/views.py
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
# ... other imports ...

# ... other views ...

class UserProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
```

#### Configuring URLs (`api/urls.py`)

Finally, we add this new view to our `api` app's URLs.

```python
# api/urls.py
from .views import UserProfileView # ... and other views

urlpatterns = [
    # ... other urls
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
]
```

## 5. Superuser and Testing

1.  **Create a Superuser:**
    An admin account is created to access the Django admin panel (`/admin`) and for testing purposes.

    ```bash
    python manage.py createsuperuser
    ```

    The created username and password will be used to test the `/api/token/` endpoint.

2.  **Test the API Endpoints:**
    Using an API client (like Postman, Insomnia, etc.), you can test the following endpoints:
    - `POST /api/register/`: Send `first_name`, `last_name`, `email`, and `password` to create a new user. You should receive a `201 Created` response on success.
    - `POST /api/token/`: Send the `email` (in the `username` field) and `password` of a registered user to get `access` and `refresh` tokens.
    - `GET /api/users/me/`: Add the `access` token to the `Authorization: Bearer <token>` header and make a request to this endpoint. You should receive the logged-in user's information (`id`, `first_name`, `last_name`, `email`).

3.  **Run the Development Server:**
    ```bash
    python manage.py runserver
    ```
    Once the server is running, you can use an API client (like Postman) to send a POST request to `http://127.0.0.1:8000/api/token/` with the superuser's `username` and `password` to get `access` and `refresh` tokens.

## 6. Adding Tests (Pytest)

Writing tests is crucial to ensure the project's reliability.

1.  **Install Required Packages:**
    ```bash
    pip install pytest pytest-django
    ```
2.  **Pytest Configuration:** A file named `pytest.ini` is created in the project's root directory. This file specifies the location of the Django settings module (`core.settings`). This allows `pytest` to recognize the project's Django configuration when running tests.

3.  **Writing Sample Tests (`api/tests.py`):**
    We will use `pytest`'s fixtures and simple `assert` statements instead of Django's standard `TestCase`.
    - **Successful User Registration Test:**
      - A POST request is sent to the `/api/register/` endpoint with a valid `first_name`, `last_name`, `email`, and a **strong password**.
      - It is asserted that the response's HTTP status code is `201 Created`.
      - It is checked that the response body contains a key named `tokens`, and under this key, there are `access` and `refresh` tokens.
      - It is asserted that the `User` count in the database has increased by 1.

    - **Failed Registration Tests:**
      - **Existing Email Test:** Another POST request is sent to the `/api/register/` endpoint with the same email address used in the previous test. It is asserted that the response status code is `400 Bad Request`.
      - **Weak Password Test:** A POST request is sent to the `/api/register/` endpoint with valid information but a password that does not comply with the rules in `settings.py` (e.g., "123"). It is asserted that the response status code is `400 Bad Request` and that the response body contains an error message pointing to the `password` field.

    - **Protected Endpoint Access Tests:**
      - **Successful Access (Authenticated):**
        1.  First, a user is created for the test.
        2.  An `access` token is obtained by sending a POST request to the `/api/token/` endpoint with the user's credentials.
        3.  This `access` token is added to the `Authorization: Bearer <token>` header, and a GET request is made to the `/api/users/me/` endpoint.
        4.  It is asserted that the response status code is `200 OK` and that the response data belongs to the correct user (e.g., the email address matches).
      - **Failed Access (Unauthenticated):**
        - A GET request is sent to the `/api/users/me/` endpoint without an `Authorization` header.
        - It is asserted that the response status code is `401 Unauthorized`.

4.  **Running the Tests:**
    Simply run the `pytest` command in the terminal from the project's root directory. `pytest` will automatically find and run all files and functions starting with `test_`.

### Project Setup

1.  **Environment:** Create a Python virtual environment (`venv`) and activate it.
2.  **Dependencies:** Install packages from `requirements.txt` using `pip install -r requirements.txt`. Key packages include `django`, `djangorestframework`, and `djangorestframework-simplejwt`.
3.  **Project Structure:** The project follows a modular, feature-based app structure. The `core` app handles project-wide settings and URL routing. Business logic is separated into distinct apps (e.g., `users` for authentication and profiles, `stations` for station-related data). New features should be developed in new, dedicated apps to maintain modularity.

### Configuration

- **`CORS_ALLOWED_ORIGINS`**: Specifies the frontend URL (`http://localhost:5173`).
- **`AUTH_PASSWORD_VALIDATORS`**: Enforces strong password policies, which are used in the registration serializer.

### API Endpoint Creation

The general pattern is **Serializer → View → URL**. These components are created within each feature-specific app (e.g., `users/serializers.py`, `users/views.py`, `users/urls.py`). The main `core/urls.py` then includes the URL configurations from each app, typically under a common `/api/` prefix.

1.  **Serializer (`[app_name]/serializers.py`):** Defines how model data is converted to JSON and handles validation.
2.  **View (`[app_name]/views.py`):** Handles the request/response logic, using the serializer. Permissions (`AllowAny`, `IsAuthenticated`) are set here.
3.  **URL (`[app_name]/urls.py`):** Maps a URL path to its corresponding view within the app.

A key implementation is the **User Registration Endpoint**:
