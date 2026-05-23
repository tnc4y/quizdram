# Quizdram — Ürün & Teknik Yol Haritası

## Mevcut Durum — Backend Entegrasyon Aşaması (Mayıs 2026)

Flutter UI büyük ölçüde tamamlandı (onboarding, quiz oyun/sonuç, cast profilleri,
dergi akışı, liderboard, kullanıcı profili). `ValueNotifier` ile TR / EN / KO çoklu dil.

**Tamamlanan önemli adımlar:**
- Firebase servisleri Flutter'a eklendi (`firebase_quiz_service`, `firebase_user_service`, `firebase_news_service`, `firebase_leaderboard_service`, `service_locator`)
- Admin Paneli (Next.js 16) temel modülleri çalışır durumda — bkz. aşağıda
- `dramas` şeması 18 dilli `translations` map'i ile güncellendi (TMDB'den otomatik)
- Quiz soruları `template` / `custom` iki modlu sisteme tasarlandı (DATABASE.md)

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
| **Admin Paneli** | Next.js 16 + Firebase Admin SDK | Drama/cast import, quiz & haber editörü — aşağıda detaylı |
| **Analitik** | Firebase Analytics + Mixpanel | Huni takibi, quiz terk analizi |

### Veri Modeli (Firestore Koleksiyonları)

> Tam şema, tüm alanlar ve Flutter ↔ Admin Panel eşleşmesi için: **[DATABASE.md](DATABASE.md)**

Koleksiyonlar: `dramas` · `cast` · `quizPacks` · `results` · `news` · `users` · `leaderboard`

### Admin Paneli Mimarisi

Quizdram Admin, ayrı bir **Next.js 16** uygulamasıdır (`admin/` klasörü, Flutter'dan bağımsız).
Sadece yetkili editörler erişir (Firebase Auth + Firestore `role == 'admin'` kontrolü + HttpOnly session cookie).
Aynı Firebase projesini paylaşır; TMDB ile sadece bu panel konuşur.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Firebase Admin SDK (server-side)

TMDB API çağrıları ve fotoğraf indirme işlemleri Next.js **Route Handler**'larında / **Server Action**'larda sunucu tarafında çalışır — TMDB anahtarı hiçbir zaman tarayıcıya gitmez.

#### Temel Modüller — Durum

**1. Auth & Güvenlik** ✅
- Google sign-in → Firestore `role` kontrolü → Firebase `createSessionCookie`
- `proxy.ts` ile tüm dashboard route'ları HttpOnly session cookie ile korunuyor
- Firestore Security Rules: kullanıcı kendi `role`/`xp`/`streak` alanlarına dokunamaz

**2. Drama & Cast İçe Aktarma** ✅
- TMDB ID → `/api/tmdb/drama` route'u: drama meta verisi + cast listesi (18 dilde `translations` map'i dahil)
- Poster/cast fotoğrafları sunucudan Firebase Storage'a kopyalanıyor (`adminStorage` direkt, HTTP round-trip yok)
- `/dramas` sayfası: server component tablo + client TMDB import modal + server action kayıt

**3. Quiz Paketi Editörü** 🔜
- Drama seç → quiz paketi oluştur
- `type: template` sorular: `templateKey + params` — metin uygulamada üretilir, DB'ye yazılmaz
- `type: custom` sorular: `translations` map ile her dile çeviri girişi
- Taslak → İncelemede → Yayında durum akışı
- Yayın tarihi zamanlaması

**4. Dergi & Haber Editörü** 🔜
- Başlık, etiket, kapak görseli
- Zengin metin editörü (Tiptap / BlockNote)
- `translations` map ile çok dilli içerik
- Haber kaynağı bağlantısı

**5. Kullanıcı Yönetimi** 🔜
- Kullanıcı arama, XP / rozet manuel ayarı
- Şikâyet / ban (Firebase Admin SDK ile server-side)

**6. İçerik Takip Panosu** 🔜
- Toplam drama / cast / quiz / haber sayısı
- Onay bekleyen taslaklar, haftalık istatistikler

#### Veri Akışı

```
Admin Panel (Next.js 16 — Route Handlers + Server Actions, sunucu tarafı)
  └─ TMDB API ──► fotoğraf indir ──► Firebase Storage
  └─ TMDB API ──► metadata + 18 dil translations ──► Firestore (dramas/, cast/)
  └─ Elle giriş ──────────────────────────────────► Firestore (quizPacks/, news/)

Mobil Uygulama (Flutter — TMDB'yi tanımaz)
  └─ Firestore'dan okur (drama.translations[userLang])
  └─ Firebase Storage'dan görsel çeker
```

