from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicRouteViewSet

# Router for public, read-only endpoints
router = DefaultRouter()
router.register(r"", PublicRouteViewSet, basename="public-route")

urlpatterns = [
    # Public routes, e.g., /api/routes/
    path("", include(router.urls)),
]
