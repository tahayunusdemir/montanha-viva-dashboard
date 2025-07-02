# 🌺 Flora & Bitki Ansiklopedisi – Teknik Plan

## 🌐 Genel Bakış

### 🎯 Hedef

Bu döküman, projenin bitki ansiklopedisi (Flora) özelliğinin oluşturulması için gereken tam yığın (full-stack) teknik planı detaylandırmaktadır. Amaç, admin kullanıcılarının bitki veritabanını yönetebileceği ve son kullanıcıların bu bitkileri modern ve kullanıcı dostu bir arayüzde keşfedebileceği bir sistem kurmaktır.

-   **Admin Kullanıcıları (`/admin/wiki-management`):** Bitkileri ekleyebilir, güncelleyebilir ve silebilirler.
-   **Normal Kullanıcılar (`/flora-encyclopedia`):** Tüm bitkileri listeleyebilir, arama yapabilir ve detaylarını görüntüleyebilirler.

---

## 🛠️ Teknolojiler

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, MUI, TanStack Query, React Hook Form | Yönetim ve kullanıcı arayüzlerini oluşturmak için. |
| **Backend** | Django, Django REST Framework, Pillow | Bitki verileri için güvenli API endpoint'leri ve görsel yönetimi sağlamak için. |
| **Veritabanı** | PostgreSQL | Bitki ve görsel verilerini depolamak için. |
| **Kimlik Doğrulama** | JWT (Simple JWT) | Admin yetkilendirmesi ve kullanıcı oturumları için. |

---

## 🏗️ Backend Mimarisi (Django)

Yeni bir `flora` Django app'i oluşturularak tüm backend mantığı bu uygulama içinde merkezileştirilecektir.

### 🔢 Modeller (`flora/models.py`)

Görsel yönetimini esnek tutmak için bitki başına birden fazla görseli destekleyecek şekilde iki model oluşturulacaktır.

```python
# flora/models.py
from django.db import models

class Plant(models.Model):
    scientific_name = models.CharField(max_length=255, unique=True, help_text="Bilimsel ad, örn: Arbutus unedo")
    common_names = models.CharField(max_length=500, help_text="Yaygın adlar, virgülle ayrılmış, örn: Kocayemiş, Sandal Ağacı")
    interaction_fauna = models.TextField(help_text="Böcekler ve kuşlar için besin ve barınak kaynağıdır.")

    # Opsiyonel kullanım alanları
    food_uses = models.TextField(blank=True, null=True)
    medicinal_uses = models.TextField(blank=True, null=True)
    ornamental_uses = models.TextField(blank=True, null=True)
    traditional_uses = models.TextField(blank=True, null=True)
    aromatic_uses = models.TextField(blank=True, null=True)

    # Kullanım alanlarını belirten bayraklar (JSON olarak)
    uses_flags = models.JSONField(default=dict, help_text="{'insects': true, 'decorative': false, ...}")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.scientific_name

class PlantImage(models.Model):
    plant = models.ForeignKey(Plant, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='flora_images/')

    def __str__(self):
        return f"Image for {self.plant.scientific_name}"
```

### 📦 Serializer'lar (`flora/serializers.py`)

Veri alışverişini ve dosya yüklemelerini yönetmek için serializer'lar oluşturulacaktır.

```python
# flora/serializers.py
from rest_framework import serializers
from .models import Plant, PlantImage

class PlantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantImage
        fields = ['id', 'image']

class PlantSerializer(serializers.ModelSerializer):
    # Okuma (GET) istekleri için resimleri tam URL ile gösterir.
    images = PlantImageSerializer(many=True, read_only=True)

    # Yazma (POST/PUT) istekleri için resim ID'lerini alır.
    # Bu alan, doğrudan view içinde işleneceği için 'required=False' olarak işaretlenmiştir.
    uploaded_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Plant
        fields = [
            'id', 'scientific_name', 'common_names', 'interaction_fauna',
            'food_uses', 'medicinal_uses', 'ornamental_uses', 'traditional_uses',
            'aromatic_uses', 'uses_flags', 'images', 'uploaded_image_ids'
        ]

# Sadece görsel yüklemek için ayrı bir serializer
class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

```

### 🔄 View'ler ve URL'ler (`flora/views.py`, `flora/urls.py`)

#### 1. Bitki Yönetimi (Admin & Kullanıcılar)

Adminlere tam CRUD yetkisi, kullanıcılara ise sadece okuma yetkisi veren bir `ViewSet` oluşturulur. Dosya yüklemeleri için `MultiPartParser` kullanılır.

