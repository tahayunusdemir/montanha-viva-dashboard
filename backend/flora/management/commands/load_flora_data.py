import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from flora.models import Plant, PlantImage
from pathlib import Path

#
# This script is used to load initial flora data into the database.
# It reads a predefined JSON structure, copies plant images from the frontend assets
# to the media directory, and creates Plant and PlantImage objects in the database.
#
# To run this command, execute the following in your terminal:
# python manage.py load_flora_data
#
# The data is structured as a list of dictionaries, where each dictionary
# represents a plant with its scientific name, common names, and other attributes.
# The `image_paths` key contains a list of relative paths to the plant's images.
#
# The script will perform the following actions:
# 1. Check if a plant with the same scientific name already exists in the database.
# 2. If the plant does not exist, it will create a new Plant object.
# 3. For each image path in `image_paths`, it will:
#    a. Construct the full source path to the image in the frontend assets.
#    b. Construct the destination path in the media directory.
#    c. Copy the image file from the source to the destination.
#    d. Create a new PlantImage object and associate it with the new Plant object.
# 4. The script will print a message for each plant that is successfully added.
#
# Note: This script assumes that the frontend and backend directories are in the
# same root directory.
#


PLANT_DATA = [
    {
        "scientific_name": "Arbutus unedo",
        "common_names": "Strawberry tree, common strawberry tree, ervodo, ervedeiro, êrvedo, merodos.",
        "interaction_fauna": "A source of food and shelter for insects and birds.",
        "food_uses": "The fruit can be eaten fresh, in jams and cakes. Its fermentation is used for alcoholic drinks and vinegar.",
        "medicinal_uses": "Diuretic, urinary tract antiseptic, combats diarrhea, diabetes, hypertension and liver diseases. The boiled root of the plant fights juvenile acne and gastrointestinal problems.",
        "ornamental_uses": "Appreciated as an ornamental tree in gardens for its dark green, evergreen foliage and white flowers and red fruits.",
        "traditional_uses": "The leaves and bark contain tannins and are used for tanning leather.",
        "aromatic_uses": None,
        "image_paths": [
            "Arbutusunedo/Arbutusunedo.png",
            "Arbutusunedo/Arbutusunedo2.png",
            "Arbutusunedo/Arbutusunedo3.png",
        ],
    },
    {
        "scientific_name": "Armeria transmontana",
        "common_names": "Divine carnation.",
        "interaction_fauna": "The flowers attract pollinating insects.",
        "food_uses": None,
        "medicinal_uses": None,
        "ornamental_uses": "Often cultivated for its delicate and colourful flowers, which provide an attractive ornamental feature in rock gardens, flower beds or borders.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Armeriatransmontana/Armeriatransmontana.png",
            "Armeriatransmontana/Armeriatransmontana2.png",
            "Armeriatransmontana/Armeriatransmontana3.png",
        ],
    },
    {
        "scientific_name": "Asphodelus macrocarpus",
        "common_names": "Large-fruited forkbeard.",
        "interaction_fauna": "The flowers can attract insects. A source of food and shelter for insects and birds.",
        "food_uses": None,
        "medicinal_uses": None,
        "ornamental_uses": "Cultivated mainly for its attractive flowers, which add a touch of beauty to gardens and landscapes.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Asphodelosmacrocaspus/Asphodelosmacrocaspus.png",
            "Asphodelosmacrocaspus/Asphodelosmacrocaspus2.png",
            "Asphodelosmacrocaspus/Asphodelosmacrocaspus3.png",
        ],
    },
    {
        "scientific_name": "Calluna vulgaris",
        "common_names": "Heather, purple heather, queiró, queiroga, torga, leiva, mongariça, queiró-das-ilhas, rapa, torga-ordinária.",
        "interaction_fauna": "Food source for butterflies and beetles. A source of shelter for birds, lizards and small mammals. Excellent honey plant.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "Antiseptic, diuretic and anti-inflammatory properties. Treatment of digestive problems, urinary tract infections, cystitis, kidney problems, diarrhoea and dyspepsia. Used to wash wounds.",
        "ornamental_uses": "Ideal for ground covers, floral arrangements fresh or dried, due to its durability and beauty, providing colour and texture throughout the year.",
        "traditional_uses": "Brooms, brushes, mattress stuffing and paint production.",
        "aromatic_uses": None,
        "image_paths": [
            "Callunavulgaris/Callunavulgaris.png",
            "Callunavulgaris/Callunavulgaris2.png",
            "Callunavulgaris/Callunavulgaris3.png",
        ],
    },
    {
        "scientific_name": "Cistus psilosepalus",
        "common_names": "Saganho, sanganho.",
        "interaction_fauna": "A source of food and shelter for insects and birds.",
        "food_uses": None,
        "medicinal_uses": None,
        "ornamental_uses": "Ornamental beauty, with showy flowers that vary in colour from white to pink.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Cistuspsilosepalus/Cistuspsilosepalus.png",
            "Cistuspsilosepalus/Cistuspsilosepalus2.png",
            "Cistuspsilosepalus/Cistuspsilosepalus3.png",
        ],
    },
    {
        "scientific_name": "Cistus salviifolius",
        "common_names": "Rock hawk, golden sander, golden sargassum, common ragwort, common sargassum.",
        "interaction_fauna": "The flowers are a source of food for bees and birds. A source of shelter and protection for many insects.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "Anti-inflammatory and antioxidant properties. Infusions of the leaves are used to relieve symptoms of respiratory diseases such as coughs and bronchitis. Ointments, compresses made from the leaves and infusions are applied to wounds to speed up healing and prevent infection.",
        "ornamental_uses": "Used in gardening due to its resistance and attractive aesthetics.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Cistussalviifolius/Cistussalviifolius.png",
            "Cistussalviifolius/Cistussalviifolius2.png",
            "Cistussalviifolius/Cistussalviifolius3.png",
        ],
    },
    {
        "scientific_name": "Cytisus multiflorus",
        "common_names": "White broom, white broom, mayapple.",
        "interaction_fauna": "Source of food and shelter for bees, other insects and birds.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "The infusion of the leaves is diuretic, anti-inflammatory, antihypertensive and antidiabetic.",
        "ornamental_uses": None,
        "traditional_uses": "Brooms and soil phytoremediation.",
        "aromatic_uses": None,
        "image_paths": [
            "Cytisusmultiflorus/Cytisusmultiflorus.png",
            "Cytisusmultiflorus/Cytisusmultiflorus2.png",
            "Cytisusmultiflorus/Cytisusmultiflorus3.png",
        ],
    },
    {
        "scientific_name": "Echinospartum ibericum",
        "common_names": "Boiler, boilermaker.",
        "interaction_fauna": "Attracts pollinating insects. Source of food and shelter for bees, small animals and birds.",
        "food_uses": None,
        "medicinal_uses": "The plant extract is rich in phenolic compounds, with moderate antioxidant activity.",
        "ornamental_uses": None,
        "traditional_uses": "Brooms.",
        "aromatic_uses": "Its flowers give off a pleasant, intense odour of odour during flowering.",
        "image_paths": [
            "Echinospartumibericum/Echinospartumibericum.png",
            "Echinospartumibericum/Echinospartumibericum2.png",
            "Echinospartumibericum/Echinospartumibericum3.png",
        ],
    },
    {
        "scientific_name": "Echium lusitanicum",
        "common_names": "Soajos, suajos.",
        "interaction_fauna": "An important source of food for insects such as bees and butterflies.",
        "food_uses": None,
        "medicinal_uses": None,
        "ornamental_uses": "Appreciated for its beautiful blue flowers, it is often grown as an ornamental plant in gardens and landscapes.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Echiumlusitanicum/Echiumlusitanicum.png",
            "Echiumlusitanicum/Echiumlusitanicum2.png",
            "Echiumlusitanicum/Echiumlusitanicum3.png",
        ],
    },
    {
        "scientific_name": "Erica australis",
        "common_names": "Heather, red heather, red torga, chamise.",
        "interaction_fauna": "Source of food for bees. Honey plant.",
        "food_uses": None,
        "medicinal_uses": "Antioxidant, anti-inflammatory and urinary antiseptic and diuretic properties, acting as a urinary tract disinfectant.",
        "ornamental_uses": "Decorating green spaces.",
        "traditional_uses": "Brooms, brushes, soil phytoremediation, mattress stuffing and paint production.",
        "aromatic_uses": None,
        "image_paths": [
            "Ericaaustralis/Ericaaustralis.png",
            "Ericaaustralis/Ericaaustralis2.png",
            "Ericaaustralis/Ericaaustralis3.png",
        ],
    },
    {
        "scientific_name": "Glandora prostrata",
        "common_names": "Sangrias, sargacinha, sargacinho, sugamel.",
        "interaction_fauna": "Species melifera. The plant offers shelter and resources for a variety of insects.",
        "food_uses": "Used in infusions, the flower is appreciated for its sweet flavour.",
        "medicinal_uses": "Antiseptic properties, it is used to treat infections and inflammations. It is hypotensive, reduces cholesterol levels and used to treat liver problems.",
        "ornamental_uses": "Highly valued in gardening due to its attractive appearance and ground-covering capacity.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Glandoraprostrata/Glandoraprostrata.png",
            "Glandoraprostrata/Glandoraprostrata2.png",
            "Glandoraprostrata/Glandoraprostrata3.png",
        ],
    },
    {
        "scientific_name": "Halimium umbellatum",
        "common_names": "Sargassum weed, Halimicum, Sargasso, Stinging sergeant",
        "interaction_fauna": "Melliferous species. The plant offers shelter and resources for a variety of insects. Some birds may use the plant for shelter or feed on the insects that frequent it.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "Anti-inflammatory and antioxidant properties. Infusions of the leaves and flowers can be used for respiratory problems.",
        "ornamental_uses": "Used in gardening due to its aesthetics and resistance.",
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Halimiumumbellatum/Halimiumumbellatum.png",
            "Halimiumumbellatum/Halimiumumbellatum2.png",
            "Halimiumumbellatum/Halimiumumbellatum3.png",
        ],
    },
    {
        "scientific_name": "Helichrysum stoechas",
        "common_names": "Chapels, marcenilla, everlasting, everlasting-of-the-areas, perpetual-flowered.",
        "interaction_fauna": "Melliferous species. Source of shelter for insects.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "Anti-inflammatory, antimicrobial and antioxidant properties. Infusions of the flowers are used to relieve symptoms of colds, coughs, fever and bronchitis. Ointments and compresses made from the flowers are applied to wounds to speed up healing and prevent infections.",
        "ornamental_uses": "Used in gardening due to its aesthetic appeal and resistance, or in dried flower arrangements.",
        "traditional_uses": None,
        "aromatic_uses": "Essential oil is used in aromatherapy and perfumery due to its pleasant aroma and relaxing and therapeutic properties.",
        "image_paths": [
            "Helichrysumstoechas/Helichrysumstoechas.png",
            "Helichrysumstoechas/Helichrysumstoechas2.png",
            "Helichrysumstoechas/Helichrysumstoechas3.png",
        ],
    },
    {
        "scientific_name": "Lavandula pedunculata",
        "common_names": "Greater lavender, rosemary, cranesbill.",
        "interaction_fauna": "The flowers are a source of nectar and attract pollinating insects such as bees. An excellent plant.",
        "food_uses": "Used in infusions.",
        "medicinal_uses": "Analgesic effect, tonic, it is used to treat the respiratory tract. The essential oil is antioxidant and antimicrobial.",
        "ornamental_uses": "Used in decorations due to its violet-purple tones and its characteristic aroma.",
        "traditional_uses": "The flowers and leaves are used to repel insects from fabrics.",
        "aromatic_uses": "Popular in the production of essential oils, sachets, such as soaps and lotions.",
        "image_paths": [
            "Lavandulapedunculata/Lavandulapedunculata.png",
            "Lavandulapedunculata/Lavandulapedunculata2.png",
            "Lavandulapedunculata/Lavandulapedunculata3.png",
        ],
    },
    {
        "scientific_name": "Umbilicus rupestris",
        "common_names": "Bacelos, bifes, cachilro, chapéus-de-parede, cauxilhos, roofed hats, conchelos, cochilros, copilas, couxilgos, orelha-de-monge, sombreirinho-dos-telhados, umbigo-de-vénus, inhame-de-galatixa, inhame-de-lagartixa, lizard.",
        "interaction_fauna": None,
        "food_uses": "The leaves are eaten raw or cooked and can be used in salads.",
        "medicinal_uses": "The leaves are slightly anaesthetic. The juice and extract of the plant is used to treat kidney pain, swelling and stimulates urine production. Used to treat gout, sciatica, sore throats or scrofula, chilblains and fresh wounds to stop the bleeding and help healing. The leaves are made into a poultice and used to treat haemorrhoids, minor burns and scalds.",
        "ornamental_uses": None,
        "traditional_uses": None,
        "aromatic_uses": None,
        "image_paths": [
            "Umbilicusrupestris/Umbilicusrupestris.png",
            "Umbilicusrupestris/Umbilicusrupestris2.png",
            "Umbilicusrupestris/Umbilicusrupestris3.png",
        ],
    },
]


