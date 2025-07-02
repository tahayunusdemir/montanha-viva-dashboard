from django.db import models

# Create your models here.


class Route(models.Model):
    ROUTE_TYPE_CHOICES = [("circular", "Circular"), ("linear", "Linear")]
    DIFFICULTY_CHOICES = [("Easy", "Easy"), ("Medium", "Medium"), ("Hard", "Hard")]

    name = models.CharField(max_length=255, unique=True)
    distance_km = models.FloatField(help_text="Distance in kilometers")
    duration = models.CharField(max_length=50, help_text="Duration, e.g., 4 h 30 min")
    route_type = models.CharField(max_length=10, choices=ROUTE_TYPE_CHOICES)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    altitude_min_m = models.IntegerField(help_text="Minimum altitude in meters")
    altitude_max_m = models.IntegerField(help_text="Maximum altitude in meters")
    accumulated_climb_m = models.IntegerField(help_text="Accumulated climb in meters")
    start_point_gps = models.CharField(
        max_length=100, blank=True, null=True, help_text="Start point GPS coordinates"
    )
    description = models.TextField()

    points_of_interest = models.TextField(
        blank=True, null=True, help_text="Comma-separated list of points of interest."
    )

    image_card = models.ImageField(
        upload_to="routes_images/", help_text="Image for the route card"
    )
    image_map = models.ImageField(
        upload_to="routes_images/", help_text="Image of the route map"
    )
    gpx_file = models.FileField(
        upload_to="gpx_files/",
        blank=True,
        null=True,
        help_text="GPX file for the route",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
