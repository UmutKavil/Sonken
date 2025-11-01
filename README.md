# 🚀 Sonken - Modern Yerel Geliştirme Ortamı

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Sonken**, XAMPP'nin modern ve güçlü bir alternatifidir. Node.js tabanlı, Docker destekli ve kullanıcı dostu arayüzü ile yerel geliştirme ortamınızı kolayca yönetin.

## ✨ Özellikler

- 🌐 **Modern Web Sunucusu**: Express.js tabanlı hızlı ve güvenilir web sunucusu
- 🗄️ **Çoklu Veritabanı Desteği**: MySQL ve MongoDB entegrasyonu
- 🎨 **Web Tabanlı Yönetim**: Tarayıcıdan erişilebilen modern dashboard
- 📊 **Gerçek Zamanlı İzleme**: Site trafiği, CPU, RAM, disk kullanımı
- 📈 **Trafik Analizi**: Her sitenin internet kullanımını detaylı izleme
- 🐳 **Docker Desteği**: Kolay kurulum ve dağıtım
- 🔒 **Güvenlik**: Modern güvenlik önlemleri ve best practices
- ️ **Kolay Yapılandırma**: .env dosyası ile basit ayarlar
- 📝 **Canlı Loglar**: Gerçek zamanlı sistem olayları
- 🔄 **RESTful API**: Kapsamlı API endpoint'leri
- ⚡ **Yüksek Performans**: Optimize edilmiş kod yapısı
- 📱 **Responsive Tasarım**: Tüm cihazlarda sorunsuz çalışır

## 📋 Gereksinimler

- **Node.js** 18.0.0 veya üzeri
- **npm** 9.0.0 veya üzeri
- **Tarayıcı** (Chrome, Firefox, Edge, Safari)
- Docker ve Docker Compose (opsiyonel)
- MySQL 8.0 (Docker kullanmıyorsanız)
- MongoDB 7.0 (Docker kullanmıyorsanız)

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/UmutKavil/Sonken.git
cd Sonken
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyerek kendi ayarlarınızı yapın.

### 4. Sunucuyu Başlatın

#### Normal Başlatma:
```bash
npm start
```

#### Geliştirme Modu (Hot Reload):
```bash
npm run dev
```

#### Docker ile Başlatma:
```bash
npm run docker:up
```

Sunucu başlatıldıktan sonra:
- **Ana Sayfa**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`

## 🐳 Docker Kullanımı

### Tüm Servisleri Başlatma
```bash
docker-compose up -d
```

### Servisleri Durdurma
```bash
docker-compose down
```

### Logları Görüntüleme
```bash
docker-compose logs -f
```

### Docker ile Çalışan Servisler

- **Sonken App**: `http://localhost:3000`
- **MySQL**: Port `3306`
- **MongoDB**: Port `27017`
- **PhpMyAdmin**: `http://localhost:8080`
- **Mongo Express**: `http://localhost:8081`

## 📁 Proje Yapısı

```
Sonken/
├── src/
│   ├── config/          # Yapılandırma dosyaları
│   │   └── database.js  # Veritabanı bağlantıları
│   ├── routes/          # API route'ları
│   │   ├── api.js       # Genel API endpoint'leri
│   │   ├── database.js  # Veritabanı API'leri
│   │   └── server.js    # Sunucu yönetim API'leri
│   ├── middleware/      # Express middleware'leri
│   │   └── errorHandler.js
│   ├── utils/           # Yardımcı fonksiyonlar
│   │   └── logger.js    # Loglama sistemi
│   └── index.js         # Ana uygulama dosyası
├── public/              # Statik dosyalar
│   └── index.html       # Ana sayfa
├── logs/                # Log dosyaları
├── docker-compose.yml   # Docker Compose yapılandırması
├── Dockerfile           # Docker image tanımı
├── package.json         # NPM bağımlılıkları
├── .env.example         # Örnek ortam değişkenleri
├── .gitignore          # Git ignore kuralları
└── README.md           # Bu dosya
```

