from django.db import models

# Create your models here.


class Plant(models.Model):
    """
    Model to store detailed information about a plant.
    """

    scientific_name = models.CharField(
        max_length=255, unique=True, help_text="Scientific name of the plant."
    )
    common_names = models.TextField(
        blank=True, help_text="Common names, separated by commas."
    )

    # Using JSONField to store a list of strings which are paths to images.
    # This avoids creating a separate Image model for simplicity, as discussed.
    images = models.JSONField(
        default=list, help_text="List of paths to images for the plant."
    )

    # Text fields for descriptive information.
    interaction_fauna = models.TextField(
        blank=True, null=True, help_text="Description of interaction with fauna."
    )
    food_uses = models.TextField(
        blank=True, null=True, help_text="Description of food uses."
    )
    medicinal_uses = models.TextField(
        blank=True, null=True, help_text="Description of medicinal uses."
    )
    ornamental_uses = models.TextField(
        blank=True, null=True, help_text="Description of ornamental uses."
    )
    traditional_uses = models.TextField(
        blank=True, null=True, help_text="Description of traditional uses."
    )
    aromatic_uses = models.TextField(
        blank=True, null=True, help_text="Description of aromatic uses."
    )

    # JSONField to store boolean flags for quick filtering.
    uses_flags = models.JSONField(
        default=dict,
        help_text="Boolean flags for various uses (e.g., {'medicinal': true, 'food': false}).",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.scientific_name

    class Meta:
        ordering = ["scientific_name"]
        verbose_name = "Plant"
        verbose_name_plural = "Plants"
