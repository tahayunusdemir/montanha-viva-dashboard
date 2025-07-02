# 📊 Sensör Veri Yönetim Paneli – Teknik Plan

## 🌐 Genel Bakış

### 🎯 Hedef

Bu döküman, sensör istasyonlarının yönetimi ve bu istasyonlardan gelen verilerin görselleştirilmesi için gerekli olan tam yığın (full-stack) özelliklerin teknik planını detaylandırmaktadır.

- **Admin Kullanıcıları:** İstasyonları ekleyebilir, güncelleyebilir, silebilir ve durumlarını (aktif/pasif) yönetebilirler (`/admin/station-management`).
- **Normal Kullanıcılar:** Aktif istasyonları seçebilir, bir tarih aralığı belirleyerek ilgili sensör ölçümlerini grafik ve tablo formatında görüntüleyebilirler (`/sensor-data`).

---

## 🛠️ Teknolojiler

| Katman           | Teknoloji                                        | Açıklama                                                                   |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| Frontend         | React, TypeScript, MUI, TanStack Query, Recharts | `/sensor-data` ve `/admin/station-management` sayfalarını oluşturmak için. |
| Backend          | Django, Django REST Framework                    | İstasyon ve ölçüm verileri için güvenli API endpoint'leri sağlamak için.   |
| Veritabanı       | PostgreSQL                                       | Üretim ortamında istasyon ve ölçüm verilerini depolamak için.              |
| Kimlik Doğrulama | JWT (Simple JWT)                                 | Tüm API isteklerinde kullanıcı ve admin rollerini doğrulamak için.         |

---

## 📊 Veri Kaynağı ve Formatı

Bu bölüm, sisteme alınacak verilerin kaynağını, formatını ve beklenen alanları tanımlar. Referans dosyalar `data_example.csv` ve `send_iot_data.py`'dir.

### Veri Akışı

1.  Sensörlerden gelen veriler, `data_example.csv` dosyasındakine benzer bir formatta CSV dosyaları olarak toplanır.
2.  `send_iot_data.py` scripti bu CSV dosyalarını okur.
3.  Script, her bir veri satırını, aşağıdaki JSON formatında `POST /api/iot-data/` endpoint'ine gönderir.

### JSON Payload Formatı (`/api/iot-data`)

```json
{
  "station_id": "stationGardunha",
  "location": "Gardunha",
  "measurements": [
    {
      "type": "max_wind_speed",
      "value": 7.0,
      "recorded_at": 1738570260
    },
    {
      "type": "mean_wind_speed",
      "value": 0.0,
      "recorded_at": 1738570260
    },
    { "type": "temperature", "value": 1.0, "recorded_at": 1738570260 },
    { "type": "humidity", "value": 85.0, "recorded_at": 1738570260 }
    // ...
  ]
}
```

### Ölçüm Türleri (`measurement_type`)

`data_example.csv`'deki sütun başlıkları, `Measurement` modelindeki `measurement_type` alanına karşılık gelir. Beklenen türler şunlardır:

- `max_wind_speed`
- `mean_wind_speed`
- `pluviometer`
- `atmospheric`
- `temperature`
- `humidity`
- `wind_direction`
- `humidity_solo`

---

## 🏗️ Backend Mimarisi (Django)

Backend, istasyon yönetimi (CRUD) ve ölçüm verilerinin filtrelenmesi için iki ana model ve ViewSet etrafında şekillenecektir.

### 🔢 Modeller (`stations/models.py`)

Yeni bir `stations` Django app'i oluşturulacak.

```python
# stations/models.py

from django.db import models

class Station(models.Model):
  # station_id, IoT cihazından gelen benzersiz kimliktir.
  station_id = models.CharField(primary_key=True, max_length=100, unique=True)
  name = models.CharField(max_length=255)
  location = models.CharField(max_length=255, blank=True, help_text="Örn: 40.7128, -74.0060")
  is_active = models.BooleanField(default=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
      return self.name

class Measurement(models.Model):
  station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="measurements")
  measurement_type = models.CharField(max_length=100)
  value = models.FloatField()
  recorded_at = models.DateTimeField(help_text="Ölçümün yapıldığı zaman damgası")

  class Meta:
      ordering = ['-recorded_at']
```

### 📦 Serializer'lar (`stations/serializers.py`)

```python
# stations/serializers.py

from rest_framework import serializers
from .models import Station, Measurement

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = ['measurement_type', 'value', 'recorded_at']

# Veri alımı için kullanılacak serializer (send_iot_data.py ile uyumlu)
class MeasurementCreateSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=100)
    value = serializers.FloatField()
    # Gelen veri Unix timestamp (integer) olacağı için IntegerField kullanılır
    recorded_at = serializers.IntegerField()
```

