import csv
from datetime import datetime, timezone
from django.core.management.base import BaseCommand, CommandParser
from stations.models import Station, Measurement


class Command(BaseCommand):
    help = "Load station data from a CSV file into the database"

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("csv_file_path", type=str, help="The path to the CSV file.")

    def handle(self, *args, **options):
        csv_file_path = options["csv_file_path"]
        self.stdout.write(
            self.style.SUCCESS(f"Starting to load data from {csv_file_path}")
        )

        # data_example.csv'deki sütun adları.
        measurement_columns = [
            "max_wind_speed",
            "mean_wind_speed",
            "pluviometer",
            "atmospheric",
            "temperature",
            "humidity",
            "wind_direction",
            "humidity_solo",
        ]

        measurements_to_create = []
        stations_cache = {}

        try:
            with open(csv_file_path, mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for i, row in enumerate(reader):
                    station_id = row.get("DeviceID")
                    if not station_id:
                        self.stdout.write(
                            self.style.WARNING(
                                f"Skipping row {i + 1}: Missing DeviceID"
                            )
                        )
                        continue

                    if station_id not in stations_cache:
                        station, created = Station.objects.get_or_create(
                            station_id=station_id,
                            defaults={"name": f"Station {station_id}"},
                        )
                        stations_cache[station_id] = station
                        if created:
                            self.stdout.write(
                                self.style.SUCCESS(f"Station {station_id} created.")
                            )

                    station = stations_cache[station_id]

                    try:
                        # Unix timestamp'i datetime nesnesine çevir.
                        unix_timestamp = int(row["Timestamp"])
                        aware_dt = datetime.fromtimestamp(
                            unix_timestamp, tz=timezone.utc
                        )
                    except (ValueError, TypeError):
                        self.stdout.write(
                            self.style.WARNING(
                                f'Skipping row {i + 1}: Invalid timestamp format for value "{row.get("Timestamp")}"'
                            )
                        )
                        continue

                    for col_name in measurement_columns:
                        value_str = row.get(col_name)
                        if value_str is not None and value_str != "":
                            try:
                                value = float(value_str)
                                measurements_to_create.append(
                                    Measurement(
                                        station=station,
                                        measurement_type=col_name,
                                        value=value,
                                        recorded_at=aware_dt,
                                    )
                                )
                            except (ValueError, TypeError):
                                self.stdout.write(
                                    self.style.WARNING(
                                        f'Skipping measurement {col_name} in row {i + 1}: Invalid value "{value_str}"'
                                    )
                                )

                    if len(measurements_to_create) > 1000:
                        Measurement.objects.bulk_create(measurements_to_create)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Bulk created {len(measurements_to_create)} measurements."
                            )
                        )
                        measurements_to_create = []

                if measurements_to_create:
                    Measurement.objects.bulk_create(measurements_to_create)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Bulk created remaining {len(measurements_to_create)} measurements."
                        )
                    )

            self.stdout.write(self.style.SUCCESS("Successfully loaded all data."))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {csv_file_path}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))
