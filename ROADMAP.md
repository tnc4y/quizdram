# Quizdram — Ürün & Teknik Yol Haritası

## Mevcut Durum — MVP Prototipi (Mayıs 2025)

Statik Flutter prototipi, tam UI ile: onboarding, quiz oyun/sonuç, cast profilleri,
dergi akışı, liderboard ve kullanıcı profili. Tüm veriler hard-coded mock data.
`ValueNotifier` üzerinden çok dil desteği (TR / EN / KO).

---

## Backend Mimarisi

### Önerilen Stack

| Katman | Teknoloji | Neden |
|---|---|---|
| **Auth** | Firebase Auth | Sosyal giriş (Google, Apple) + anonim oyun desteği hazır |
| **Veritabanı** | Firestore | Gerçek zamanlı liderboard, çevrimdışı destek, esnek şema |
| **Medya Depolama** | Firebase Storage | Cast fotoğrafları, drama posterleri |
| **Push Bildirimler** | Firebase Cloud Messaging (FCM) | Seri hatırlatmaları, yeni quiz uyarıları |
| **Sunucu Mantığı** | Cloud Functions (Node.js / Dart) | Skor doğrulama, hile önleme, zamanlanmış quiz rotasyonu |
| **Admin Paneli** | Next.js 15 + Firebase Admin SDK | Drama/cast import, quiz & haber editörü — aşağıda detaylı |
| **Analitik** | Firebase Analytics + Mixpanel | Huni takibi, quiz terk analizi |

### Veri Modeli (Firestore Koleksiyonları)

```
users/{uid}
  displayName, lang, avatarUrl
  xp, level, streak, lastPlayedAt
  badges[]

quizPacks/{packId}
  title, hangul, region, dramaId
  questions[{ text, options[], correctId, difficulty }]
  publishedAt, playCount

results/{resultId}
  userId, packId, correct, total, elapsedSecs
  xpEarned, createdAt

news/{newsId}
  tag, headline, source, publishedAt
  hangul, hue, category

leaderboard/weekly   → Cloud Function ile birleştirilir
leaderboard/allTime  → Cloud Function ile birleştirilir
```

### Admin Paneli Mimarisi

