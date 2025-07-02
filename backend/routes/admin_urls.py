from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminRouteViewSet

# Router for admin CRUD endpoints
router = DefaultRouter()
router.register(r"", AdminRouteViewSet, basename="admin-route")

urlpatterns = [
    path("", include(router.urls)),
] 