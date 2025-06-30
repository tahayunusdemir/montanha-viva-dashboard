from django.contrib import admin
from .models import Route, PointOfInterest


class PointOfInterestInline(admin.StackedInline):
    model = PointOfInterest
    extra = 1


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("name", "difficulty", "distance_km", "duration", "route_type")
    list_filter = ("difficulty", "route_type")
    search_fields = ("name", "description")
    inlines = [PointOfInterestInline]


@admin.register(PointOfInterest)
class PointOfInterestAdmin(admin.ModelAdmin):
    list_display = ("name", "route")
    list_filter = ("route",)
    search_fields = ("name",)