Quizdram Admin, ayrı bir **Next.js** uygulamasıdır (`admin/` klasörü, Flutter'dan bağımsız).
Sadece yetkili editörler erişir (Firebase Auth ile rol kontrolü: `role == 'admin'`).
Aynı Firebase projesini paylaşır; TMDB ile sadece bu panel konuşur.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Firebase Admin SDK (server-side) · shadcn/ui bileşenleri

TMDB API çağrıları ve fotoğraf indirme işlemleri Next.js **Route Handler**'larında sunucu tarafında çalışır — TMDB anahtarı hiçbir zaman tarayıcıya gitmez.

#### Temel Modüller

**1. Drama & Cast İçe Aktarma**
- TMDB ID gir → Route Handler drama meta verilerini, cast listesini ve fotoğrafları çeker
- Fotoğraflar sunucudan Firebase Storage'a kopyalanır (`cast/{castId}/photo.jpg`, `dramas/{dramaId}/poster.jpg`) — mobil uygulama TMDB'yi hiç bilmez
- Eksik veya hatalı alanlar import sonrası formdan elle düzenlenir
- KMDB opsiyonel: Kore yapımları için ek bilgi (ödüller, yönetmen notu)

**2. Quiz Paketi Editörü**
- Drama seç → quiz paketi oluştur
- Soru / şık / doğru cevap / zorluk girişi (sürükle-bırak sıralama)
- Taslak → İncelemede → Yayında durum akışı
- Yayın tarihi zamanlaması (örn. yeni sezon çıkışına denk getir)

**3. Dergi & Haber Editörü**
- Başlık, etiket (Trend / Yeni Dizi / Dedikodu / Röportaj), kapak görseli
- Zengin metin editörü (Tiptap / BlockNote)
- TR / EN / KO ayrı içerik alanları
- Haber kaynağı bağlantısı (Soompi, Koreaboo vb. için referans)

**4. Kullanıcı Yönetimi**
- Kullanıcı arama, XP / rozet manuel ayarı
- Şikâyet / ban işlemleri (Firebase Admin SDK ile server-side)

**5. İçerik Takip Panosu**
- Toplam drama / cast / quiz / haber sayısı
- Onay bekleyen taslaklar
- Haftalık aktif kullanıcı ve quiz oynanma sayısı

#### Veri Akışı

```
Admin Panel (Next.js — Route Handlers, sunucu tarafı)
  └─ TMDB API ──► fotoğraf indir ──► Firebase Storage
  └─ TMDB API ──► metadata       ──► Firestore (dramas/, cast/)
  └─ Elle giriş ──────────────────► Firestore (quizPacks/, news/)

Mobil Uygulama (Flutter — TMDB'yi tanımaz)
  └─ Firestore'dan okur
  └─ Firebase Storage'dan görsel çeker
```

#### Firestore Koleksiyon Genişletmesi

```
dramas/{dramaId}
  title, titleKo, titleEn
  region (KR/CN/JP/TH), year, episodes
  posterUrl, backdropUrl        ← Storage URL
  tmdbId, kmdbId                ← import kaynağı referansı
  genres[], streamingPlatforms[]
  status (draft | published)

cast/{castId}
  name, nameKo, birthYear
  photoUrl                      ← Storage URL
  bio, bioEn, bioKo
  dramaIds[]                    ← oynadığı diziler
  tmdbPersonId
  status (draft | published)
```

---

### Servis Katmanı (`lib/services/` içinde zaten iskelet hazır)

`lib/services/` içindeki her soyut sınıf bir Firestore koleksiyonuna bire bir karşılık gelir.
Backend'e bağlanmak için somut `FirebaseQuizService`, `FirebaseUserService` vb. sınıflar oluştur
ve bunları üst düzey bir provider ile enjekte et (`provider` veya `riverpod` paketi kullan).

---

## Faz 0 — Temel Altyapı (Haziran 2025)

**Hedef:** Mock datayı gerçek backend ile değiştir + Admin Paneli ile ilk içeriği yükle.

### Mobil Uygulama
- [ ] `pubspec.yaml`'a `firebase_core`, `firebase_auth`, `cloud_firestore` ekle
- [ ] `lib/services/quiz_service.dart`'tan `FirebaseQuizService` uygula
- [ ] `lib/services/user_service.dart`'tan `FirebaseUserService` uygula
- [ ] `lib/services/news_service.dart`'tan `FirebaseNewsService` uygula
- [ ] İlk açılışta anonim auth ekle (zorla kayıt yok)
- [ ] Derin bağlantı hazırlığı için `Navigator` çağrılarını `go_router` ile değiştir
- [ ] XP/seviye sistemi: her doğru cevap +250 XP, seviye eşikleri
- [ ] Token kalıcılığı için `flutter_secure_storage` ekle

### Admin Paneli (`admin/` — Next.js)
- [ ] `admin/` klasöründe Next.js 15 projesi oluştur (`npx create-next-app`)
- [ ] Firebase Admin SDK + servis hesabı yapılandırması (sunucu tarafı)
- [ ] Firebase Auth ile admin rol kontrolü (`users/{uid}.role == 'admin'`)
- [ ] TMDB Route Handler: drama ID → meta veri + cast çekimi (TMDB anahtarı sunucuda)
- [ ] Fotoğraf Route Handler: TMDB CDN'den indir → Firebase Storage'a yükle
- [ ] Drama & cast düzenleme formu (import sonrası eksik alanlar)
- [ ] Quiz paketi editörü (soru/şık/cevap girişi, sürükle-bırak)
- [ ] Haber editörü (Tiptap, başlık, etiket, görsel, TR/EN/KO içerik)
- [ ] İlk 5 drama ve cast verisi admin panelden yüklenir (Lunar Tide, Neon Seoul…)

**Kilometre taşı:** Uygulama gerçek veriyle uçtan uca çalışır, içerik admin panelden yönetilir — TestFlight / iç iz.

---

## Faz 1 — Temel Ürün (Q3 2025)

**Hedef:** Yayına hazır quiz motoru + içerik boru hattı.

### Quiz Motoru
- [ ] 4 bölgede 10+ quiz paketi (KR / CN / JP / TH)
- [ ] Quiz paketi detay ekranı (kapak, zorluk, oyun sayısı, oluşturucu)
- [ ] Zamanlı puanlama formülü: daha hızlı cevaplar bonus XP kazandırır
- [ ] İpucu sistemi: 50 XP harca, bir yanlış seçeneği gizle
- [ ] Günlük quiz rotasyonu (Cloud Function zamanlanmış tetikleyici, 00:00 UTC)
- [ ] Çevrimdışı oyun: bugünkü quiz paketini yerel olarak önbelleğe al

### Hesap & Profil
- [ ] Sosyal giriş: Google + Apple
- [ ] Kullanıcı adı, avatar seçimi (hazır hangul karakter avatarları)
- [ ] Profil paylaşım kartı (ekran görüntüsüne uygun, Instagram hikayelerine paylaşılabilir)
- [ ] Push bildirim: "22 günlük serinin tehlikede 🔥" (FCM)

### İçerik
- [ ] Admin paneli: taslak → incelemede → yayında durum akışı
- [ ] Admin paneli: yayın tarihi zamanlaması (yeni sezon çıkışına denk getirme)
- [ ] Admin paneli: zengin metin editörü (Flutter Quill) ile haber makalesi yazımı
- [ ] Kategorili dergi akışı: Trend, Yeni Dizi, Dedikodu, Röportaj
- [ ] Arama: dramalar, cast üyeleri, quiz paketleri

### Teknik
- [ ] Hata raporlama: Firebase Crashlytics
- [ ] CI/CD: GitHub Actions → TestFlight + Play Store iç iz

---

## Faz 2 — Bağlılık & Sosyal (Q4 2025)

**Hedef:** Kullanıcıları her gün geri getir ve arkadaşlarını da çek.

### Liderboard 2.0
- [ ] Gerçek zamanlı haftalık liderboard (Firestore canlı dinleyici)
- [ ] Arkadaş liderboardu: kullanıcıları takip et / takipten çık
- [ ] Ülke bazlı bölgesel sıralamalar
- [ ] Liderboard animasyonu (sıra atlama konfetisi)

### Sosyal
- [ ] Haber makalelerinde yorum dizileri
- [ ] Skor + seri ile quiz sonuç paylaşım kartı
- [ ] "Arkadaşına meydan oku" — belirli quiz paketini derin bağlantı ile gönder
- [ ] Kullanıcı akışı: arkadaşların son oynadığı quizleri gör

### Oyunlaştırma
- [ ] Rozet sistemi (12 rozet, sunucu doğrulamalı): K-Uzman, Hız Aşırtı, Mükemmel Skor…
- [ ] Seri dondurma: seriyi korumak için 100 XP harca
- [ ] Haftalık meydan okuma: bonus XP çarpanlı temalı quiz paketi
- [ ] Sezonluk etkinlikler: K-Drama Ödülleri Haftası, Çin Yeni Yılı paketi

---

## Faz 3 — Canlı & 1v1 (Q1 2026)

**Hedef:** Rakiplerden ayrışmak için gerçek zamanlı çok oyunculu mod.

- [ ] **1v1 Düello modu**: WebSocket eşleşme (Firebase Realtime DB veya Supabase Realtime)
  - İki oyuncuyu aynı quiz paketinde eş zamanlı eşleştir
  - Her iki oyuncuya da görünen canlı skor göstergesi
  - Kazanan 2× XP alır, Düello Puanı kazanır
- [ ] **Canlı Quiz Etkinlikleri**: oluşturucu bir paketi yayınlar, binlerce kişi eş zamanlı cevaplar
  - Drama temalı Kahoot benzeri deneyim
  - Host kontrol paneli (admin web uygulaması)
- [ ] Düello liderboardu, Düello Rütbe rozet sistemi (Bronz → Elmas)

---

## Faz 4 — Monetizasyon (Q2 2026)

**Hedef:** Kazan-kazan olmayan sürdürülebilir gelir.

| Özellik | Model |
|---|---|
| **Quizdram PRO** | ₺79/ay abonelik — reklamsız, yeni paketlere erken erişim, özel rozet çerçeveleri |
| **İpucu Paketleri** | 10 ipucu ₺19 (aksi takdirde XP ile kazanılır) |
| **Avatar Çerçeveleri** | Kozmetik sezonluk çerçeveler: ₺9 adet |
| **Sponsorlu Paketler** | Drama stüdyoları cast fotoğraflı resmi quiz paketlerini sponsor eder |
| **Marka Ortaklıkları** | K-güzellik / moda markaları liderboard sponsoru olur |

**Not:** Temel quiz oyunu her zaman ücretsiz kalmalıdır. Monetizasyon güç kullanıcıları hedefler.

---

## Dil Genişlemesi

Şu anda aktif: **TR, EN, KO**
`kLangs`'ta mevcut ama henüz çevrilmemiş: **JA, ZH**

- [ ] Faz 1: `lib/lang.dart`'a Japonca çeviriler ekle → JA'yı aç
- [ ] Faz 1: Basitleştirilmiş Çince çeviriler ekle → ZH'yi aç
- [ ] Faz 2: Tayca (TH) — büyük BL drama kitlesi

---

## Özellik Birikimi (Zamanlanmamış)

- Drama detay sayfası (bölümler, yayın platformu bağlantıları, cast ızgarası)
- Cast vs Cast karşılaştırma ekranı
- "Hangi drama karakterisin?" kişilik quiz formatı
- Birlikte izleme entegrasyonu (eş zamanlı izleme + canlı quiz)
- Mod araçları: topluluk tarafından gönderilen quiz paketleri (inceleme kuyruğu)
- Masaüstü oyuncular için herkese açık web sürümü (Flutter Web — admin panelinden ayrı)
- iPad / tablet düzeni

---

## Takip Edilecek Temel Metrikler

| Metrik | Hedef (Faz 1 Lansmanı) |
|---|---|
| D1 tutma oranı | > %40 |
| D7 tutma oranı | > %20 |
| Ortalama oturum süresi | > 4 dakika |
| Quiz tamamlama oranı | > %70 |
| 3+ günlük seri | Aktif kullanıcıların > %30'u |
| Aylık aktif kullanıcı | Lansmandan 3 ay sonra 10.000 |
