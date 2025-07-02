# Stage 1: builder - Compiles dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Önce sadece bağımlılık dosyalarını kopyala
COPY requirements.txt .

# Bu katmanı önbelleğe almak için bağımlılıkları kur
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


# Stage 2: final - The actual application image
FROM python:3.11-slim

WORKDIR /app

# Derlenmiş wheel'leri builder aşamasından kopyala
COPY --from=builder /app/wheels /app/wheels

# Wheel'lerden bağımlılıkları kur
RUN pip install --no-cache /app/wheels/*

# Geri kalan uygulama kodunu kopyala
COPY . .

# Gunicorn'u çalıştırmak için komutu ayarla
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
