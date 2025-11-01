# Sonken Dashboard - Kullanım Kılavuzu

## 📊 Dashboard Özellikleri

Sonken Dashboard, web sitelerinizi ve sunucunuzu gerçek zamanlı olarak izlemenize ve yönetmenize olanak tanır.

## 🎯 Ana Özellikler

### 1. Genel Bakış (Overview)
Dashboard'un ana sayfası, sisteminizin genel durumunu gösterir:

- **Aktif Siteler**: Çalışan web sitelerinin sayısı
- **Toplam Trafik**: Kullanılan toplam internet miktarı (MB/GB)
- **CPU Kullanımı**: İşlemci kullanım yüzdesi
- **RAM Kullanımı**: Bellek kullanım yüzdesi

#### Grafikler
- **Trafik İstatistikleri**: Gelen ve giden trafik grafiği (günlük/haftalık/aylık)
- **Sistem Kaynakları**: CPU, RAM ve Disk kullanımı dairesel grafik
- **Aktif Siteler Tablosu**: Her sitenin detaylı metriklerini gösterir

### 2. Siteler (Sites)
Tüm web sitelerinizi buradan yönetebilirsiniz:

- Site adı ve URL
- Durum (Çevrimiçi/Çevrimdışı)
- **Trafik bilgisi**: Her sitenin kullandığı internet miktarı
- **İstek sayısı**: Toplam HTTP istekleri
- **Ortalama yanıt süresi**: Performans göstergesi

#### Site İşlemleri
- Yeni site ekleme
- Site detaylarını görüntüleme
- Site durdurma/başlatma

### 3. Veritabanları (Databases)
MySQL ve MongoDB veritabanlarınızı yönetin:

#### MySQL
- Veritabanı sayısı
- Aktif bağlantılar
- Saniyedeki sorgu sayısı
- PhpMyAdmin'e doğrudan erişim

#### MongoDB
- Koleksiyon sayısı
- Döküman sayısı
- Toplam boyut
- Mongo Express'e doğrudan erişim

### 4. Performans (Performance)
Detaylı sistem performans metrikleri:

#### CPU Metrikleri
- Kullanım yüzdesi (gauge grafik)
- Çekirdek sayısı
- Yük ortalaması

#### Bellek Metrikleri
- Kullanım yüzdesi (gauge grafik)
- Toplam RAM
- Kullanılabilir RAM

#### Disk Kullanımı
- Disk bölümlerinin kullanım yüzdesi
- Progress bar gösterimleri

#### Ağ Trafiği
- Son 24 saat trafik grafiği
- Saatlik dökümler

### 5. Loglar (Logs)
Sistem olaylarını takip edin:

- **Seviye filtreleme**: Info, Warning, Error
- **Gerçek zamanlı güncelleme**: Yeni loglar otomatik eklenir
- **Dışa aktarma**: Logları dosya olarak kaydedin
- **Temizleme**: Eski logları silin

Log Seviyeleri:
- 🔵 **INFO**: Genel bilgilendirme
- 🟡 **WARN**: Uyarılar
- 🔴 **ERROR**: Hatalar

### 6. Ayarlar (Settings)
Uygulamayı yapılandırın:

#### Genel Ayarlar
- Uygulama adı
- Port numarası
- Maksimum upload boyutu

#### Bildirim Ayarları
- Email bildirimleri
- Performans uyarıları
- Günlük raporlar

## 🔄 Gerçek Zamanlı Özellikler

Dashboard her 5 saniyede bir otomatik olarak güncellenir:

- Sistem kaynakları (CPU, RAM)
- Trafik istatistikleri
- Site durumları
- Yeni log girişleri

### Güncelleme Butonu
Sağ üstteki yenileme butonuna tıklayarak anında güncelleme yapabilirsiniz.

## 📈 Metrik API'leri

Dashboard, aşağıdaki API endpoint'lerini kullanır:

### Site Metrikleri
```
GET /api/metrics/sites/metrics
```
Tüm sitelerin metriklerini döndürür.

