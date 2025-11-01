# Sonken Kurulum Kılavuzu

Bu kılavuz, Sonken'i sisteminize kurmanız ve çalıştırmanız için adım adım talimatlar içerir.

## 📋 Ön Koşullar

### Gerekli Yazılımlar

1. **Node.js ve npm**
   - Node.js 18.0.0 veya üzeri
   - npm 9.0.0 veya üzeri
   - İndirme: https://nodejs.org/

2. **Git**
   - Git kurulumu gereklidir
   - İndirme: https://git-scm.com/

3. **Veritabanları (Opsiyonel - Docker kullanmıyorsanız)**
   - MySQL 8.0 veya üzeri
   - MongoDB 7.0 veya üzeri

4. **Docker (Önerilen)**
   - Docker Desktop (Windows/Mac) veya Docker Engine (Linux)
   - Docker Compose
   - İndirme: https://www.docker.com/

## 🚀 Kurulum Adımları

### Yöntem 1: Docker ile Kurulum (Önerilen)

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/UmutKavil/Sonken.git
cd Sonken
```

2. **Environment dosyasını oluşturun:**
```bash
copy .env.example .env
```

3. **Docker container'larını başlatın:**
```bash
docker-compose up -d
```

4. **Kontrol edin:**
- Ana Uygulama: http://localhost:3000
- PhpMyAdmin: http://localhost:8080
- Mongo Express: http://localhost:8081

### Yöntem 2: Manuel Kurulum

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/UmutKavil/Sonken.git
cd Sonken
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **MySQL ve MongoDB'yi kurun ve başlatın**
   - MySQL'i kurun ve çalıştırın
   - MongoDB'yi kurun ve çalıştırın

4. **Environment dosyasını düzenleyin:**
```bash
copy .env.example .env
```

`.env` dosyasını açın ve veritabanı bağlantı bilgilerinizi girin:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=sonken

MONGODB_URI=mongodb://localhost:27017/sonken
```

5. **Veritabanlarını başlatın:**

MySQL için:
```bash
mysql -u root -p < docker/mysql/init/init.sql
```

MongoDB için:
```bash
mongosh < docker/mongodb/init/init.js
```

6. **Uygulamayı başlatın:**
```bash
npm start
```

veya geliştirme modu için:
```bash
npm run dev
```

## 🔧 Yapılandırma

### .env Dosyası Ayarları

```env
# Sunucu Ayarları
NODE_ENV=development
PORT=3000

# MySQL Yapılandırması
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=sonken

# MongoDB Yapılandırması
MONGODB_URI=mongodb://localhost:27017/sonken
MONGODB_HOST=localhost
MONGODB_PORT=27017

# Güvenlik
JWT_SECRET=rastgele_guvenli_bir_anahtar_olusturun
SESSION_SECRET=rastgele_guvenli_bir_anahtar_olusturun

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu_bir_sifre_olusturun
ADMIN_EMAIL=admin@sonken.local

# Sunucu Ayarları
MAX_UPLOAD_SIZE=50mb
LOG_LEVEL=info
```

### Güvenlik Notları

- Üretim ortamında mutlaka güçlü şifreler kullanın
- JWT_SECRET ve SESSION_SECRET için uzun ve karmaşık anahtarlar oluşturun
- Varsayılan admin şifresini değiştirin
- .env dosyasını asla Git'e commit etmeyin

## 🧪 Test

Kurulumun başarılı olduğunu doğrulamak için:

1. **Sağlık kontrolü:**
```bash
curl http://localhost:3000/health
```

2. **API testi:**
```bash
curl http://localhost:3000/api/info
```

3. **Veritabanı bağlantı testi:**
```bash
curl http://localhost:3000/api/database/test
```

## 🐛 Sorun Giderme

### Port zaten kullanımda

Eğer 3000 portu kullanılıyorsa, `.env` dosyasında farklı bir port belirleyin:
```env
PORT=3001
```

### MySQL bağlantı hatası

1. MySQL servisinin çalıştığından emin olun
2. Kullanıcı adı ve şifrenin doğru olduğunu kontrol edin
3. Veritabanının oluşturulduğunu kontrol edin

### MongoDB bağlantı hatası

1. MongoDB servisinin çalıştığından emin olun
2. Connection string'in doğru olduğunu kontrol edin
3. MongoDB'nin 27017 portunda dinlediğini kontrol edin

### Docker sorunları

Docker container'larını yeniden başlatın:
```bash
docker-compose down
docker-compose up -d --build
```

Logları kontrol edin:
```bash
docker-compose logs -f
```

## 📚 Sonraki Adımlar

1. [API Dokümantasyonu](API.md) - API endpoint'lerini öğrenin
2. [Geliştirme Kılavuzu](DEVELOPMENT.md) - Projeye katkıda bulunun
3. [Kullanıcı Kılavuzu](USER_GUIDE.md) - Sonken'i nasıl kullanacağınızı öğrenin

## 💬 Destek

Sorun yaşıyorsanız:
- GitHub Issues: https://github.com/UmutKavil/Sonken/issues
- Email: admin@sonken.local

## ✅ Kurulum Kontrol Listesi

- [ ] Node.js ve npm kuruldu
- [ ] Git kuruldu
- [ ] Docker kuruldu (opsiyonel)
- [ ] Proje klonlandı
- [ ] Bağımlılıklar yüklendi
- [ ] .env dosyası yapılandırıldı
- [ ] Veritabanları çalışıyor
- [ ] Uygulama başarıyla başlatıldı
- [ ] Sağlık kontrolü başarılı
- [ ] Admin paneline erişim sağlandı

Tebrikler! Sonken başarıyla kuruldu. 🎉
