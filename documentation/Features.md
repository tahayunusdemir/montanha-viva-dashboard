# Montanha Viva - Uygulama Tanıtımı (YouTube Video Metni)

**(Video Giriş Müziği)**

**Sunucu:** Merhaba ve hoş geldiniz! Bugün, kullanıcıları teknoloji aracılığıyla doğayla buluşturmak için tasarlanmış kapsamlı bir web uygulaması olan **Montanha Viva**'yı derinlemesine inceliyoruz. Yürüyüş rotalarını keşfetmekten yapay zeka ile bitkileri tanımlamaya kadar, bu platform maceraperestler ve doğa severler için özelliklerle dolu. Hadi başlayalım!

---

### Bölüm 1: Genel Deneyim - Montanha Viva'ya Hoş Geldiniz

**Sunucu:** Yolculuğumuz ana sayfada başlıyor. Material-UI şablonları kullanılarak modern ve profesyonel bir tasarımla oluşturulan bu sayfa, uygulamaya ana giriş kapısı görevi görüyor.

*   **(Ana Sayfayı Göster)**: Burada, projenin misyonuna dair kısa bir genel bakış ve ana özellikleri vurgulayan bilgiler bulacaksınız. Navigasyon temiz ve sezgisel. Yeni kullanıcılar için "Kayıt Ol" butonu hemen burada. Geri dönen kullanıcılar için ise "Giriş Yap" sadece bir tık uzakta. Uygulama çubuğu da akıllı; eğer çıkış yapmış durumdaysanız kimlik doğrulama seçeneklerini, giriş yapmış durumdaysanız "Kontrol Paneli" butonunu gösteriyor.

**Sunucu:** Şimdi sorunsuz kimlik doğrulama sürecini inceleyelim.

*   **(Kayıt Ol Sayfasını Göster)**: Bir hesap oluşturmak çok basit. Adınızı, soyadınızı, e-postanızı ve güçlü bir şifre istiyoruz. Sistem, şifrenizin en başından itibaren güvende olmasını sağlamak için Django'nun yerleşik doğrulayıcılarını kullanıyor.
*   **(Giriş Yap Sayfasını Göster)**: Giriş yapmak da bir o kadar kolay. Şifrenizi unuttuysanız endişelenmeyin. "Şifremi Unuttum" bağlantısına e-postanızı girmeniz yeterli; gelen kutunuza bir şifre sıfırlama bağlantısı gönderilecektir. Bu işlem arka uç tarafından güvenli bir şekilde yönetiliyor.
*   **Sorunsuz Başlangıç**: Buradaki en güzel şeylerden biri, başarılı bir kayıttan sonra arka ucun anında kimlik doğrulama token'larını döndürmesidir. Bu, tekrar oturum açmanıza gerek kalmadan giriş yaptığınız ve doğrudan kontrol paneline yönlendirildiğiniz anlamına gelir. Bu, harika bir kullanıcı deneyimi sağlayan küçük bir detay.

---

### Bölüm 2: Kullanıcı Kontrol Paneli - Kişisel Portalınız

**Sunucu:** Giriş yaptığınızda, Montanha Viva deneyiminin kalbi olan kişisel kontrol panelinize ulaşırsınız. Bu sadece tek bir sayfa değil; çok görünümlü bir portal.

*   **(Ana Kontrol Paneli Görünümünü Göster)**: Ana görünüm, size istatistikler ve grafiklerle hızlı bir genel bakış sunar. Maceranız için komuta merkezi burasıdır.
*   **(Profil Sayfasını Göster)**: "Profil" bölümünde hesabınız üzerinde tam kontrole sahipsiniz. Bu, sekmeli bir arayüzdür ve şunları yapabilirsiniz:
    *   Kişisel bilgilerinizi güncellemek.
    *   Şifrenizi güvenli bir şekilde değiştirmek.
    *   Ve ihtiyacınız olursa, hesabınızı silmek.
*   **(Hakkında Sayfasını Göster)**: "Hakkında" sayfası, Montanha Viva projesi, hedefleri ve ortakları hakkında daha derinlemesine bilgi sağlar.
*   **(Geri Bildirim Sayfasını Göster)**: Kullanıcı girdilerine değer veriyoruz! "Geri Bildirim Gönder" sayfasında hata raporları, özellik talepleri veya genel sorularınızı iletebilirsiniz. Gerekirse bir dosya bile ekleyebilirsiniz.

---

### Bölüm 3: Altın Özellikler - Doğa ile Etkileşim

**Sunucu:** Şimdi en heyecan verici kısımlara geldik! Bunlar, Montanha Viva'yı benzersiz kılan temel özellikler.

#### 1. Rota Ansiklopedisi

*   **(Rota Ansiklopedisi Sayfasını Göster)**: Bir sonraki yürüyüşünüzü planlamak hiç bu kadar kolay olmamıştı. "Rotalar" bölümünde, mevcut patikaların kapsamlı bir listesine göz atabilirsiniz.
*   Sizin için mükemmel macerayı bulmak için onları zorluk derecesine göre (Kolay, Orta, Zor) filtreleyebilirsiniz.
*   Herhangi bir rotaya tıklamak, mesafe, süre, yükseklik değişiklikleri, bir harita resmi ve hatta navigasyon cihazınız için indirilebilir bir GPX dosyası gibi ayrıntılı bilgilerin bulunduğu bir görünüm açar.

