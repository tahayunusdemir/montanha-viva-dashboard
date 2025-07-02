from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicRouteViewSet, AdminRouteViewSet

# Router for public, read-only endpoints
public_router = DefaultRouter()
public_router.register(r"routes", PublicRouteViewSet, basename="public-route")

# Router for admin CRUD endpoints
admin_router = DefaultRouter()
admin_router.register(r"routes", AdminRouteViewSet, basename="admin-route")


urlpatterns = [
    # Public routes, e.g., /api/routes/
    path("", include(public_router.urls)),
    # Admin routes, e.g., /api/routes/admin/
    path("admin/", include(admin_router.urls)),
]
