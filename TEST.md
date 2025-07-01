# Kullanıcı Kimlik Doğrulama ve Yönetim Test Planı

Bu belge, `UserAuthenticationAndManagement.md`'de belirtilen özelliklerin manuel olarak nasıl test edileceğine dair adım adım bir kılavuz sağlar. Testler, Docker tabanlı bir geliştirme ortamında çalışacak şekilde tasarlanmıştır.

## 1. Ön Koşullar

Tüm testlere başlamadan önce, projenin tüm servislerinin çalıştığından emin olun. Projenizin kök dizininde aşağıdaki komutu çalıştırın:

```bash
docker-compose up --build -d
```

Bu komut, veritabanı, backend ve frontend servislerini arka planda başlatacaktır.

---

## 2. Backend API Testleri (Pytest)

Manuel frontend testlerine geçmeden önce, backend API'sinin beklendiği gibi çalıştığından emin olmak için otomatik testleri çalıştırmak iyi bir pratiktir.

1.  Yeni bir terminal açın.
2.  Backend konteynerinin içinde `pytest` komutunu çalıştırın:

    ```bash
    docker-compose exec backend pytest
    ```

**Beklenen Sonuç:**
Testlerin bir özetini görmelisiniz. Tüm testlerin `PASSED` olarak işaretlendiğinden emin olun. Herhangi bir `FAILED` veya `ERROR` varsa, frontend testlerine geçmeden önce bu sorunları çözün.

---

## 3. Yönetici (Admin) Kullanıcısı Oluşturma

Yönetici paneli özelliklerini test etmek için önce `is_staff` yetkisine sahip bir kullanıcı oluşturmamız gerekiyor.

1.  Yeni bir terminal açın.
2.  Django'nun `createsuperuser` komutunu backend konteyneri içinde çalıştırın. Sizden istenen bilgileri (isim, e-posta, şifre) girin.

    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```

**Not:** Bu yönetici hesabını daha sonraki adımlarda "Yönetici Özelliklerini Test Etme" bölümünde kullanacaksınız.

---

## 4. Frontend Manuel Test Akışı

Aşağıdaki testleri gerçekleştirmek için web tarayıcınızı açın ve genellikle `http://localhost:5173` adresine gidin.

### 4.1. Kullanıcı Kaydı (Sign Up)

**Amaç:** Yeni bir kullanıcının başarılı bir şekilde kaydolabilmesi ve hatalı girişlerin doğru şekilde ele alınması.

| Test Senaryosu               | Adımlar                                                                                                                                                          | Beklenen Sonuç                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Başarılı Kayıt**           | 1. `http://localhost:5173/sign-up` adresine gidin. <br> 2. Formu geçerli ve benzersiz bilgilerle doldurun. <br> 3. "Sign Up" butonuna tıklayın.                  | Başarılı bir şekilde `/dashboard` sayfasına yönlendirilmelisiniz. Sağ üstte veya yan menüde kullanıcı adınızı görmelisiniz. |
| **Mevcut E-posta ile Kayıt** | 1. Oturumu kapatın. <br> 2. `http://localhost:5173/sign-up` adresine gidin. <br> 3. Bir önceki adımda kullandığınız e-posta adresiyle tekrar kaydolmayı deneyin. | Formun üstünde "A user with this email address already exists." gibi bir hata mesajı görünmelidir.                          |
| **Uyuşmayan Şifreler**       | 1. "Password" ve "Confirm Password" alanlarına farklı şifreler girin. <br> 2. "Sign Up" butonuna tıklayın.                                                       | "Confirm Password" alanının altında "The passwords do not match" gibi bir hata mesajı görünmelidir.                         |
| **Zayıf Şifre**              | 1. Şifre alanına 8 karakterden daha kısa bir şifre girin (örneğin "123"). <br> 2. "Sign Up" butonuna tıklayın.                                                   | Şifre alanının altında "Password must be at least 8 characters" gibi bir hata mesajı görünmelidir.                          |

### 4.2. Kullanıcı Girişi (Sign In)

**Amaç:** Kayıtlı bir kullanıcının giriş yapabilmesi ve hatalı girişlerin doğru şekilde ele alınması.

| Test Senaryosu             | Adımlar                                                                                                                                                                 | Beklenen Sonuç                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Başarılı Giriş**         | 1. Oturumu kapatın. <br> 2. `http://localhost:5173/sign-in` adresine gidin. <br> 3. Kayıtlı kullanıcı bilgileriyle formu doldurun. <br> 4. "Sign In" butonuna tıklayın. | Başarılı bir şekilde `/dashboard` sayfasına yönlendirilmelisiniz.                                      |
| **Yanlış Şifre ile Giriş** | 1. Oturumu kapatın. <br> 2. `http://localhost:5173/sign-in` adresine gidin. <br> 3. Geçerli bir e-posta ama yanlış bir şifre girin.                                     | Formun üstünde "No active account found with the given credentials" gibi bir hata mesajı görünmelidir. |

### 4.3. Şifre Sıfırlama (Password Reset)

**Amaç:** Kullanıcının şifresini unuttuğunda sıfırlama talebinde bulunabilmesi.

1.  **Talep Gönderme:**
    1.  `http://localhost:5173/sign-in` sayfasına gidin.
    2.  "Forgot your password?" linkine tıklayın.
    3.  Açılan pencereye kayıtlı kullanıcının e-posta adresini girin ve "Continue" butonuna tıklayın.
    4.  "If an account with that email exists, we've sent a link to reset your password." mesajını görmelisiniz.
