# 🗺️ Rotalar Ansiklopedisi – Teknik Plan

## 🌐 Genel Bakış

### 🎯 Hedef

Bu döküman, projenin rotalar ansiklopedisi özelliğinin oluşturulması için gereken tam yığın (full-stack) teknik planı detaylandırmaktadır. Amaç, admin kullanıcılarının rota veritabanını yönetebileceği ve son kullanıcıların bu rotaları modern ve kullanıcı dostu bir arayüzde keşfedebileceği bir sistem kurmaktır.

-   **Admin Kullanıcıları (`/admin/routes-management`):** Rotaları ekleyebilir, güncelleyebilir ve silebilirler.
-   **Normal Kullanıcılar (`/routes-encyclopedia`):** Tüm rotaları listeleyebilir, arama yapabilir ve detaylarını görüntüleyebilirler.

---

## 🛠️ Teknolojiler

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, MUI, TanStack Query, React Hook Form | Yönetim ve kullanıcı arayüzlerini oluşturmak için. |
| **Backend** | Django, Django REST Framework, Pillow | Rota verileri, görseller ve GPX dosyaları için güvenli API endpoint'leri sağlamak için. |
| **Veritabanı** | PostgreSQL | Rota ve ilgi noktası verilerini depolamak için. |
| **Kimlik Doğrulama** | JWT (Simple JWT) | Admin yetkilendirmesi ve kullanıcı oturumları için. |

---

## 🏗️ Backend Mimarisi (Django)

Yeni bir `routes` Django app'i oluşturularak tüm backend mantığı bu uygulama içinde merkezileştirilecektir.

### 🔢 Modeller (`routes/models.py`)

Rotaları ve rotalara bağlı ilgi çekici noktaları (Points of Interest) yönetmek için iki model oluşturulacaktır.

```python
# routes/models.py
from django.db import models

class PointOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.name

class Route(models.Model):
    ROUTE_TYPE_CHOICES = [("circular", "Circular"), ("linear", "Linear")]
    DIFFICULTY_CHOICES = [("Easy", "Easy"), ("Medium", "Medium"), ("Hard", "Hard")]

    name = models.CharField(max_length=255, unique=True)
    distance_km = models.FloatField(help_text="Mesafe (km)")
    duration = models.CharField(max_length=50, help_text="Süre, örn: 4 h 30 min")
    route_type = models.CharField(max_length=10, choices=ROUTE_TYPE_CHOICES)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    altitude_min_m = models.IntegerField(help_text="Minimum irtifa (m)")
    altitude_max_m = models.IntegerField(help_text="Maksimum irtifa (m)")
    accumulated_climb_m = models.IntegerField(help_text="Toplam tırmanış (m)")
    start_point_gps = models.CharField(max_length=100, blank=True, null=True, help_text="Başlangıç noktası GPS koordinatları")
    description = models.TextField()
    interaction_fauna = models.TextField(help_text="Rota boyunca gözlemlenebilecek fauna hakkında bilgi.")

    points_of_interest = models.ManyToManyField(PointOfInterest, blank=True)

    image_card = models.ImageField(upload_to='routes_images/', help_text="Rota kartı için görsel")
    image_map = models.ImageField(upload_to='routes_images/', help_text="Rota haritası görseli")
    gpx_file = models.FileField(upload_to='gpx_files/', blank=True, null=True, help_text="GPX dosyası")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

### 📦 Serializer'lar (`routes/serializers.py`)

Veri alışverişini ve dosya yüklemelerini yönetmek için serializer'lar oluşturulacaktır.

```python
# routes/serializers.py
from rest_framework import serializers
from .models import Route, PointOfInterest

class PointOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointOfInterest
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    # Okuma (GET) istekleri için ilgi noktalarını tam obje olarak gösterir.
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)
    # Yazma (POST/PUT) istekleri için ilgi noktası ID'lerini alır.
    points_of_interest_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=PointOfInterest.objects.all(), source='points_of_interest', write_only=True, required=False
    )

    class Meta:
        model = Route
        fields = [
            'id', 'name', 'distance_km', 'duration', 'route_type', 'difficulty',
            'altitude_min_m', 'altitude_max_m', 'accumulated_climb_m',
            'start_point_gps', 'description', 'interaction_fauna',
            'points_of_interest', 'points_of_interest_ids',
            'image_card', 'image_map', 'gpx_file',
            'created_at', 'updated_at'
        ]
```

### 🔄 View'ler ve URL'ler (`routes/views.py`, `routes/urls.py`)

Adminlere tam CRUD yetkisi, kullanıcılara ise sadece okuma yetkisi veren bir `ViewSet` mimarisi kullanılacaktır. Görsel ve dosya yüklemeleri için `MultiPartParser` kullanılır.

```python
# routes/views.py
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Route, PointOfInterest
from .serializers import RouteSerializer, PointOfInterestSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all().order_by('name')
    serializer_class = RouteSerializer
    parser_classes = [MultiPartParser, JSONParser] # Dosya ve JSON verilerini destekler

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Herkes rotaları görüntüleyebilir.
            self.permission_classes = [permissions.AllowAny]
        else:
            # Sadece adminler değişiklik yapabilir.
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()

class PointOfInterestViewSet(viewsets.ModelViewSet):
    """
    İlgi noktaları için adminlere yönelik basit bir CRUD arayüzü.
    Rotalar oluşturulmadan önce ilgi noktaları eklenebilir.
    """
    queryset = PointOfInterest.objects.all()
    serializer_class = PointOfInterestSerializer
    permission_classes = [permissions.IsAdminUser]
```

#### URL Yapılandırması

```python
# routes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RouteViewSet, PointOfInterestViewSet

