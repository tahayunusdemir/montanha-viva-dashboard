from django.contrib import admin
from .models import Plant, PlantImage


class PlantImageInline(admin.TabularInline):
    model = PlantImage
    extra = 1  # Number of extra forms to display


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("scientific_name", "common_names", "created_at")
    search_fields = ("scientific_name", "common_names")
    inlines = [PlantImageInline]


@admin.register(PlantImage)
class PlantImageAdmin(admin.ModelAdmin):
    list_display = ("id", "plant", "image")
    list_filter = ("plant",)
    search_fields = ("plant__scientific_name",)
