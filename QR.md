# 🪙 QR Kod & Puan Sistemi – Teknik Plan

## 🌐 Genel Bakış

### 🎯 Hedef
Bu döküman, proje için QR kod tabanlı bir oyunlaştırma ve ödül sistemi oluşturmak amacıyla gereken tam yığın (full-stack) teknik planı detaylandırmaktadır. Sistem, adminlerin puan değerli QR kodlar oluşturmasını, kullanıcıların ise bu kodları okutarak puan kazanmasını ve kazandıkları puanları ödüllere dönüştürmesini sağlayacaktır.

-   **Admin Kullanıcıları (`/admin/qr-management`):** Puan değerli QR kodları oluşturabilir, yönetebilir, görüntüleyebilir ve silebilir.
-   **Normal Kullanıcılar (`/qrcodes`):** Mobil cihazlarının kamerasıyla QR kodları okutarak puan kazanır.
-   **Ödül Sayfası (`/points-and-rewards`):** Kullanıcılar puanlarını, kazandıkları geçmiş ödülleri görüntüler ve yeterli puana ulaştıklarında indirim kuponu gibi ödüller oluşturabilir.

---
## 🛠️ Teknolojiler

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, MUI, TanStack Query, **react-qr-reader** | Yönetim ve kullanıcı arayüzlerini oluşturmak, QR kod okutmak için. |
| **Backend** | Django, Django REST Framework, **qrcode**, Pillow | QR kodları oluşturmak, doğrulamak ve puan sistemini yönetmek için. |
| **Veritabanı** | PostgreSQL | QR kodları, kullanıcı puanları ve taranan kodların verilerini depolamak için. |
| **Kimlik Doğrulama** | JWT (Simple JWT) | Admin yetkilendirmesi ve kullanıcı oturumları için. |

---
## 🏗️ Backend Mimarisi (Django)

Yeni bir `qr` Django app'i oluşturularak tüm backend mantığı bu uygulama içinde merkezileştirilecektir.

### 🔢 Modeller

#### `qr/models.py`
Sistemin temel veri yapılarını içerir.

```python
# qr/models.py
from django.db import models
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

class QRCode(models.Model):
    name = models.CharField(max_length=255, help_text="QR Kodun adı (örn: Ana Giriş QR)")
    text_content = models.CharField(max_length=500, unique=True, help_text="QR kodun içerdiği metin veya URL")
    points = models.PositiveIntegerField(default=10, help_text="Bu QR kod okutulduğunda kazanılacak puan")
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # QR kodunu oluştur ve kaydet
        if not self.qr_image:
            qr_img = qrcode.make(self.text_content)
            canvas = Image.new('RGB', (qr_img.pixel_size, qr_img.pixel_size), 'white')
            canvas.paste(qr_img)
            fname = f'qr_code-{self.name}.png'
            buffer = BytesIO()
            canvas.save(buffer, 'PNG')
            self.qr_image.save(fname, File(buffer), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserScannedQR(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scanned_qrs")
    qr_code = models.ForeignKey(QRCode, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'qr_code') # Bir kullanıcı bir QR'ı sadece bir kez okutabilir

class DiscountCoupon(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coupons")
    code = models.CharField(max_length=50, unique=True)
    points_spent = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Coupon {self.code} for {self.user.email}"
```

#### `users/models.py`
Kullanıcı modelinde `points` alanı zaten mevcut ve bu sistemde aktif olarak kullanılacaktır.

```python
# users/models.py
# ...
class CustomUser(AbstractUser):
    # ...
    points = models.PositiveIntegerField(default=0)
    # ...
```