### 🔄 View'ler ve URL'ler (`stations/views.py`, `stations/urls.py`)

#### 1. İstasyon Yönetimi (Admin için)

Admin kullanıcılarının istasyonlar üzerinde tam kontrol sahibi olmasını sağlar.

```python
# stations/views.py

from rest_framework import viewsets, permissions
from .models import Station, Measurement
from .serializers import StationSerializer, MeasurementSerializer

class StationViewSet(viewsets.ModelViewSet):
    """
    Admin kullanıcıları için istasyonları yönetir (CRUD).
    Normal kullanıcılar sadece aktif istasyonları görebilir (ReadOnly).
    """
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [permissions.IsAdminUser] # Sadece adminler için CRUD

    def get_queryset(self):
        # Admin olmayan kullanıcılar sadece aktif istasyonları görebilir
        if not self.request.user.is_staff:
            return Station.objects.filter(is_active=True)
        return super().get_queryset()

    def get_permissions(self):
        # GET, HEAD, OPTIONS istekleri için IsAuthenticated yeterli
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.IsAuthenticated]
        # Diğer tüm eylemler (create, update, delete) için IsAdminUser gerekir
        else:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()
```

#### 2. Ölçüm Verilerini Görüntüleme (Tüm Yetkili Kullanıcılar için)

Kullanıcıların belirli bir istasyon ve tarih aralığı için ölçümleri almasını sağlar. Bu endpoint, `Accept` başlığına veya `format` sorgu parametresine göre hem JSON hem de **CSV** formatında yanıt verebilir.

```python
# stations/views.py (devamı)
from rest_framework.renderers import JSONRenderer
from djangorestframework_csv.renderers import CSVRenderer

class MeasurementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Kullanıcıların ölçüm verilerini filtreleyerek okumasını sağlar.
    JSON ve CSV formatında çıktı verebilir.
    """
    serializer_class = MeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer, CSVRenderer] # JSON ve CSV renderer'larını etkinleştir

    def get_queryset(self):
        queryset = Measurement.objects.all()
        params = self.request.query_params

        station_id = params.get('station_id')
        start_date = params.get('start')
        end_date = params.get('end')

        if not station_id or not start_date or not end_date:
            # Gerekli parametreler olmadan boş sonuç döndür
            return queryset.none()

        queryset = queryset.filter(station__station_id=station_id)
        # Gelen timestamp değerleri Datetime objesine çevrilmeli
        queryset = queryset.filter(recorded_at__gte=start_date, recorded_at__lte=end_date)
        return queryset
```

#### 3. Harici Sistemlerden Veri Alımı (`/api/iot-data`)

`send_iot_data.py` scripti gibi harici kaynaklardan veri kabul eder. Bu endpoint, prototipteki Flask uygulamasının yerini alacaktır.

```python
# stations/views.py (devamı)
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timezone

class DataIngestionView(APIView):
    """
    IoT cihazlarından gelen verileri POST isteği ile alır ve kaydeder.
    Bu endpoint bir API anahtarı ile korunmalıdır (basitlik için şimdilik atlandı).
    """
    permission_classes = [permissions.AllowAny] # TODO: API Key auth eklenmeli

    def post(self, request):
        data = request.data
        station_id = data.get('station_id')
        measurements_data = data.get('measurements', [])

        if not station_id or not measurements_data:
            return Response({"error": "station_id ve measurements gerekli"}, status=400)

        # İstasyon yoksa oluştur (veya hata ver, tercihe bağlı)
        station, created = Station.objects.get_or_create(
            station_id=station_id,
            defaults={'name': f"Station {station_id}", 'location': data.get('location', '')}
        )

        for m_data in measurements_data:
            serializer = MeasurementCreateSerializer(data=m_data)
            if serializer.is_valid():
                # Unix timestamp'i datetime objesine çevir
                unix_timestamp = serializer.validated_data['recorded_at']
                dt_object = datetime.fromtimestamp(unix_timestamp, tz=timezone.utc)

                Measurement.objects.create(
                    station=station,
                    measurement_type=serializer.validated_data['type'],
                    value=serializer.validated_data['value'],
                    recorded_at=dt_object
                )
        return Response({"status": "success"}, status=201)
```

#### URL Yapılandırması

```python
# stations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StationViewSet, MeasurementViewSet, DataIngestionView

router = DefaultRouter()
router.register(r'stations', StationViewSet)
router.register(r'measurements', MeasurementViewSet, basename='measurement')

urlpatterns = [
    path('', include(router.urls)),
    path('iot-data/', DataIngestionView.as_view(), name='iot-data-ingestion'),
]

# core/urls.py içine eklenecek:
# path("api/", include("stations.urls")),
```