#### Çok Dilli Veri Stratejisi

| İçerik | Strateji |
|---|---|
| Drama başlık / özet | TMDB `/translations` endpoint → `translations: { "tr": {…}, "en": {…}, … }` otomatik |
| Quiz paketi başlığı | `titleTranslations` map — admin elle girer |
| Template quiz soruları | Uygulama içi çeviri JSON'u — DB'ye metin yazılmaz |
| Custom quiz soruları | `translations` map — admin her dili girer |
| Haber içeriği | `translations` map — admin her dili girer |

---

### Servis Katmanı (`lib/services/` — Flutter)

`lib/services/` içindeki Firebase implementasyonları eklendi:
- `firebase_quiz_service.dart` — Firestore `quizPacks` okuma
- `firebase_user_service.dart` — kullanıcı profili okuma/yazma
- `firebase_news_service.dart` — `news` koleksiyonu okuma
- `firebase_leaderboard_service.dart` — `leaderboard` dinleyici
- `service_locator.dart` — servis enjeksiyonu

---

## Faz 0 — Temel Altyapı (Mayıs–Haziran 2026)

**Hedef:** Mock datayı gerçek backend ile değiştir + Admin Paneli ile ilk içeriği yükle.

### Mobil Uygulama
- [x] `pubspec.yaml`'a Firebase paketleri eklendi (`firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_storage`, `firebase_messaging`, `firebase_analytics`)
- [x] Firebase servis sınıfları oluşturuldu (`FirebaseQuizService`, `FirebaseUserService`, `FirebaseNewsService`, `FirebaseLeaderboardService`)
- [x] `service_locator.dart` ile servis enjeksiyonu
- [ ] Mock data → Firebase servislerine geçiş (ekranlar bağlanacak)
- [ ] İlk açılışta anonim auth ekle (zorla kayıt yok)
- [ ] `Navigator` → `go_router` geçişi (derin bağlantı hazırlığı)
- [ ] XP/seviye sistemi: her doğru cevap +250 XP, seviye eşikleri
- [ ] `flutter_secure_storage` token kalıcılığı

### Admin Paneli (`admin/` — Next.js 16)
- [x] Next.js 16 projesi kuruldu (App Router, Turbopack)
- [x] Firebase Admin SDK + servis hesabı yapılandırması
- [x] Google Auth + Firestore `role == 'admin'` kontrolü
- [x] `proxy.ts` ile session cookie tabanlı route koruması
- [x] Sol sidebar + dashboard layout
- [x] TMDB Route Handler: drama + cast + 18 dil çevirisi
- [x] Fotoğraf Storage Route Handler
- [x] TMDB import modal + drama tablosu (`/dramas`)
- [ ] Drama düzenleme formu (import sonrası eksik alanlar: hue, tr başlık vb.)
- [ ] Quiz paketi editörü (template + custom soru, sürükle-bırak sıralama)
- [ ] Haber editörü (Tiptap, `translations` map girişi)
- [ ] İlk 5 drama ve cast yüklenmesi (Squid Game, Goblin, My Love from the Star…)

**Kilometre taşı:** Uygulama gerçek veriyle uçtan uca çalışır, içerik admin panelden yönetilir.

---

## Faz 1 — Temel Ürün (Q3 2026)

**Hedef:** Yayına hazır quiz motoru + içerik boru hattı.

### Quiz Motoru
- [ ] 4 bölgede 10+ quiz paketi (KR / CN / JP / TH)
- [ ] Template soru tipleri Flutter'da implemente edildi (7 şablon — DATABASE.md)
- [ ] Quiz paketi detay ekranı (kapak, zorluk, oyun sayısı)
- [ ] Zamanlı puanlama: hızlı cevaplara bonus XP
- [ ] İpucu sistemi: 50 XP harca, bir yanlış seçeneği gizle
- [ ] Günlük quiz rotasyonu (Cloud Function, 00:00 UTC)
- [ ] Çevrimdışı oyun: bugünkü paketi yerel önbellek