### 📦 Serializer'lar (`qr/serializers.py`)
```python
# qr/serializers.py
from rest_framework import serializers
from .models import QRCode, UserScannedQR, DiscountCoupon

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['id', 'name', 'text_content', 'points', 'qr_image', 'created_at']
        read_only_fields = ['qr_image', 'created_at']

class ScanSerializer(serializers.Serializer):
    text_content = serializers.CharField(max_length=500)

class UserScannedQRSerializer(serializers.ModelSerializer):
    qr_code = QRCodeSerializer(read_only=True)
    class Meta:
        model = UserScannedQR
        fields = ['id', 'qr_code', 'scanned_at']

class DiscountCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCoupon
        fields = ['id', 'code', 'points_spent', 'created_at', 'expires_at', 'is_used']
```

### 🔄 View'ler ve URL'ler (`qr/views.py`, `qr/urls.py`)

```python
# qr/views.py
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import QRCode, UserScannedQR, DiscountCoupon
from .serializers import QRCodeSerializer, ScanSerializer, UserScannedQRSerializer, DiscountCouponSerializer
from django.utils import timezone
import uuid
from datetime import timedelta

class QRCodeViewSet(viewsets.ModelViewSet):
    """ Adminler için QR Kod CRUD işlemleri """
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAdminUser]

class ScanQRCodeAPIView(generics.GenericAPIView):
    """ Kullanıcının QR kod okutmasını işleyen endpoint """
    serializer_class = ScanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text_content = serializer.validated_data['text_content']

        try:
            qr_code = QRCode.objects.get(text_content=text_content)
        except QRCode.DoesNotExist:
            return Response({"error": "Geçersiz veya tanınmayan QR kod."}, status=status.HTTP_404_NOT_FOUND)

        if UserScannedQR.objects.filter(user=request.user, qr_code=qr_code).exists():
            return Response({"message": "Bu QR kodu daha önce zaten okuttunuz."}, status=status.HTTP_200_OK)

        request.user.points += qr_code.points
        request.user.save(update_fields=['points'])
        UserScannedQR.objects.create(user=request.user, qr_code=qr_code)

        return Response({
            "message": f"{qr_code.points} puan kazandınız!",
            "new_total_points": request.user.points
        }, status=status.HTTP_200_OK)

class RewardsAPIView(generics.RetrieveAPIView):
    """ Kullanıcının puanlarını, geçmiş taramalarını ve kuponlarını döndürür """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        scanned_qrs = UserScannedQR.objects.filter(user=user).order_by('-scanned_at')
        coupons = DiscountCoupon.objects.filter(user=user).order_by('-created_at')

        return Response({
            'points': user.points,
            'scan_history': UserScannedQRSerializer(scanned_qrs, many=True).data,
            'coupon_history': DiscountCouponSerializer(coupons, many=True).data
        })

class GenerateCouponAPIView(generics.GenericAPIView):
    """ Puanları kullanarak indirim kuponu oluşturur """
    permission_classes = [permissions.IsAuthenticated]
    POINTS_FOR_COUPON = 100

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.points < self.POINTS_FOR_COUPON:
            return Response({"error": "İndirim kuponu oluşturmak için yeterli puanınız yok."}, status=status.HTTP_400_BAD_REQUEST)

        user.points -= self.POINTS_FOR_COUPON
        user.save(update_fields=['points'])

        coupon = DiscountCoupon.objects.create(
            user=user,
            code=f"DISCOUNT-{uuid.uuid4().hex[:8].upper()}",
            points_spent=self.POINTS_FOR_COUPON,
            expires_at=timezone.now() + timedelta(days=30)
        )

        return Response(DiscountCouponSerializer(coupon).data, status=status.HTTP_201_CREATED)
```

```python
# qr/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QRCodeViewSet, ScanQRCodeAPIView, RewardsAPIView, GenerateCouponAPIView

router = DefaultRouter()
router.register(r'qrcodes', QRCodeViewSet, basename='qrcode')

urlpatterns = [
    path('', include(router.urls)),
    path('scan/', ScanQRCodeAPIView.as_view(), name='scan-qr'),
    path('rewards/', RewardsAPIView.as_view(), name='rewards'),
    path('generate-coupon/', GenerateCouponAPIView.as_view(), name='generate-coupon'),
]

# core/urls.py içine eklenecek:
# path("api/qr/", include("qr.urls")),
```

