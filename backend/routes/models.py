from django.db import models

# Create your models here.


class Route(models.Model):
    DIFFICULTY_CHOICES = [
        ("Easy", "Easy"),
        ("Medium", "Medium"),
        ("Hard", "Hard"),
    ]
    ROUTE_TYPE_CHOICES = [
        ("circular", "Circular"),
        ("linear", "Linear"),
    ]

    name = models.CharField(max_length=255)
    distance_km = models.FloatField()
    duration = models.CharField(max_length=50)
    route_type = models.CharField(
        max_length=50, choices=ROUTE_TYPE_CHOICES, default="circular"
    )
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="Medium"
    )
    altitude_min_m = models.IntegerField()
    altitude_max_m = models.IntegerField()
    accumulated_climb_m = models.IntegerField()
    start_point_gps = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    image_card = models.ImageField(
        upload_to="routes/images/cards/", blank=True, null=True
    )
    image_map = models.ImageField(
        upload_to="routes/images/maps/", blank=True, null=True
    )
    gpx_file = models.FileField(upload_to="routes/gpx_files/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PointOfInterest(models.Model):
    route = models.ForeignKey(
        Route, related_name="points_of_interest", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name
