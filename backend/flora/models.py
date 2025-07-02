from django.db import models

# Create your models here.


class Plant(models.Model):
    scientific_name = models.CharField(
        max_length=255, unique=True, help_text="Bilimsel ad, örn: Arbutus unedo"
    )
    common_names = models.CharField(
        max_length=500,
        help_text="Yaygın adlar, virgülle ayrılmış, örn: Kocayemiş, Sandal Ağacı",
    )
    interaction_fauna = models.TextField(
        blank=True,
        null=True,
        help_text="Böcekler ve kuşlar için besin ve barınak kaynağıdır.",
    )

    # Opsiyonel kullanım alanları
    food_uses = models.TextField(blank=True, null=True)
    medicinal_uses = models.TextField(blank=True, null=True)
    ornamental_uses = models.TextField(blank=True, null=True)
    traditional_uses = models.TextField(blank=True, null=True)
    aromatic_uses = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.scientific_name


class PlantImage(models.Model):
    plant = models.ForeignKey(
        Plant, related_name="images", on_delete=models.CASCADE, null=True, blank=True
    )
    image = models.ImageField(upload_to="flora_images/")

    def __str__(self):
        return f"Image for {self.plant.scientific_name if self.plant else 'Unassigned'}"