---

## 🧩 Frontend Mimarisi (React)

### 1. Servis Katmanı (`src/services/qr.ts`)
```typescript
// src/services/qr.ts
import axios from '@/lib/axios';
import { QRCode, RewardsData, DiscountCoupon } from '@/types/qr';

// Admin
export const getQRCodes = (): Promise<QRCode[]> => axios.get('/api/qr/qrcodes/').then(res => res.data);
export const createQRCode = (data: { name: string; text_content: string; points: number }): Promise<QRCode> => axios.post('/api/qr/qrcodes/', data).then(res => res.data);
export const deleteQRCode = (id: number): Promise<void> => axios.delete(`/api/qr/qrcodes/${id}/`);

// User
export const scanQRCode = (text_content: string): Promise<{ message: string; new_total_points: number }> => axios.post('/api/qr/scan/', { text_content }).then(res => res.data);
export const getRewardsData = (): Promise<RewardsData> => axios.get('/api/qr/rewards/').then(res => res.data);
export const generateCoupon = (): Promise<DiscountCoupon> => axios.post('/api/qr/generate-coupon/').then(res => res.data);
```

### 2. Tip Tanımları (`src/types/qr.ts`)
```typescript
// src/types/qr.ts
export interface QRCode {
  id: number;
  name: string;
  text_content: string;
  points: number;
  qr_image: string; // URL to the image
  created_at: string;
}

export interface UserScannedQR {
  id: number;
  qr_code: QRCode;
  scanned_at: string;
}

export interface DiscountCoupon {
  id: number;
  code: string;
  points_spent: number;
  created_at: string;
  expires_at: string;
  is_used: boolean;
}

export interface RewardsData {
  points: number;
  scan_history: UserScannedQR[];
  coupon_history: DiscountCoupon[];
}
```

### 3. Global Durum Yönetimi (`src/store/authStore.ts`)
Kullanıcının puanını global olarak saklamak için `authStore` güncellenmelidir. `getMe` isteği sonrası dönen `user` objesindeki `points` değeri `authStore`'a yazılmalıdır. QR okutma sonrası da puan güncellenmelidir.

```typescript
// src/store/authStore.ts
// ...
interface AuthState {
  // ...
  user: {
    // ...
    points: number;
  } | null;
  setUser: (user: any) => void;
  updatePoints: (newPoints: number) => void;
}

// ...
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ...
      setUser: (user) => set({ user }),
      updatePoints: (newPoints) => set((state) => ({
        user: state.user ? { ...state.user, points: newPoints } : null,
      })),
      // ...
    }),
    { name: 'auth-storage' }
  )
);
```

### 4. Admin Paneli (`AdminQRManagement.tsx`)
-   `AdminTemplate` bileşeni kullanılarak QR kodları listelenir.
-   **Tablo Sütunları:** ID, İsim, Puan, Oluşturulma Tarihi, Aksiyonlar (Detay/İndir, Sil).
-   **Ekleme Modalı (`AddQRCodeModal`):** `name`, `text_content`, `points` alanları için `react-hook-form` ile bir form içerir.
-   **Detay Modalı (`ViewQRCodeModal`):** Bir satırdaki "Detay" butonuna tıklandığında açılır, QR kodunun görselini ve indirme linkini gösterir.

### 5. Kullanıcı QR Okutma Sayfası (`QRCodes.tsx`)
-   **Kütüphane:** `react-qr-reader` veya benzeri bir kütüphane kullanılır.
-   **Mantık:**
    1.  Sayfa yüklendiğinde kamera izni istenir.
    2.  Kullanıcı QR kodu kameraya gösterdiğinde, `onResult` fonksiyonu tetiklenir.
    3.  `scanQRCode` servisi çağrılır.
    4.  Başarılı olursa, `Snackbar` ile başarı mesajı gösterilir ve global `authStore`'daki puan `updatePoints` ile güncellenir.
    5.  Hata olursa, `Snackbar` ile hata mesajı gösterilir.

