import os
import shutil
from django.core.files import File
from django.core.management.base import BaseCommand
from django.conf import settings
from routes.models import Route
from pathlib import Path

# Sample data for the routes.
ROUTE_DATA = [
    {
        "id": 1,
        "name": "Carvalhal Route",
        "distance_km": 12.9,
        "duration": "4 h 30 min",
        "route_type": "circular",
        "difficulty": "Hard",
        "altitude_min_m": 508,
        "altitude_max_m": 997,
        "accumulated_climb_m": 695,
        "start_point_gps": "40º7'14.40N / 7º32'38.08W",
        "description": "A challenging circular route that takes you through the Carvalhal site, past old watermills, and up to the Senhora da Gardunha viewpoint, offering a rich experience of local nature and heritage.",
        "points_of_interest": [
            "SOUTO DA CASA",
            "WATERMILLS, MILLS AND WATER CHANNELS",
            "SENHORA DA GARDUNHA",
            "CARVALHAL SITE",
            "AQUATIC FLORA",
            "RIVER FAUNA",
        ],
        "image_card_path": "routes_image/cartao_Carvalhal.png",
        "image_map_path": "routes_image/percurso_Carvalhal.png",
        "gpx_file_path": None,
    },
    {
        "id": 2,
        "name": "Chestnut Trees Route",
        "distance_km": 13.0,
        "duration": "4 h 00 min",
        "route_type": "circular",
        "difficulty": "Medium",
        "altitude_min_m": 497,
        "altitude_max_m": 825,
        "accumulated_climb_m": 591,
        "start_point_gps": None,
        "description": "Explore the agricultural heart of the region on this moderate circular trail, featuring beautiful cherry orchards and traditional chestnut groves between the villages of Donas and Alcongosta.",
        "points_of_interest": [
            "DONAS",
            "CHERRY ORCHARDS",
            "WATER CHANNELS AND MILLS",
            "CHESTNUT GROVES",
            "ALCONGOSTA",
        ],
        "image_card_path": "routes_image/cartao_Castanheiros.png",
        "image_map_path": "routes_image/percurso_Castanheiros.png",
        "gpx_file_path": None,
    },
    {
        "id": 3,
        "name": "Castelo Novo Historical Path",
        "distance_km": 2.7,
        "duration": "1h 54min",
        "route_type": "circular",
        "difficulty": "Easy",
        "altitude_min_m": 582,
        "altitude_max_m": 664,
        "accumulated_climb_m": 126,
        "start_point_gps": None,
        "description": "A short and easy walk through the charming historical village of Castelo Novo, perfect for a family outing to discover local history and architecture.",
        "points_of_interest": [],
        "image_card_path": "routes_image/cartao_casteloNovo.png",
        "image_map_path": "routes_image/percurso_CasteloNovo.png",
        "gpx_file_path": None,
    },
    {
        "id": 4,
        "name": "Cherry Route",
        "distance_km": 9.9,
        "duration": "3 h 30 min",
        "route_type": "circular",
        "difficulty": "Medium",
        "altitude_min_m": 580,
        "altitude_max_m": 889,
        "accumulated_climb_m": 534,
        "start_point_gps": "40º7'4.87N / 7º29'5.81W",
        "description": "A delightful journey through the famous cherry orchards of Alcongosta. This moderate route offers stunning viewpoints and a glimpse into local traditions like basketry.",
        "points_of_interest": [
            "ALCONGOSTA",
            "CHERRY ORCHARDS",
            "BASKETRY AND ESPARTO",
            "VIEWPOINTS",
        ],
        "image_card_path": "routes_image/cartao_Cereja.png",
        "image_map_path": "routes_image/percurso_Cereja.png",
        "gpx_file_path": None,
    },
    {
        "id": 5,
        "name": "Marateca Route",
        "distance_km": 14.0,
        "duration": "3 h 30 min",
        "route_type": "circular",
        "difficulty": "Medium",
        "altitude_min_m": 375,
        "altitude_max_m": 450,
        "accumulated_climb_m": 100,
        "start_point_gps": "40º0'50.92N / 7º29'18.38W",
        "description": "An easy and pleasant walk around the Santa Águeda reservoir, starting from Soalheira. This route is ideal for birdwatching and enjoying the peaceful landscape of farms and pastures.",
        "points_of_interest": [
            "SOALHEIRA VILLAGE",
            "FARMS AND PASTURE FIELDS",
            "SANTA ÁGUEDA RESERVOIR",
            "BIRDFAUNA HABITATS",
            "CHEESE FACTORIES",
        ],
        "image_card_path": "routes_image/cartao_Marateca.png",
        "image_map_path": "routes_image/percurso_Marateca.png",
        "gpx_file_path": None,
    },
    {
        "id": 6,
        "name": "Pedra d'Hera Route",
        "distance_km": 6.7,
        "duration": "1 h 50 min",
        "route_type": "circular",
        "difficulty": "Easy",
        "altitude_min_m": 507,
        "altitude_max_m": 824,
        "accumulated_climb_m": 318,
        "start_point_gps": "40º8'15.31N / 7º30'1.54W",
        "description": "Discover historical and natural gems on this easy route near Fundão, featuring the ancient São Brás castro, a serene beech forest, and the impressive Pedra d'Hera viewpoint.",
        "points_of_interest": [
            "OLD FUNDÃO AREA",
            "CHERRY ORCHARDS",
            "SÃO BRÁS CASTRO",
            "BEECH FOREST",
            "PEDRA D'HERA AND VIEWPOINT",
            "CONVENT AND CHAPEL OF NOSSA SENHORA DO SEIXO",
            "CONVENT PARK",
        ],
        "image_card_path": "routes_image/cartao_PedraHera.png",
        "image_map_path": "routes_image/percurso_PedraHera.png",
        "gpx_file_path": None,
    },
    {
        "id": 7,
        "name": "Portela da Gardunha Route",
        "distance_km": 12.8,
        "duration": "3 h 40 min",
        "route_type": "circular",
        "difficulty": "Hard",
        "altitude_min_m": 523,
        "altitude_max_m": 750,
        "accumulated_climb_m": 472,
        "start_point_gps": "40º7'55.07N / 7º26'21.46W",
        "description": "A demanding but rewarding trail that connects the villages of Alcaide and Vale de Prazeres, offering a deep dive into the region's rich biodiversity and varied landscapes.",
        "points_of_interest": [
            "ALCAIDE",
            "PORTELA DA GARDUNHA",
            "BIODIVERSITY",
            "VALE DE PRAZERES",
        ],
        "image_card_path": "routes_image/cartao_Portela.png",
        "image_map_path": "routes_image/percurso_Portela.png",
        "gpx_file_path": None,
    },
]