**Yanıt:**
```json
{
  "success": true,
  "metrics": [
    {
      "site": "localhost:3000",
      "requestCount": 1523,
      "bytesReceived": 1200000,
      "bytesSent": 850000,
      "bytesReceivedMB": "1.14",
      "bytesSentMB": "0.81",
      "totalTrafficMB": "1.95",
      "errorCount": 5,
      "avgResponseTime": 45,
      "lastRequest": "2025-11-01T10:30:00Z"
    }
  ]
}
```

### Sistem Metrikleri
```
GET /api/metrics/system/realtime
```
Gerçek zamanlı sistem durumu.

**Yanıt:**
```json
{
  "success": true,
  "timestamp": "2025-11-01T10:30:00Z",
  "cpu": {
    "usage": 45,
    "cores": 8,
    "model": "Intel Core i7",
    "speed": 2400
  },
  "memory": {
    "total": 17179869184,
    "free": 8589934592,
    "used": 8589934592,
    "usagePercent": "50.00",
    "totalGB": "16.00",
    "freeGB": "8.00",
    "usedGB": "8.00"
  }
}
```

### Bandwidth Kullanımı
```
GET /api/metrics/bandwidth
```
Toplam internet kullanımı.

**Yanıt:**
```json
{
  "success": true,
  "bandwidth": {
    "received": 1200000000,
    "sent": 850000000,
    "total": 2050000000,
    "receivedMB": "1144.41",
    "sentMB": "810.62",
    "totalMB": "1955.03",
    "receivedGB": "1.12",
    "sentGB": "0.79",
    "totalGB": "1.91"
  }
}
```

### Trafik Geçmişi
```
GET /api/metrics/traffic/history?period=day
```
Zaman içinde trafik geçmişi.

Parametreler:
- `period`: day, week, month

### Performans Metrikleri
```
GET /api/metrics/performance
```
Detaylı performans bilgileri.

### Aktif Bağlantılar
```
GET /api/metrics/connections/active
```
Şu anda aktif olan bağlantılar.

## 🎨 Kullanıcı Arayüzü

### Navigasyon
Sol taraftaki sidebar menüsünden farklı bölümler arasında geçiş yapabilirsiniz.

### Arama
Sağ üstteki arama kutusu ile hızlı arama yapabilirsiniz.

### Bildirimler
Bildirim simgesine tıklayarak sistem bildirimlerini görebilirsiniz.

## 🔒 Güvenlik

- Dashboard varsayılan olarak kimlik doğrulama gerektirmez
- Üretim ortamında mutlaka kimlik doğrulama ekleyin
- HTTPS kullanımı önerilir

## 📱 Responsive Tasarım

Dashboard tüm cihazlarda çalışacak şekilde tasarlanmıştır:
- Masaüstü (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobil (375px)

## 💡 İpuçları

1. **Performans İzleme**: CPU kullanımı %80'i geçerse sistem yavaşlayabilir
2. **Trafik Takibi**: Anormal trafik artışları için logları kontrol edin
3. **Düzenli Yedekleme**: Veritabanlarınızı düzenli olarak yedekleyin
4. **Log Yönetimi**: Logları periyodik olarak temizleyin
5. **Kaynak Optimizasyonu**: Kullanılmayan siteleri durdurun

## 🆘 Sorun Giderme

### Dashboard Açılmıyor
1. Sunucunun çalıştığından emin olun
2. Port 3000'in açık olduğunu kontrol edin
3. Tarayıcı önbelleğini temizleyin

### Veriler Güncellenmiyor
1. İnternet bağlantınızı kontrol edin
2. Tarayıcı konsolunu kontrol edin (F12)
3. Sunucu loglarını inceleyin

### Yavaş Performans
1. Çok fazla site çalışıyor olabilir
2. Sistem kaynaklarını kontrol edin
3. Veritabanı bağlantılarını optimize edin

## 📞 Destek

Sorunlarınız için:
- GitHub Issues: https://github.com/UmutKavil/Sonken/issues
- Dokümantasyon: README.md

---

**Sonken Dashboard** - Güçlü ve Kullanıcı Dostu! 🚀