### 6. Puan ve Ödül Sayfası (`PointsAndRewards.tsx`)
-   **Veri Çekme:** `useQuery(['rewards'], qrService.getRewardsData)` ile kullanıcının tüm ödül verileri çekilir.
-   **Gösterim:**
    -   En üstte büyük bir kart içinde kullanıcının mevcut puanı (`rewardsData.points`) gösterilir.
    -   "İndirim Kuponu Oluştur" butonu bulunur. `rewardsData.points < 100` ise `disabled` olur.
    -   Butona tıklandığında `generateCoupon` mutasyonu çalışır, başarılı olursa `rewards` query'si `invalidate` edilir.
    -   İki ayrı sekme veya liste halinde "Geçmiş İşlemler" (okutulan QR'lar) ve "Kuponlarım" gösterilir.

---

## ✅ Detaylı Görev Listesi

### Backend (`qr` app)
-   [ ] Yeni `qr` app oluştur: `python manage.py startapp qr`.
-   [ ] `qr`'ı `INSTALLED_APPS`'e ekle.
-   [ ] `qrcode` ve `Pillow` kütüphanelerini `requirements.txt`'ye ekle: `pip install qrcode[pil] Pillow`.
-   [ ] `qr/models.py`: `QRCode`, `UserScannedQR`, `DiscountCoupon` modellerini oluştur.
-   [ ] Migration oluştur ve uygula: `makemigrations qr` & `migrate`.
-   [ ] `qr/serializers.py`: Gerekli serializer'ları oluştur.
-   [ ] `qr/views.py`: `QRCodeViewSet`, `ScanQRCodeAPIView`, `RewardsAPIView`, `GenerateCouponAPIView`'ları oluştur.
-   [ ] `qr/urls.py`: View'ler için URL'leri yapılandır ve `core/urls.py`'e `path("api/qr/", include("qr.urls"))` olarak dahil et.
-   [ ] `qr/admin.py`: Modelleri Django admin paneline kaydet.

### Frontend
-   [ ] **Servis Katmanı (`src/services/qr.ts`):**
    -   [ ] Admin ve kullanıcı için gerekli API fonksiyonlarını oluştur.
-   [ ] **Tip Tanımları (`src/types/qr.ts`):**
    -   [ ] `QRCode`, `UserScannedQR`, `DiscountCoupon`, `RewardsData` interfacelerini oluştur.
-   [ ] **Global State (`src/store/authStore.ts`):**
    -   [ ] `user` objesine `points` ekle ve `updatePoints` action'ını tanımla.
    -   [ ] Login ve `getMe` sonrası puanın store'a yazıldığından emin ol.
-   [ ] **Navigasyon ve UI:**
    -   [ ] `AppNavbar.tsx` içinde kullanıcının puanını göster. Tıklanınca `/points-and-rewards` sayfasına yönlendir.
-   [ ] **Admin Paneli (`AdminQRManagement.tsx`):**
    -   [ ] `AdminTemplate` kullanarak tabloyu ve temel aksiyonları ayarla.
    -   [ ] `AddQRCodeModal.tsx` ve `ViewQRCodeModal.tsx` bileşenlerini oluştur.
    -   [ ] `create`, `delete` mutasyonlarını bağla.
-   [ ] **Kullanıcı Sayfaları:**
    -   [ ] `QRCodes.tsx` sayfasına `react-qr-reader` ekle ve tarama mantığını kur.
    -   [ ] `PointsAndRewards.tsx` sayfasını `useQuery` ve `useMutation` kullanarak oluştur.
        -   [ ] Puan gösterimini, kupon oluşturma butonunu ve geçmiş işlem listelerini implemente et.