router = DefaultRouter()
router.register(r'routes', RouteViewSet)
router.register(r'points-of-interest', PointOfInterestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# backend/api/urls.py içine eklenecek:
# path("routes/", include("routes.urls")),

# Not: core/urls.py içinde media dosyaları için static yapılandırmanın
# DEBUG modunda aktif olduğundan emin olunmalıdır. (Bu proje için zaten yapılmış durumdadır.)
```

---

## 💾 Başlangıç Verilerinin Yüklenmesi (Data Seeding)

`Routes.md` dosyasında verilen örnek JSON verilerini ve `frontend/src/assets/routes_image/` altındaki görselleri veritabanına yüklemek için bir yönetim komutu oluşturulacaktır. Bu komut, `flora/management/commands/load_flora_data.py` komutunun mantığını takip edecektir.

-   **Komut:** `python manage.py load_routes_data`
-   **Mantık:**
    1.  Komut, bir JSON dosyası (veya script içindeki bir veri yapısı) okur.
    2.  Her bir rota verisi için `Route.objects.update_or_create()` kullanarak veritabanına ekler veya günceller.
    3.  İlişkili `points_of_interest` (string listesi) için `PointOfInterest.objects.get_or_create()` ile nesneleri oluşturur veya mevcut olanları kullanır.
    4.  Rota nesnesine ilgi noktalarını ekler.
    5.  `image_card` ve `image_map` için belirtilen yollardaki (örn: `frontend/src/assets/routes_image/cartao_Carvalhal.png`) görselleri Django'nun `media` klasörüne (`media/routes_images/`) kopyalar ve `ImageField` alanlarına atar. Bu işlem, kaynak ve hedef yollarını doğru bir şekilde birleştirerek yapılır.
    6.  İşlem sonucunda başarılı ve hatalı işlemler hakkında konsola bilgi yazar.

---

## 🧩 Frontend Mimarisi (React)

### 1. Tip Tanımları (`src/types/routes.ts`)

Backend modelleriyle uyumlu TypeScript arayüzleri oluşturulacaktır.

```typescript
// src/types/routes.ts

export interface PointOfInterest {
  id: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface Route {
  id: number;
  name: string;
  distance_km: number;
  duration: string;
  route_type: "circular" | "linear";
  difficulty: "Easy" | "Medium" | "Hard";
  altitude_min_m: number;
  altitude_max_m: number;
  accumulated_climb_m: number;
  start_point_gps?: string;
  description: string;
  interaction_fauna: string;
  points_of_interest: PointOfInterest[];
  image_card?: string;
  image_map?: string;
  gpx_file?: string;
  created_at: string;
  updated_at: string;
}

// Form ve API payload'u için tip.
// Dosyalar FormData ile gönderileceği için burada FileList olarak tutulabilir.
export interface RoutePayload {
    name: string;
    distance_km: number;
    duration: string;
    route_type: "circular" | "linear";
    difficulty: "Easy" | "Medium" | "Hard";
    altitude_min_m: number;
    altitude_max_m: number;
    accumulated_climb_m: number;
    start_point_gps?: string;
    description: string;
    interaction_fauna: string;
    points_of_interest_ids: number[]; // Sadece ID'ler gönderilir
    image_card?: FileList | null;
    image_map?: FileList | null;
    gpx_file?: FileList | null;
}


export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

### 2. Servis Katmanı (`src/services/routes.ts`)

Backend API'si ile iletişim kuracak fonksiyonları içerir. Rota oluşturma/güncelleme işlemleri `FormData` kullanarak hem JSON verisini hem de dosyaları tek bir istekte gönderecektir.

```typescript
// src/services/routes.ts
import axios from '@/lib/axios';
import { Route, RoutePayload, PaginatedResponse } from '@/types';

export const getRoutes = async (): Promise<PaginatedResponse<Route>> => {
  const { data } = await axios.get<PaginatedResponse<Route>>('/api/routes/');
  return data;
};

// ... (getRouteById, deleteRoute fonksiyonları)

export const createRoute = (formData: FormData): Promise<Route> => {
  return axios.post('/api/routes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRoute = (id: number, formData: FormData): Promise<Route> => {
  return axios.put(`/api/routes/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 3. Admin Paneli (`AdminRoutesManagement.tsx`)

`AdminTemplate` bileşenini kullanarak rota yönetimi için tam bir arayüz sağlar.

-   **Veri Çekme:** `useQuery(['routes'], routesService.getRoutes)` ile tüm rotaları çeker.
-   **Durum Yönetimi:** Ekleme/düzenleme modalının açık/kapalı durumu ve seçilen rota.
-   **Bileşenler:**
    -   `AdminTemplate`: Ana iskelet, tablo ve aksiyon butonlarını sağlar.
    -   `AddEditRouteModal.tsx`: Rota ekleme ve düzenleme formunu içeren modal.
    -   `ConfirmationDialog`: Silme onayı için kullanılır (`AdminTemplate` tarafından sağlanır).
-   **Modal Formu (`AddEditRouteModal.tsx`):**
    -   Gerekli alanlar (`name`, `distance_km`, `description` vb.) için `TextField` ve validasyon.
    -   `route_type` ve `difficulty` için `Select` bileşenleri.
    -   `points_of_interest_ids` için `Autocomplete` veya `MultiSelect` bileşeni (API'den çekilen POI listesi ile).
    -   `image_card`, `image_map`, `gpx_file` için dosya yükleme alanları ve önizleme.
    -   Kaydetme işlemi `createRoute` veya `updateRoute` mutasyonunu tetikler. `react-hook-form` ile toplanan veriler (`RoutePayload`), bir `FormData` nesnesine dönüştürülerek gönderilir.

### 4. Kullanıcı Arayüzü (`RoutesEncyclopedia.tsx`)

Kullanıcıların rotaları keşfedeceği sayfa.

-   **Veri Çekme:** `useQuery(['routes'], routesService.getRoutes)` ile tüm rotaları alır.
-   **Layout:**
    -   Sayfanın üstünde arama çubuğu ve zorluk (`difficulty`) seviyesine göre filtreleme seçenekleri.
    -   Rotalar, responsive bir `Grid` içinde `Card` bileşenleri kullanılarak listelenir.
    -   Her `Card` üzerinde `image_card`, `name`, `duration`, `distance_km` ve `difficulty` bilgileri gösterilir.
-   **Detay Görüntüleme:**
    -   Bir `Card`'a tıklandığında `RouteDetailModal.tsx` açılır.
    -   Bu modal, rotanın tüm detaylarını, harita görselini (`image_map`), ilgi noktalarını ve GPX indirme linkini gösterir.

---

## ✅ Detaylı Görev Listesi

### Backend (`routes` app)

-   [ ] Yeni `routes` app oluştur: `python manage.py startapp routes`.
-   [ ] `routes` app'ini `INSTALLED_APPS`'e ekle.
-   [ ] `Pillow` kütüphanesinin `requirements.txt`'de olduğundan emin ol.
-   [ ] `core/settings.py`'de `MEDIA_URL` ve `MEDIA_ROOT` ayarlarının yapıldığından emin ol.
-   [ ] `core/urls.py`'de media dosyaları için static route eklendiğinden emin ol.
-   [ ] `routes/models.py`: `Route` ve `PointOfInterest` modellerini oluştur.
-   [ ] Migration oluştur ve uygula: `makemigrations` & `migrate`.
-   [ ] `routes/serializers.py`: `RouteSerializer` ve `PointOfInterestSerializer` oluştur.
-   [ ] `routes/views.py`: `RouteViewSet` ve `PointOfInterestViewSet`'i oluştur.
-   [ ] `routes/urls.py`: `ViewSet`'ler için URL'leri yapılandır.
-   [ ] `api/urls.py`: `routes.urls`'i dahil et.
-   [ ] `routes/admin.py`: Modelleri Django admin paneline kaydet.
-   [ ] `routes/management/commands/load_routes_data.py` yönetim komutunu oluştur.

### Frontend

-   [ ] **Tip Tanımları (`src/types/routes.ts`):**
    -   [ ] `Route`, `PointOfInterest` ve `RoutePayload` için TypeScript interfacelerini oluştur/güncelle.
-   [ ] **Servis Katmanı (`src/services/routes.ts`):**
    -   [ ] `getRoutes`, `createRoute`, `updateRoute`, `deleteRoute` fonksiyonlarını oluştur.
-   [ ] **Admin Paneli (`AdminRoutesManagement.tsx`):**
    -   [ ] `AdminTemplate` kullanarak tabloyu ve temel aksiyonları ayarla.
    -   [ ] `AddEditRouteModal.tsx` bileşenini oluştur.
        -   [ ] `react-hook-form` ile form state yönetimini yap.
        -   [ ] Gerekli alanlar için validasyon ekle.
        -   [ ] Dosya yükleme (`image_card`, `image_map`, `gpx_file`) mantığını ve önizlemeyi ekle.
    -   [ ] `create`, `update`, `delete` mutasyonlarını bağla.
-   [ ] **Kullanıcı Arayüzü (`RoutesEncyclopedia.tsx`):**
    -   [ ] `useQuery` ile rota verilerini çek ve yüklenme/hata durumlarını yönet.
    -   [ ] Arama çubuğu ve filtreleme ile client-side veya server-side (tercihen) filtreleme ekle.
    -   [ ] `Grid` ve `Card` kullanarak rota listesini oluştur.
    -   [ ] `RouteDetailModal.tsx` bileşenini oluştur.
        -   [ ] Tıklanan rotanın tüm verilerini props olarak alıp göster.
-   [ ] **Navigasyon:**
    -   [ ] `AdminRoutesManagement` sayfasını admin menüsüne ekle.
    -   [ ] `RoutesEncyclopedia` sayfasını ana menüye ekle.
