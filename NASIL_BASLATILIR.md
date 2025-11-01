# 🚀 Sonken Nasıl Başlatılır?

## Seçenek 1: Normal Başlatma (Önerilen) - Port 8080

Yönetici yetkisi **GEREKMİYOR**

```powershell
.\start.ps1
```

Sonra tarayıcıda: **`http://localhost:8080`**

---

## Seçenek 2: Port 80 ile Başlatma (sadece localhost)

Yönetici yetkisi **GEREKİYOR**

1. PowerShell'i **SAĞ TIKLAYIP** → **"Yönetici olarak çalıştır"**
2. Şu komutu çalıştır:

```powershell
.\start-admin.ps1
```

Sonra tarayıcıda: **`http://localhost`** (port yazmaya gerek yok!)

---

## Seçenek 3: Manuel Başlatma

```powershell
npm run dev
```

**Not:** Bu port 80 kullanır ve yönetici yetkisi gerektirir!

---

## 🌐 Ağdan Erişim

Aynı WiFi ağındaki cihazlardan erişmek için:

1. Bilgisayarınızın IP adresini öğrenin:
   ```powershell
   ipconfig
   ```
   Örnek: `192.168.1.100`

2. Diğer cihazlardan şu adresi açın:
   - Port 8080: `http://192.168.1.100:8080`
   - Port 80: `http://192.168.1.100`

---

## ⚙️ Port Değiştirme

`frontend/vite.config.js` dosyasında:

```javascript
server: {
  port: 8080,  // İstediğiniz portu yazın
  host: '0.0.0.0',
  ...
}
```

---

## ❓ Sorun Giderme

### "Port zaten kullanımda" Hatası

```powershell
# Hangi program port kullanıyor?
netstat -ano | findstr :80

# Programı kapat (PID numarasıyla)
taskkill /PID [PID_NUMARASI] /F
```

### "Yönetici yetkisi gerekiyor" Hatası

- Port 80 kullanıyorsanız → PowerShell'i yönetici olarak çalıştırın
- Ya da → Port 8080 kullanın (yönetici yetkisi gerekmez)

---

## 📝 Özet

| Port | Yönetici | URL | Kullanım |
|------|----------|-----|----------|
| 8080 | ❌ Hayır | `localhost:8080` | Önerilen |
| 80   | ✅ Evet | `localhost` | Daha temiz URL |

**Önerilen:** Port 8080 kullanın, daha kolay!
