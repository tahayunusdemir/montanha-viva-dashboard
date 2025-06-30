from django.contrib import admin
from django.utils.html import format_html
from .models import Plant


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Plant model.
    """

    list_display = ("scientific_name", "common_names", "created_at")
    search_fields = ("scientific_name", "common_names")
    readonly_fields = ("image_gallery",)

    fieldsets = (
        (None, {"fields": ("scientific_name", "common_names", "uses_flags")}),
        ("Images", {"fields": ("images", "image_gallery")}),
        (
            "Detailed Information",
            {
                "classes": ("collapse",),
                "fields": (
                    "interaction_fauna",
                    "food_uses",
                    "medicinal_uses",
                    "ornamental_uses",
                    "traditional_uses",
                    "aromatic_uses",
                ),
            },
        ),
    )

    def image_gallery(self, obj):
        """
        Displays a gallery of images from the 'images' JSONField,
        which contains a list of image paths.
        """
        if obj.images:
            html = ""
            for image_path in obj.images:
                # Assuming images are served under /media/
                # Update the path as per your static/media file configuration
                html += f'<img src="/media/{image_path}" width="150" height="150" style="object-fit: cover; margin-right: 10px;" />'
            return format_html(html)
        return "No images."

    image_gallery.short_description = "Image Gallery"
