# Stage 1: builder - Compiles dependencies
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Copy requirements and build wheels
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


# Stage 2: final - The actual application image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy compiled wheels from builder stage
COPY --from=builder /app/wheels /app/wheels

# Install dependencies from wheels
RUN pip install --no-cache /app/wheels/*

# Copy application code
COPY . .

# Set the command to run Gunicorn
# Note: "core.wsgi:application" is a placeholder until the Django project is created.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