class Command(BaseCommand):
    help = "Loads initial routes data from a predefined list into the database."

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to load routes data...")

        project_root = Path(settings.BASE_DIR).parent
        source_assets_path = project_root / "frontend" / "src" / "assets"

        for data in ROUTE_DATA:
            self.stdout.write(f"Processing route: {data['name']}")

            # Convert list of POIs to a comma-separated string
            poi_string = None
            if data.get("points_of_interest"):
                poi_string = ", ".join(data["points_of_interest"])

            # Create the Route object
            route, created = Route.objects.update_or_create(
                name=data["name"],
                defaults={
                    "distance_km": data["distance_km"],
                    "duration": data["duration"],
                    "route_type": data["route_type"],
                    "difficulty": data["difficulty"],
                    "altitude_min_m": data["altitude_min_m"],
                    "altitude_max_m": data["altitude_max_m"],
                    "accumulated_climb_m": data["accumulated_climb_m"],
                    "start_point_gps": data.get("start_point_gps"),
                    "description": data["description"],
                    "points_of_interest": poi_string,
                },
            )

            # Handle image and gpx files
            for field, source_path_key in [
                ("image_card", "image_card_path"),
                ("image_map", "image_map_path"),
                ("gpx_file", "gpx_file_path"),
            ]:
                source_path_str = data.get(source_path_key)
                if source_path_str:
                    source_file = source_assets_path / source_path_str

                    if source_file.exists():
                        # The destination path will be relative to MEDIA_ROOT
                        dest_folder = (
                            "routes_images" if "image" in field else "gpx_files"
                        )
                        dest_folder_path = Path(settings.MEDIA_ROOT) / dest_folder
                        dest_folder_path.mkdir(parents=True, exist_ok=True)

                        db_file_path = Path(dest_folder) / source_file.name
                        dest_file_full_path = dest_folder_path / source_file.name

                        try:
                            shutil.copy(source_file, dest_file_full_path)

                            # Assign the path to the model field
                            setattr(route, field, str(db_file_path))

                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(
                                    f"  Error copying file {source_file}: {e}"
                                )
                            )
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  File not found at source: {source_file}"
                            )
                        )

            route.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully processed route "{route.name}".')
            )

        self.stdout.write(self.style.SUCCESS("Finished loading all route data."))