```python
# flora/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from .models import Plant, PlantImage
from .serializers import PlantSerializer, ImageUploadSerializer

class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by('scientific_name')
    serializer_class = PlantSerializer
    parser_classes = [MultiPartParser, JSONParser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Herkes bitkileri görüntüleyebilir.
            self.permission_classes = [permissions.AllowAny]
        else:
            # Sadece adminler değişiklik yapabilir.
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()

    # Görsel yükleme için ayrı bir action
    @action(detail=False, methods=['post'], serializer_class=ImageUploadSerializer, parser_classes=[MultiPartParser])
    def upload_image(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = serializer.validated_data['image']
        plant_image = PlantImage.objects.create(image=image)
        # Frontend'e yüklenen resmin ID'sini ve URL'ini döndür
        return Response({
            'id': plant_image.id,
            'url': request.build_absolute_uri(plant_image.image.url)
        }, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        uploaded_image_ids = self.request.data.get('uploaded_image_ids', [])
        plant = serializer.save()
        if uploaded_image_ids:
            PlantImage.objects.filter(id__in=uploaded_image_ids).update(plant=plant)

    def perform_update(self, serializer):
        uploaded_image_ids = self.request.data.get('uploaded_image_ids', [])
        plant = serializer.save()
        if uploaded_image_ids:
            # Mevcut resimleri ayır ve yenilerini ekle
            plant.images.clear()
            images = PlantImage.objects.filter(id__in=uploaded_image_ids)
            plant.images.set(images)
```

#### 2. URL Yapılandırması

```python
# flora/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet

router = DefaultRouter()
router.register(r'plants', PlantViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# core/urls.py içine eklenecek:
# path("api/", include("flora.urls")),
# Ayrıca media dosyaları için static yapılandırma core/urls.py'ye eklenmeli.
```

---

## 💾 Başlangıç Verilerinin Yüklenmesi (Data Seeding)

`Flora.md` dosyasında verilen örnek JSON verilerini ve `frontend/src/assets/plants_image/` altındaki görselleri veritabanına yüklemek için bir yönetim komutu oluşturulacaktır.

-   **Komut:** `python manage.py load_flora_data`
-   **Mantık:**
    1.  Komut, bir JSON dosyası (veya script içindeki bir veri yapısı) okur.
    2.  Her bir bitki verisi için:
        a. `Plant` nesnesi oluşturur.
        b. İlişkili `images` path'lerini kullanarak `PlantImage` nesneleri oluşturur. Bu işlem sırasında `frontend/` dizinindeki görsellerin Django'nun `media` klasörüne kopyalanması gerekir.
    3.  `bulk_create` ile verileri veritabanına toplu halde ekler.

---

## 🧩 Frontend Mimarisi (React)

### 1. Servis Katmanı (`src/services/flora.ts`)

Backend API'si ile iletişim kuracak fonksiyonları içerir. Görsel yükleme için `FormData` kullanacaktır.