## 🎨 Dashboard

Sonken modern bir web arayüzü ile gelir. Dashboard'a erişmek için:

```
http://localhost:3000/dashboard
```

### Dashboard Özellikleri

- 📊 **Gerçek Zamanlı İzleme**: CPU, RAM, Disk kullanımı
- 🌐 **Site Yönetimi**: Tüm sitelerinizi tek yerden yönetin
- 📈 **Trafik İstatistikleri**: Her sitenin internet kullanımını görün
- 🗄️ **Veritabanı Yönetimi**: MySQL ve MongoDB kontrolü
- 📝 **Canlı Loglar**: Sistem olaylarını gerçek zamanlı takip edin
- ⚡ **Performans Metrikleri**: Detaylı sistem performans analizi

Detaylı kullanım için: [Dashboard Kullanım Kılavuzu](DASHBOARD.md)

## 🔌 API Endpoints

### Sistem Bilgisi
```
GET /api/info
```
Sonken sistem bilgilerini döndürür.

### Sistem Durumu
```
GET /api/status
```
Tüm servislerin durumunu kontrol eder.

### Sağlık Kontrolü
```
GET /health
```
Uygulamanın sağlık durumunu döndürür.

### MySQL Veritabanları
```
GET /api/database/mysql/databases
```
Tüm MySQL veritabanlarını listeler.

### MySQL Tabloları
```
GET /api/database/mysql/tables/:database
```
Belirtilen veritabanındaki tabloları listeler.

### MongoDB Koleksiyonları
```
GET /api/database/mongodb/collections
```
Tüm MongoDB koleksiyonlarını listeler.

### Veritabanı Bağlantı Testi
```
GET /api/database/test
```
MySQL ve MongoDB bağlantılarını test eder.

### Sunucu Bilgileri
```
GET /api/server/info
```
Sunucu donanım ve sistem bilgilerini döndürür.

### Metrik Endpoints

#### Site Metrikleri
```
GET /api/metrics/sites/metrics
```
Tüm sitelerin trafik ve performans metriklerini döndürür.

#### Gerçek Zamanlı Sistem Metrikleri
```
GET /api/metrics/system/realtime
```
CPU, RAM ve sistem kaynaklarının anlık durumunu döndürür.

#### Bandwidth Kullanımı
```
GET /api/metrics/bandwidth
```
Toplam internet kullanımını (gelen/giden) döndürür.

#### Trafik Geçmişi
```
GET /api/metrics/traffic/history?period=day
```
Belirtilen süre için trafik geçmişini döndürür.

#### Performans Metrikleri
```
GET /api/metrics/performance
```
Detaylı performans metriklerini döndürür.

## ⚙️ Yapılandırma

### .env Dosyası

```env
# Server Settings
NODE_ENV=development
PORT=3000

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=sonken

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sonken
MONGODB_HOST=localhost
MONGODB_PORT=27017

# Security
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@sonken.local
```

## 🛠️ Geliştirme

### Kod Stili
Proje ESLint kullanmaktadır. Kodu kontrol etmek için:

```bash
npm run lint
```

### Test
Testleri çalıştırmak için:

```bash
npm test
```

## 📝 Loglar

Tüm sistem logları `logs/sonken.log` dosyasında saklanır. Log seviyeleri:

- **INFO**: Genel bilgilendirme mesajları
- **WARN**: Uyarı mesajları
- **ERROR**: Hata mesajları
- **DEBUG**: Geliştirme modu detaylı loglar

## 🔒 Güvenlik

- Helmet.js ile HTTP güvenlik başlıkları
- CORS koruması
- JWT tabanlı kimlik doğrulama hazır
- Şifre hashleme (bcrypt)
- Rate limiting desteği
- SQL injection koruması

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Umut Kavil**
- GitHub: [@UmutKavil](https://github.com/UmutKavil)

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz! Sorularınız ve önerileriniz için issue açabilirsiniz.

---

**Sonken** - Modern geliştirme ortamınız, artık daha güçlü! 🚀