### Hesap & Profil
- [ ] Sosyal giriş: Google + Apple
- [ ] Kullanıcı adı, avatar seçimi (hangul karakter avatarları)
- [ ] Profil paylaşım kartı (Instagram hikayelerine uyumlu)
- [ ] Push bildirim: seri hatırlatması (FCM)

### İçerik
- [ ] Taslak → İncelemede → Yayında durum akışı (admin paneli)
- [ ] Yayın tarihi zamanlaması
- [ ] Zengin metin editörü ile haber yazımı
- [ ] Kategorili dergi akışı: Trend, Yeni Dizi, Dedikodu, Röportaj
- [ ] Arama: dramalar, cast, quiz paketleri

### Dil Genişlemesi
- [ ] JA (Japonca) çevirileri `lib/lang.dart`'a ekle → aç
- [ ] ZH (Basitleştirilmiş Çince) çevirileri ekle → aç

### Teknik
- [ ] Firebase Crashlytics
- [ ] CI/CD: GitHub Actions → TestFlight + Play Store iç iz

---

## Faz 2 — Bağlılık & Sosyal (Q4 2026)

**Hedef:** Kullanıcıları her gün geri getir, arkadaşlarını da çek.

### Liderboard 2.0
- [ ] Gerçek zamanlı haftalık liderboard (Firestore canlı dinleyici)
- [ ] Arkadaş liderboardu: takip et / takipten çık
- [ ] Ülke bazlı bölgesel sıralamalar
- [ ] Sıra atlama animasyonu (konfeti)

### Sosyal
- [ ] Haber makalelerinde yorum dizileri
- [ ] Quiz sonuç paylaşım kartı (skor + seri)
- [ ] "Arkadaşına meydan oku" — derin bağlantı ile paket gönder
- [ ] Arkadaş akışı: son oynanan quizleri gör

### Oyunlaştırma
- [ ] Rozet sistemi (12 rozet, sunucu doğrulamalı)
- [ ] Seri dondurma: 100 XP harca, seriyi koru
- [ ] Haftalık meydan okuma: bonus XP çarpanlı temalı paket
- [ ] Sezonluk etkinlikler: K-Drama Ödülleri Haftası, Çin Yeni Yılı paketi

### Dil Genişlemesi
- [ ] TH (Tayca) — büyük BL drama kitlesi

---

## Faz 3 — Canlı & 1v1 (Q1 2027)

**Hedef:** Rakiplerden ayrışmak için gerçek zamanlı çok oyunculu mod.

- [ ] **1v1 Düello modu**: Firebase Realtime DB WebSocket eşleşme
  - İki oyuncuyu aynı quiz paketinde eş zamanlı eşleştir
  - Her iki oyuncuya görünen canlı skor göstergesi
  - Kazanan 2× XP + Düello Puanı
- [ ] **Canlı Quiz Etkinlikleri**: host bir paketi yayınlar, binlerce kişi eş zamanlı cevaplar
  - Host kontrol paneli (admin web uygulaması)
- [ ] Düello liderboardu + Bronz → Elmas rütbe sistemi

---

## Faz 4 — Monetizasyon (Q2 2027)

**Hedef:** Kazan-kazan olmayan sürdürülebilir gelir.

| Özellik | Model |
|---|---|
| **Quizdram PRO** | ₺79/ay — reklamsız, yeni paketlere erken erişim, özel rozet çerçeveleri |
| **İpucu Paketleri** | 10 ipucu ₺19 (XP ile de kazanılır) |
| **Avatar Çerçeveleri** | Kozmetik sezonluk çerçeveler: ₺9 adet |
| **Sponsorlu Paketler** | Drama stüdyoları resmi quiz paketlerini sponsor eder |
| **Marka Ortaklıkları** | K-güzellik / moda markaları liderboard sponsoru |

**Not:** Temel quiz oyunu her zaman ücretsiz kalmalıdır.

---

## Özellik Birikimi (Zamanlanmamış)

- Drama detay sayfası (bölümler, yayın platformu bağlantıları, cast ızgarası)
- Cast vs Cast karşılaştırma ekranı
- "Hangi drama karakterisin?" kişilik quiz formatı
- Birlikte izleme entegrasyonu (eş zamanlı izleme + canlı quiz)
- Topluluk tarafından gönderilen quiz paketleri (moderasyon kuyruğu)
- Herkese açık web sürümü (Flutter Web — admin panelinden ayrı)
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