class Command(BaseCommand):
    help = "Loads initial flora data from a predefined list into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clean",
            action="store_true",
            help="Deletes all existing Plant and PlantImage data before loading new data.",
        )

    def handle(self, *args, **kwargs):
        if kwargs["clean"]:
            self.stdout.write(self.style.WARNING("Deleting all existing flora data..."))
            Plant.objects.all().delete()
            PlantImage.objects.all().delete()
            # Also clean up media folder if needed
            media_flora_path = os.path.join(settings.MEDIA_ROOT, "flora_images")
            if os.path.exists(media_flora_path):
                shutil.rmtree(media_flora_path)
            self.stdout.write(self.style.SUCCESS("All flora data has been deleted."))

        self.stdout.write("Starting to load flora data...")

        # Path to frontend assets, assuming it's mounted at /frontend in the container
        source_assets_path = Path("/frontend/src/assets/flora_images")

        for data in PLANT_DATA:
            self.stdout.write(f"Creating plant: {data['scientific_name']}")

            # Using update_or_create to avoid duplicates and allow rerunning the script
            plant, created = Plant.objects.update_or_create(
                scientific_name=data["scientific_name"],
                defaults={
                    "common_names": data.get("common_names"),
                    "interaction_fauna": data.get("interaction_fauna"),
                    "food_uses": data.get("food_uses"),
                    "medicinal_uses": data.get("medicinal_uses"),
                    "ornamental_uses": data.get("ornamental_uses"),
                    "traditional_uses": data.get("traditional_uses"),
                    "aromatic_uses": data.get("aromatic_uses"),
                },
            )

            if data.get("image_paths"):
                for img_path_str in data["image_paths"]:
                    # Path object for the relative path from the JSON data
                    relative_img_path = Path(img_path_str)

                    # Full path to the source image file in the frontend assets
                    source_file = source_assets_path / relative_img_path

                    # Destination path in the media directory, prefixed with 'flora_images'
                    # This will be the value stored in the ImageField
                    db_image_path = Path("flora_images") / relative_img_path

                    # Full path to the destination file in the media root
                    dest_file_full_path = Path(settings.MEDIA_ROOT) / db_image_path

                    if source_file.exists():
                        try:
                            # Ensure the destination directory exists
                            dest_file_full_path.parent.mkdir(
                                parents=True, exist_ok=True
                            )

                            # Copy the file from source to destination
                            shutil.copy(source_file, dest_file_full_path)

                            # Create the PlantImage object, associating it with the plant.
                            # The 'image' field is the path relative to MEDIA_ROOT.
                            PlantImage.objects.create(
                                plant=plant, image=str(db_image_path)
                            )

                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(
                                    f"  Error copying file {source_file}: {e}"
                                )
                            )
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  Image not found at source: {source_file}"
                            )
                        )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully processed plant "{plant.scientific_name}".'
                )
            )

        self.stdout.write(self.style.SUCCESS("Finished loading all flora data."))
