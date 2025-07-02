from django.db import models

# Create your models here.


class Station(models.Model):
    # station_id is the unique identifier from the IoT device.
    station_id = models.CharField(primary_key=True, max_length=100, unique=True)
    name = models.CharField(max_length=255)
    location = models.CharField(
        max_length=255, blank=True, help_text="e.g., 40.7128, -74.0060"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Measurement(models.Model):
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="measurements"
    )
    measurement_type = models.CharField(max_length=100)
    value = models.FloatField()
    recorded_at = models.DateTimeField(
        help_text="Timestamp when the measurement was taken"
    )

    class Meta:
        ordering = ["-recorded_at"]