```typescript
// src/services/flora.ts
import axios from '@/lib/axios';

// ... (getPlants, getPlant, deletePlant fonksiyonları)

export const createPlant = (data: any) => {
  // `data` JSON verisi içermeli
  return axios.post('/api/plants/', data);
};

export const updatePlant = (id: number, data: any) => {
  return axios.put(`/api/plants/${id}/`, data);
};

export const uploadPlantImage = (formData: FormData) => {
  // `formData` sadece görseli içermeli
  return axios.post('/api/plants/upload_image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 2. Admin Paneli (`AdminWikiManagement.tsx`)

`AdminTemplate` bileşenini kullanarak bitki yönetimi için tam bir arayüz sağlar.

-   **Veri Çekme:** `useQuery(['plants'], floraService.getPlants)` ile tüm bitkileri çeker.
-   **Durum Yönetimi:** Ekleme/düzenleme modalının açık/kapalı durumu ve seçilen bitki.
-   **Bileşenler:**
    -   `AdminTemplate`: Ana iskelet, tablo ve aksiyon butonlarını sağlar.
    -   `AddEditPlantModal.tsx`: Bitki ekleme ve düzenleme formunu içeren modal.
    -   `ConfirmationDialog`: Silme onayı için kullanılır (AdminTemplate tarafından sağlanır).
-   **Modal Formu (`AddEditPlantModal.tsx`):**
    -   `scientific_name`, `common_names`, `interaction_fauna` (gerekli) ve diğer metin alanları için `TextField`.
    -   Üç adet görsel yükleme alanı. Her yükleme başarılı olduğunda dönen `id` bir state dizisinde tutulur.
    -   `uses_flags` için `FormGroup` içinde ikonlu `FormControlLabel` ve `Checkbox`'lar.
    -   Kaydetme işlemi `createPlant` veya `updatePlant` mutasyonunu tetikler, form verileriyle birlikte yüklenen resimlerin ID'lerini (`uploaded_image_ids`) gönderir.

### 3. Kullanıcı Arayüzü (`FloraEncyclopedia.tsx`)

Kullanıcıların bitkileri keşfedeceği sayfa.

-   **Veri Çekme:** `useQuery(['plants'], floraService.getPlants)` ile tüm bitkileri alır.
-   **Layout:**
    -   Sayfanın üstünde bir arama çubuğu.
    -   Bitkiler, responsive bir `Grid` içinde `Card` bileşenleri kullanılarak listelenir.
    -   Her `Card` üzerinde bitkinin ilk resmi, `scientific_name` ve `common_names` gösterilir.
-   **Detay Görüntüleme:**
    -   Bir `Card`'a tıklandığında `PlantDetailModal.tsx` açılır.
    -   Bu modal, bitkinin tüm görsellerini (bir galeri veya kaydırıcı ile), tüm metin alanlarını ve `uses_flags`'e karşılık gelen ikonları gösterir.

---

## ✅ Detaylı Görev Listesi

### Backend (`flora` app)

-   [x] Yeni `flora` app oluştur: `python manage.py startapp flora`.
-   [x] `flora`'yı ve `rest_framework`'ü `INSTALLED_APPS`'e ekle.
-   [x] `Pillow` kütüphanesini `requirements.txt`'ye ekle: `pip install Pillow`.
-   [x] `core/settings.py`'de `MEDIA_URL` ve `MEDIA_ROOT` ayarlarını yap.
-   [x] `core/urls.py`'de media dosyaları için static route ekle.
-   [x] `flora/models.py`: `Plant` ve `PlantImage` modellerini oluştur.
-   [x] Migration oluştur ve uygula: `makemigrations` & `migrate`.
-   [x] `flora/serializers.py`: `PlantSerializer`, `PlantImageSerializer`, `ImageUploadSerializer` oluştur.
-   [x] `flora/views.py`: `PlantViewSet`'i oluştur ve görsel yükleme `action`'ını ekle.
-   [x] `flora/urls.py`: `PlantViewSet` için URL'leri yapılandır ve `core/urls.py`'e dahil et.
-   [x] `flora/admin.py`: Modelleri Django admin paneline kaydet.
-   [x] `flora/management/commands/load_flora_data.py` yönetim komutunu oluştur.

### Frontend

-   [ ] **Servis Katmanı (`src/services/flora.ts`):**
    -   [ ] `getPlants`, `createPlant`, `updatePlant`, `deletePlant`, `uploadPlantImage` fonksiyonlarını oluştur.
-   [ ] **Tip Tanımları (`src/types/flora.ts`):**
    -   [ ] `Plant` ve `PlantImage` için TypeScript interfaceleri oluştur.
-   [ ] **Admin Paneli (`AdminWikiManagement.tsx`):**
    -   [ ] `AdminTemplate` kullanarak tabloyu ve temel aksiyonları ayarla.
    -   [ ] `AddEditPlantModal.tsx` bileşenini oluştur.
        -   [ ] `react-hook-form` ile form state yönetimini yap.
        -   [ ] Gerekli alanlar (`scientific_name`, `common_names`, `interaction_fauna`) için validasyon ekle.
        -   [ ] Görsel yükleme mantığını (tek tek yükleme, ID'leri toplama) ve önizlemeyi ekle.
        -   [ ] `uses_flags` için Checkbox grubunu oluştur.
    -   [ ] `create`, `update`, `delete` mutasyonlarını bağla.
-   [ ] **Kullanıcı Arayüzü (`FloraEncyclopedia.tsx`):**
    -   [ ] `useQuery` ile bitki verilerini çek ve yüklenme/hata durumlarını yönet.
    -   [ ] Arama çubuğu ile client-side filtreleme ekle.
    -   [ ] `Grid` ve `Card` kullanarak bitki listesini oluştur.
    -   [ ] `PlantDetailModal.tsx` bileşenini oluştur.
        -   [ ] Tıklanan bitkinin tüm verilerini props olarak alıp göster.
        -   [ ] Görseller için bir resim galerisi/kaydırıcı (image carousel) ekle.
-   [ ] **Navigasyon:**
    -   [ ] `AdminWikiManagement` sayfasını admin menüsüne ekle.
    -   [ ] `FloraEncyclopedia` sayfasını ana menüye ekle.