2.  **Şifre Sıfırlama Linkini Alma:**
    1.  Backend servisinin loglarını görüntülemek için bir terminal açın ve şu komutu çalıştırın:
        ```bash
        docker-compose logs -f backend
        ```
    2.  Loglarda, şifre sıfırlama linkini içeren bir e-posta çıktısı görmelisiniz. Link `http://.../reset-password/confirm/...` gibi bir yapıda olacaktır.
    3.  Bu linki kopyalayın.
3.  **Yeni Şifre Belirleme:**
    1.  Kopyaladığınız linki tarayıcınızın adres çubuğuna yapıştırın ve gidin.
    2.  Açılan sayfada yeni şifrenizi girin, onaylayın ve formu gönderin.
    3.  Başarılı bir şekilde şifrenizin değiştirildiğine dair bir onay mesajı almalısınız.
    4.  Yeni şifrenizle giriş yapmayı deneyin.

### 4.4. Profil Yönetimi (Giriş Yapmış Kullanıcı)

**Amaç:** Giriş yapmış bir kullanıcının profil bilgilerini yönetebilmesi.

1.  Standart bir kullanıcı ile `/dashboard` adresine giriş yapın.
2.  Yan menüden "Profile" linkine tıklayın.
3.  **Bilgileri Güncelleme:**
    1.  "Profile Information" sekmesinde, "Edit" butonuna tıklayın.
    2.  İsim ve soyisim alanlarını değiştirin ve "Save" butonuna tıklayın.
    3.  "Profile information updated successfully" bildirimini görmelisiniz. Sayfayı yenilediğinizde yan menüdeki ismin de güncellendiğini kontrol edin.
4.  **Şifre Değiştirme:**
    1.  "Password Reset" sekmesine geçin.
    2.  Mevcut şifrenizi ve yeni bir şifreyi (iki kez) girerek formu gönderin.
    3.  "Password updated successfully" bildirimini görmelisiniz.
    4.  Oturumu kapatıp yeni şifrenizle tekrar giriş yapmayı deneyin.
5.  **Hesabı Silme:**
    1.  "Delete Account" sekmesine geçin.
    2.  "Delete My Account" butonuna tıklayın.
    3.  Açılan onay penceresinde "Yes, Delete" butonuna tıklayın.
    4.  Hesabınızın silindiğine ve çıkış yapıldığına dair bir bildirim almalı ve `sign-in` sayfasına yönlendirilmelisiniz.
    5.  Silinen hesapla tekrar giriş yapmayı deneyin (başarısız olmalı).

### 4.5. Yönetici Özelliklerini Test Etme (Admin)

**Amaç:** Yönetici yetkilerine sahip bir kullanıcının kullanıcıları yönetebilmesi.

1.  Daha önce oluşturduğunuz **yönetici (admin)** hesabıyla `/dashboard` adresine giriş yapın.
2.  **Admin Arayüzüne Erişim:**
    - Yan menüde "ADMIN" başlığı altında "User Management" linkini görmelisiniz. Bu linke tıklayın.
3.  **Kullanıcı Ekleme:**
    1.  "Add User" butonuna tıklayın.
    2.  Açılan modalda yeni bir kullanıcı için bilgileri doldurun (rolünü "User" olarak bırakın) ve kaydedin.
    3.  "User created successfully" bildirimini ve yeni kullanıcının listede göründüğünü doğrulayın.
4.  **Kullanıcı Detaylarını Görüntüleme:**
    - Listeden herhangi bir kullanıcının satırındaki "göz" (View) ikonuna tıklayın. Kullanıcının detaylarının bulunduğu bir modal açılmalıdır.
5.  **Kullanıcı Düzenleme:**
    1.  Listeden standart bir kullanıcının satırındaki "kalem" (Edit) ikonuna tıklayın.
    2.  Açılan modalda kullanıcının rolünü "Admin" olarak, durumunu "Inactive" olarak değiştirin ve kaydedin.
    3.  "User updated successfully" bildirimini ve listedeki değişiklikleri doğrulayın.
6.  **Kullanıcı Silme:**
    1.  Listeden bir kullanıcının satırındaki "çöp kutusu" (Delete) ikonuna tıklayın.
    2.  Açılan onay penceresinde "Confirm" butonuna tıklayın.
    3.  "User deleted successfully" bildirimini görmeli ve kullanıcının listeden kaldırıldığını doğrulamalısınız.

### 4.6. Güvenlik ve Token Yönetimi (Gelişmiş)

**Amaç:** Tokenların (JWT) belirtilen güvenlik politikasına uygun olarak yönetildiğini doğrulamak.

1.  Herhangi bir sayfadayken tarayıcınızın Geliştirici Araçları'nı açın (F12 veya `Ctrl+Shift+I`).
2.  **Giriş Yapma:**
    1.  "Application" (veya "Storage") sekmesine gidin. `Local Storage` altında `auth-storage` anahtarını bulun. `accessToken`'in burada **olmadığını** doğrulayın. `user` ve `isAuthenticated` bilgilerinin burada olması beklenir.
    2.  `Cookies` bölümüne gidin. `refresh_token` adında bir çerezin `HttpOnly` olarak ayarlandığını (JavaScript tarafından erişilemez) doğrulayın.
    3.  "Network" sekmesine gidin. `/token/` isteğini inceleyin. Yanıtın (response body) içinde bir `access_token` olduğunu doğrulayın.
3.  **Oturumu Kapatma (Logout):**
    - "Logout" butonuna tıkladıktan sonra `localStorage`'daki `auth-storage`'ın temizlendiğini ve `refresh_token` çerezinin silindiğini doğrulayın.

Bu test adımlarını tamamladığınızda, kullanıcı yönetimi ve kimlik doğrulama sisteminizin hem backend hem de frontend tarafında beklendiği gibi çalıştığından emin olabilirsiniz.
