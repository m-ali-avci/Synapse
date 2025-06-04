# Kitapsever Login Sistemi Entegrasyonu Raporu

## Genel Bakış
Bu rapor, Kitapsever kitap arama web sitesine eklenen güvenli login sistemi hakkında bilgi vermektedir. Sistem, kullanıcıların kayıt olmasına, giriş yapmasına ve JWT token ile korumalı içeriklere erişmesine olanak tanır.

## Teknik Özellikler

### Backend
- **Node.js ve Express**: Sunucu tarafı işlemler için kullanıldı
- **MongoDB**: Kullanıcı verilerini saklamak için kullanıldı
- **bcrypt**: Şifreleri güvenli şekilde hashlemek için kullanıldı
- **JWT (JSON Web Token)**: Kullanıcı kimlik doğrulaması için kullanıldı

### Frontend
- **HTML/CSS/JavaScript**: Kullanıcı arayüzü için kullanıldı
- **Bootstrap**: Responsive tasarım için kullanıldı
- **localStorage**: JWT token ve kullanıcı bilgilerini saklamak için kullanıldı

## Eklenen Özellikler

1. **Kullanıcı Kaydı (Register)**
   - Ad, soyad, e-posta ve şifre ile kayıt
   - Şifre güvenliği için bcrypt ile hashleme
   - E-posta benzersizlik kontrolü

2. **Kullanıcı Girişi (Login)**
   - E-posta ve şifre ile giriş
   - JWT token üretimi ve localStorage'a kaydetme
   - Hatalı giriş durumunda kullanıcıya bilgi verme

3. **JWT Doğrulama Middleware**
   - Korumalı rotalar için token kontrolü
   - Yetkisiz erişim engelleme
   - Token süresi kontrolü

4. **Kullanıcı Arayüzü Entegrasyonu**
   - Giriş durumuna göre navbar güncelleme
   - Kullanıcı adı gösterme ve çıkış yapma seçeneği
   - Korumalı içeriklere erişim kontrolü (örn. yorum yapma)

## Dosya Yapısı

```
kitapsever/
├── backend-deploy/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js    # Kullanıcı işlemleri kontrolcüsü
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT doğrulama middleware
│   │   ├── models/
│   │   │   └── User.js              # Kullanıcı modeli
│   │   ├── routes/
│   │   │   └── authRoutes.js        # Kimlik doğrulama rotaları
│   │   └── main.js                  # Ana uygulama dosyası
├── js/
│   ├── auth.js                      # Frontend kimlik doğrulama işlemleri
│   ├── comments.js                  # Yorum işlemleri (JWT korumalı)
│   └── index.js                     # Ana sayfa entegrasyonu
├── login.html                       # Giriş sayfası
└── register.html                    # Kayıt sayfası
```

## API Uç Noktaları

1. **POST /api/auth/register**
   - Yeni kullanıcı kaydı
   - Gerekli alanlar: firstName, lastName, email, password

2. **POST /api/auth/login**
   - Kullanıcı girişi
   - Gerekli alanlar: email, password
   - Dönüş: JWT token ve kullanıcı bilgileri

3. **GET /api/auth/me**
   - Mevcut kullanıcı bilgilerini getir
   - Gerekli: Authorization header (Bearer token)

## Kullanım Kılavuzu

### Kurulum
1. Backend klasöründe `npm install` komutunu çalıştırın
2. MongoDB bağlantı bilgilerini `.env` dosyasında ayarlayın
3. `npm start` komutu ile sunucuyu başlatın

### Kullanıcı Kaydı
1. "Kayıt Ol" sayfasına gidin
2. Ad, soyad, e-posta ve şifre bilgilerini girin
3. "Kayıt Ol" butonuna tıklayın

### Kullanıcı Girişi
1. "Giriş Yap" sayfasına gidin
2. E-posta ve şifre bilgilerini girin
3. "Giriş Yap" butonuna tıklayın

### Korumalı İçeriklere Erişim
- Giriş yaptıktan sonra, yorum yapma gibi korumalı içeriklere erişebilirsiniz
- JWT token otomatik olarak API isteklerine eklenir
- Çıkış yapmak için sağ üstteki kullanıcı menüsünden "Çıkış Yap" seçeneğini kullanın

## Güvenlik Özellikleri
- Şifreler bcrypt ile hashlenmiştir, açık metin olarak saklanmaz
- JWT token'lar 24 saat geçerlidir
- Yetkisiz erişim denemeleri engellenir
- Giriş/kayıt formları client-side ve server-side doğrulama içerir

## Özelleştirme
- JWT token süresi `authController.js` dosyasında değiştirilebilir
- Şifre hashleme güvenlik seviyesi `User.js` dosyasında ayarlanabilir
- UI tasarımı Bootstrap sınıfları ile özelleştirilebilir