#### 2. Flora Ansiklopedisi

*   **(Flora Ansiklopedisi Sayfasını Göster)**: "Flora" ansiklopedimizde bölgenin zengin biyoçeşitliliğini keşfedin.
*   Bu bölüm, yerel bitkilerin aranabilir bir veritabanını sağlar.
*   Bir bitkiye tıklamak, bilimsel ve yaygın adları, fotoğrafları ve kullanım alanları ile yerel fauna ile etkileşimi hakkında büyüleyici bilgileri içeren ayrıntılı bir profil ortaya çıkarır.

#### 3. Yapay Zeka Bitki Tanımlayıcı (Şovun Yıldızı!)

*   **(Bitki Tanımlayıcı Sayfasını Göster)**: Sihrin gerçekleştiği yer burası. Hiç bir patikada yürürken "Bu hangi bitki?" diye merak ettiniz mi? Yapay Zeka Bitki Tanımlayıcımız ile saniyeler içinde öğrenebilirsiniz.
*   Cihazınızdan bitkinin bir fotoğrafını yüklemeniz yeterlidir.
*   Önceden eğitilmiş bir PyTorch modeli (YOLO) ile güçlendirilmiş arka ucumuz, görüntüyü analiz eder ve bir güvenilirlik puanıyla türün bir tahminini döndürür. Sanki cebinizde bir botanikçi varmış gibi!

#### 4. QR Kodları ve Oyunlaştırma

*   **(QR Kodları Sayfasını Göster)**: Keşfi daha da eğlenceli hale getirmek için dağ patikalarına QR kodları gizledik.
*   Uygulamadaki "QR Kodları" özelliğini kullanarak kameranızı açın ve onları tarayın.
*   Her benzersiz tarama size puan kazandırır ve sizi ödüllerin kilidini açmaya bir adım daha yaklaştırır!

#### 5. Puanlar ve Ödüller

*   **(Puanlar ve Ödüller Sayfasını Göster)**: Kazandığınız tüm puanlar "Puanlar ve Ödüller" sayfasında takip edilir.
*   Burada mevcut puan bakiyenizi ve tarama geçmişinizi görebilirsiniz.
*   Yeterince puan topladığınızda, bunları ortaklarımızdan indirim kuponları gibi ödüller için kullanabilirsiniz.

#### 6. Sensör Verileri

*   **(Sensör Verileri Sayfasını Göster)**: Veri meraklıları için bu sayfa, çeşitli istasyonlara yerleştirilmiş IoT sensörlerinden gelen gerçek zamanlı ve geçmiş verileri görüntülemenizi sağlar.
*   Bir istasyon seçebilir, bir tarih aralığı belirleyebilir ve sıcaklık, nem gibi belirli ölçümleri hem bir tabloda hem de bir grafikte görüntüleyebilirsiniz.

---

### Bölüm 4: Yönetici Güç Merkezi - Ekosistemi Yönetmek

**Sunucu:** Son olarak, yöneticiler için Montanha Viva, kontrol paneline entegre edilmiş güçlü ve güvenli bir yönetici paneli içerir. Bu, standart Django yönetici paneli değil; tüm uygulamanın içeriğini yönetmek için özel olarak oluşturulmuş, zengin özelliklere sahip bir arayüzdür.

*   **(Yönetici Kullanıcı Yönetimini Göster)**: Yöneticiler tüm kullanıcıları görüntüleyebilir, düzenleyebilir ve yönetebilir.
*   **(Yönetici Rota Yönetimini Göster)**: Yöneticiler, yürüyüş rotaları üzerinde tam CRUD (Oluştur, Oku, Güncelle, Sil) kontrolüne sahiptir. Kullanıcı dostu bir modal aracılığıyla yeni patikalar ekleyebilir, harita resimleri ve GPX dosyaları yükleyebilirler.
*   **(Yönetici Flora (Wiki) Yönetimini Göster)**: Bitki ansiklopedisinin yönetildiği yer burasıdır. Yöneticiler yeni bitki türleri ekleyebilir, birden fazla resim yükleyebilir ve tüm ayrıntılı bilgileri düzenleyebilir.
*   **(Yönetici Geri Bildirim Yönetimini Göster)**: Tüm kullanıcı geri bildirimleri burada yönetilir. Yöneticiler ayrıntıları görüntüleyebilir, durumu değiştirebilir (örneğin, 'Beklemede'den 'Çözüldü'ye) ve kullanıcılara yanıt verebilir.
*   **(Yönetici QR Yönetimini Göster)**: Yöneticiler, patikalara yerleştirilen QR kodlarını oluşturabilir ve yönetebilir, her biri için puan değerini belirleyebilir.

---

### Sonuç

**Sunucu:** Ve Montanha Viva uygulaması turumuzun sonuna geldik! Kullanıcı dostu genel sayfalarından ve güçlü interaktif özelliklerinden, kapsamlı yönetici paneline kadar, React, Django ve Docker gibi modern, sağlam teknolojilerle inşa edilmiş eksiksiz bir ekosistemdir.

İzlediğiniz için teşekkürler, umarız dışarı çıkıp keşfetmek için ilham almışsınızdır!

**(Video Çıkış Müziği)**