---

## 💾 Başlangıç Verilerinin Yüklenmesi (Data Seeding)

Projenin başlangıcında, projenin ana dizinindeki `data/` klasöründe bulunan `dados_com_colunas_personalizadas.csv` (40.000+ satır) dosyasının veritabanına yüklenmesi gerekmektedir. Bu, kullanıcıların uygulamayı ilk açtıklarında etkileşime girebilecekleri anlamlı bir veri seti olmasını sağlar.

Bu işlemi otomatikleştirmek için özel bir Django yönetim komutu (`management command`) oluşturulacaktır.

### Yönetim Komutu: `load_station_data`

Bu komut, belirtilen bir CSV dosyasını okuyacak ve içeriğini `Station` ve `Measurement` modellerine uygun şekilde veritabanına yazacaktır.

- **Kullanım:** `python manage.py load_station_data data/dados_com_colunas_personalizadas.csv`
- **Mantık:**
  1. Komut, bir CSV dosya yolu argümanı alır.
  2. CSV dosyasını `csv.DictReader` ile okur.
  3. Her satır için:
     a. `DeviceID`'yi kullanarak bir `Station` nesnesi oluşturur veya mevcut olanı alır (`get_or_create`).
     b. `Timestamp`'i bir `datetime` nesnesine dönüştürür.
     c. `max_wind_speed`, `temperature` gibi ölçüm sütunları arasında döngü yapar. Her bir sütun için ayrı bir `Measurement` nesnesi oluşturur (veriyi "unpivot" eder).
     d. Oluşturulan `Measurement` nesnelerini veritabanına kaydeder.

Bu yaklaşım, CSV'deki geniş (wide) formatlı veriyi, veritabanı modelimizdeki uzun (long) formata verimli bir şekilde dönüştürür.

---

## 🧩 Frontend Mimarisi (React)

### 1. Admin Paneli: `AdminStationManagement.tsx`

`AdminTemplate` bileşenini kullanarak istasyon yönetimi için bir arayüz sağlar.

- **Veri Çekme:** `useQuery(['stations'], fetchStations)` ile tüm istasyonları çeker.
- **Ekleme/Düzenleme:** Bir modal form açar ve `useMutation` kullanarak `POST` veya `PUT` isteği gönderir.
- **Silme:** `useMutation` kullanarak `DELETE` isteği gönderir.

```typescript
// frontend/src/pages/dashboard/views/admin/AdminStationManagament/AdminStationManagament.tsx

// ... importlar

// API çağrıları için bir servis dosyası oluşturulacak (örn: src/services/station.ts)
// const { data, isLoading, isError } = useQuery('stations', stationService.getAll);
// const createMutation = useMutation(stationService.create);
// const updateMutation = useMutation(stationService.update);
// const deleteMutation = useMutation(stationService.delete);

// ... handle metodları (handleAdd, handleEdit, handleDelete) bu mutation'ları çağırır.

return (
  <AdminTemplate
    title="Station Management"
    data={data || []}
    columns={columns}
    isLoading={isLoading}
    // ... diğer proplar
  />
);
```

### 2. Kullanıcı Paneli: `SensorData.tsx`

Kullanıcının istasyon verilerini görüntülemesini sağlayan ana bileşen.

- **State Yönetimi:**
  - `selectedStation` (string | null): Seçilen istasyonun ID'si.
  - `dateRange` ({ start: Date, end: Date }): Seçilen tarih aralığı.
- **Bileşenler:**
  - `StationSelector`: `/api/stations` endpoint'inden veri çeker ve bir dropdown listesi sunar.
  - `DateRangePicker`: Başlangıç ve bitiş tarihini seçmek için kullanılır.
  - `SensorChart`: Filtrelenmiş verileri Recharts kullanarak görselleştirir.
  - `SensorTable` (isteğe bağlı): Verileri MUI DataGrid ile tablo formatında gösterir.
- **Veri Çekme:**
  - `useQuery` kancası, `selectedStation` ve `dateRange` state'leri değiştiğinde tetiklenir.
  - `enabled` seçeneği, tüm filtreler seçilene kadar API çağrısının yapılmasını engeller.

