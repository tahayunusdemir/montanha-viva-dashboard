# Generated by Django 5.2.3 on 2025-07-01 22:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Station",
            fields=[
                (
                    "station_id",
                    models.CharField(
                        max_length=100, primary_key=True, serialize=False, unique=True
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                (
                    "location",
                    models.CharField(
                        blank=True, help_text="Ex: 40.7128, -74.0060", max_length=255
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Measurement",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("measurement_type", models.CharField(max_length=100)),
                ("value", models.FloatField()),
                (
                    "recorded_at",
                    models.DateTimeField(
                        help_text="Timestamp when the measurement was taken"
                    ),
                ),
                (
                    "station",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="measurements",
                        to="stations.station",
                    ),
                ),
            ],
            options={
                "ordering": ["-recorded_at"],
            },
        ),
    ]