```typescript
// frontend/src/pages/dashboard/views/public/SensorData/SensorData.tsx

const [selectedStation, setSelectedStation] = useState<string | null>(null);
const [dateRange, setDateRange] = useState(/* ... */);

const { data: measurements, isLoading } = useQuery(
  ['measurements', selectedStation, dateRange],
  () => fetchMeasurements(selectedStation!, dateRange.start, dateRange.end),
  {
    enabled: !!selectedStation && !!dateRange.start, // Sadece tüm parametreler varken çalıştır
  }
);

const handleDownloadCsv = () => {
    if (!selectedStation || !dateRange.start || !dateRange.end) return;

    const params = new URLSearchParams({
        station_id: selectedStation,
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        format: 'csv' // Backend'den CSV formatında veri istemek için
    });

    const url = `/api/measurements/?${params.toString()}`;
    window.open(url, '_blank'); // Yeni sekmede açarak indirmeyi tetikle
};

return (
    <PageLayout>
        <Typography variant="h4">Sensor Data</Typography>
        <Stack spacing={2} direction="row" alignItems="flex-end">
            <StationSelector value={selectedStation} onChange={setSelectedStation} />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadCsv}
                disabled={!measurements || measurements.length === 0}
                variant="outlined"
            >
                Download as CSV
            </Button>
        </Stack>
        {isLoading && <CircularProgress />}
        {measurements && <SensorChart data={measurements} />}
    </PageLayout>
);
```

### 3. Admin Paneli: `AdminStationManagement.tsx`

## ✅ Detaylı Görev Listesi

### Backend (`stations` app)

- [x] Yeni `stations` app oluştur: `python manage.py startapp stations`
- [x] `stations` app'ini `INSTALLED_APPS`'e ekle.
- [x] `stations/models.py`: `Station` ve `Measurement` modellerini oluştur.
- [x] Model değişiklikleri için migration oluştur ve uygula: `makemigrations` & `migrate`.
- [x] `stations/serializers.py`: `StationSerializer`, `MeasurementSerializer` ve `MeasurementCreateSerializer` oluştur.
- [x] `stations/views.py`:
  - [x] `StationViewSet` (Admin için CRUD, kullanıcı için ReadOnly list) oluştur.
  - [x] `MeasurementViewSet` (Kullanıcı için ReadOnly, filtreli) oluştur.
  - [x] `DataIngestionView` (Harici veri alımı için) oluştur.
- [x] `stations/urls.py`: ViewSet'ler ve `DataIngestionView` için URL'leri yapılandır.
- [x] `core/urls.py`: `stations.urls`'i projeye dahil et.
- [x] `admin.py`: `Station` ve `Measurement` modellerini Django admin paneline kaydet.
- [x] **Veri Yükleme Komutu:**
  - [x] `stations/management/commands/load_station_data.py` dosyasını oluştur.
  - [x] Komutun CSV dosyasını okuma, `Station` ve `Measurement` nesneleri oluşturma ve kaydetme mantığını uygula.
  - [x] Büyük dosyalarla verimli çalışması için `bulk_create` kullanımını değerlendir.
- [x] **Paket Kurulumu:** `djangorestframework-csv` paketini `requirements.txt` dosyasına ekle.
- [ ] **Testler:**
  - [ ] Admin kullanıcısının istasyon oluşturabildiğini/güncelleyebildiğini/silebildiğini test et.
  - [ ] Normal kullanıcının istasyonları silemediğini/güncelleyemediğini test et.
  - [ ] Normal kullanıcının sadece aktif istasyonları listeleyebildiğini test et.
  - [ ] `measurements` endpoint'inin filtrelemeyi doğru yaptığını test et.

### Frontend

- [x] **Servis Katmanı (`src/services/station.ts`):**
  - [x] `getStations()`
  - [x] `getMeasurements(stationId, start, end)`
  - [x] `createStation(data)`
  - [x] `updateStation(id, data)`
  - [x] `deleteStation(id)`
- [x] **Admin Paneli (`AdminStationManagement.tsx`):**
  - [x] `station.ts` servisinden gelen verilerle `AdminTemplate`'i doldur.
  - [x] Yüklenme (loading) ve hata (error) durumlarını yönet.
  - [x] İstasyon ekleme/düzenleme için bir modal formu oluştur (`AddEditStationModal.tsx`).
- [x] **Kullanıcı Paneli (`SensorData.tsx`):**
  - [x] `StationSelector.tsx` bileşenini oluştur (MUI `Select`). `getStations` API çağrısını kullanır.
  - [x] `DateRangePicker.tsx` bileşenini oluştur (MUI `DateTimePicker`).
  - [x] `SensorChart.tsx` bileşenini oluştur (Recharts `LineChart`).
  - [x] `SensorData.tsx` ana sayfa bileşenini oluştur, state yönetimini ve `useQuery` ile veri çekme mantığını uygula.
  - [x] Kullanıcı dostu yüklenme, hata ve "veri yok" durumlarını göster.
  - [x] Veri yüklendiğinde aktif olan "CSV Olarak İndir" butonunu ekle.
  - [x] İndirme butonunun, backend'in CSV endpoint'ini doğru parametrelerle çağırdığından emin ol.
