# Quizdram — Firestore Veri Tabanı Referansı

Bu belge **tek kaynak-of-truth**'tur. Tüm Firestore koleksiyonları, alanlar, tipler ve
Flutter / Admin Panel kullanım durumu burada tanımlanır.

> **Kural:** Bir alan Firestore'da varsa buraya eklenir. Flutter'ın henüz okumadığı
> alanlar `Flutter` sütununda `—` ile işaretlenir; bu, o alanın gereksiz olduğu anlamına
> gelmez — ileride kullanılacak veya admin/analitik tarafından okunacak demektir.

---

## Koleksiyonlar

- [dramas](#dramasdramaid)
- [cast](#castcastid)
- [quizPacks](#quizpackspacid)
- [results](#resultsresultid)
- [news](#newsnewsid)
- [users](#usersuid)
- [leaderboard](#leaderboard)
- [badges (statik)](#badges-statik)

---

## `dramas/{dramaId}`

Flutter modeli: `Drama` (`lib/models/models.dart`)

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | `Drama.id` | Firestore doküman ID'si |
| `title` | string | `Drama.title` | İngilizce / romanize başlık |
| `titleKo` | string | `Drama.hangul` | Asıl dil başlığı (Korece, Çince, Japonca…) |
| `titleEn` | string | — | İngilizce tam başlık (romanizeden farklıysa) |
| `titleTr` | string | — | Türkçe lokalize başlık |
| `region` | string | `Drama.region` | `kr` · `cn` · `jp` · `th` |
| `year` | number | `Drama.year` | Yayın yılı |
| `episodes` | number | `Drama.eps` | Bölüm sayısı |
| `genre` | string | `Drama.genre` | Serbest metin, örn. `"Romance · Fantasy"` |
| `genres` | string[] | — | Ayrıştırılmış tür listesi, örn. `["Romance","Fantasy"]` |
| `hue` | string | `Drama.hue` (Color) | Hex renk, örn. `"#FF5470"` — UI aksan rengi |
| `posterUrl` | string | — | Firebase Storage URL — drama posteri |
| `backdropUrl` | string | — | Firebase Storage URL — geniş arka plan görseli |
| `synopsis` | string | — | Korece özet (TMDB'den gelen ana dil) |
| `synopsisEn` | string | — | İngilizce özet |
| `synopsisKo` | string | — | Korece özet (synopsis ile aynı, açık alan) |
| `synopsisTr` | string | — | Türkçe özet |
| `translations` | map | — | `{ "tr": { "title": "…", "synopsis": "…" }, "en": {…}, "ja": {…}, … }` — TMDB'den otomatik doldurulur; desteklenen diller: `tr en ko ja zh fr de es pt ar ru it hi id vi th pl nl` |
| `streamingPlatforms` | string[] | — | `["Netflix","Viki","WeTVv"]` |
| `tmdbId` | number | — | TMDB import referansı |
| `kmdbId` | string | — | KMDB import referansı (Kore yapımları) |
| `status` | string | — | `draft` · `review` · `published` |
| `createdAt` | timestamp | — | Oluşturma zamanı |
| `updatedAt` | timestamp | — | Son güncelleme zamanı |

---

## `cast/{castId}`

Flutter modeli: `CastMember` (`lib/models/models.dart`)

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | `CastMember.id` | Firestore doküman ID'si |
| `name` | string | `CastMember.name` | Romanize isim, örn. `"Han Soo-jin"` |
| `nameKo` | string | `CastMember.hangul` | Asıl dil ismi, örn. `"한수진"` |
| `nameEn` | string | — | İngilizce isim (romanizeden farklıysa) |
| `region` | string | `CastMember.region` | `kr` · `cn` · `jp` · `th` |
| `role` | string | `CastMember.role` | `Lead` · `Supporting` · `Guest` |
| `age` | number | `CastMember.age` | Mevcut yaş (doğum yılından hesaplanabilir) |
| `hue` | string | `CastMember.hue` (Color) | Hex renk — UI aksan rengi |
| `photoUrl` | string | — | Firebase Storage URL — profil fotoğrafı |
| `birthDate` | string | — | `"YYYY-MM-DD"` formatı |
| `nationality` | string | — | `"KR"` · `"CN"` · `"JP"` · `"TH"` (ISO 3166) |
| `bio` | string | — | Biyografi (TMDB İngilizce varsayılan) |
| `bioEn` | string | — | İngilizce biyografi (admin düzenleyebilir) |
| `bioKo` | string | — | Korece biyografi |
| `bioTranslations` | map | — | `{ "tr": "Türkçe bio…", "ja": "日本語bio…", … }` — TMDB'den otomatik |
| `dramaIds` | string[] | — | **Firestore'a import edilmiş** drama ID'leri |
| `tmdbCredits` | TmdbCredit[] | — | TMDB'deki **tüm** TV dizi görünümleri (import edilmemiş diziler dahil) — bkz. alt tablo |
| `instagram` | string | — | Instagram kullanıcı adı (@'siz) |
| `tmdbPersonId` | number | — | TMDB kişi import referansı |
| `status` | string | — | `draft` · `review` · `published` |
| `createdAt` | timestamp | — | Oluşturma zamanı |
| `updatedAt` | timestamp | — | Son güncelleme zamanı |

### `tmdbCredits[]` — TMDB TV Kredileri Alt Dizisi

Drama import edildiğinde her cast üyesi için `/person/{id}/tv_credits` çekilir ve tüm dizi görünümleri burada saklanır. `dramaIds` yalnızca Firestore'a aktarılmış dizileri tutar; `tmdbCredits` henüz import edilmemiş dizileri de kapsar.

| Alan | Tip | Açıklama |
|---|---|---|
| `tmdbId` | number | TMDB dizi ID'si |
| `title` | string | Dizi gösterim başlığı |
| `titleOriginal` | string? | Orijinal başlık (farklıysa) |
| `year` | number? | İlk yayın yılı |
| `character` | string? | Oynadığı karakter adı |
| `posterPath` | string? | TMDB ham poster path (`/abc.jpg`) — önizleme için |

---

## `quizPacks/{packId}`

Flutter modeli: `QuizOpt` (`lib/models/models.dart`) — şu an tek soru oynanıyor,
quiz paketi modeli henüz Flutter'da tam değil. Tam yapı aşağıdadır.

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | — | Firestore doküman ID'si |
| `title` | string | — | Paketin başlığı (fallback EN) |
| `titleKo` | string | — | Başlık, Korece/asıl dil |
| `titleTranslations` | map | — | `{ "tr": "Squid Game Testi", "en": "Squid Game Quiz", … }` |
| `dramaId` | string | — | İlgili `dramas/{dramaId}` |
| `region` | string | — | `kr` · `cn` · `jp` · `th` |
| `difficulty` | string | — | `easy` · `medium` · `hard` |
| `coverUrl` | string | — | Firebase Storage URL — paket kapağı |
| `questions` | QuizQuestion[] | kısmen (`QuizOpt`) | Gömülü soru dizisi — bkz. alt tablo |
| `playCount` | number | — | Toplam oynanma sayısı (Cloud Function artırır) |
| `publishedAt` | timestamp | — | Yayın zamanı |
| `scheduledAt` | timestamp | — | Zamanlanmış yayın (henüz yayınlanmadıysa) |
| `createdBy` | string | — | Admin UID |
| `status` | string | — | `draft` · `review` · `published` |
| `createdAt` | timestamp | — | Oluşturma zamanı |
| `updatedAt` | timestamp | — | Son güncelleme zamanı |

### `questions[]` — Gömülü Dizi

Sorular iki modda çalışır: **`template`** ve **`custom`**.

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | `QuizOpt.id` | Soru ID'si |
| `type` | string | — | `template` · `custom` |
| `templateKey` | string | — | Yalnızca `type=template`. Olası değerler ↓ |
| `params` | map | — | Yalnızca `type=template`. Örn. `{ "castId": "…", "dramaId": "…" }` |
| `text` | string | `QuizOpt.text` | Yalnızca `type=custom`. Fallback soru metni (EN) |
| `translations` | map | — | Yalnızca `type=custom`. `{ "tr": { "text": "…", "hint": "…", "options": […] }, "ko": {…} }` |
| `options` | QuizOption[] | — | `type=template`'de boş; Flutter runtime'da DB'den oluşturur |
| `correctId` | string | `QuizOpt.correct` | Doğru şıkkın ID'si (template'de referans entity ID'si) |
| `difficulty` | string | — | `easy` · `medium` · `hard` |
| `hint` | string | — | Fallback ipucu metni (EN) |
| `imageUrl` | string | — | Görsel gerektiren sorular için (örn. `cast_photo_who_is_this`) |
| `order` | number | — | Soru sırası |

#### `templateKey` değerleri

| templateKey | Soru kalıbı | Gerekli params |
|---|---|---|
| `which_drama_for_character` | "{karakter} hangi dizide oynuyor?" | `castId`, `dramaId` |
| `which_character_in_drama` | "{dizi} dizisinin başrolü kim?" | `dramaId`, `castId` |
| `drama_release_year` | "{dizi} kaç yılında yayınlandı?" | `dramaId` |
| `cast_photo_who_is_this` | "Bu kişi kim?" (`imageUrl` dolu olur) | `castId` |
| `which_region_is_drama` | "{dizi} hangi ülke yapımı?" | `dramaId` |
| `how_many_episodes` | "{dizi} kaç bölümdür?" | `dramaId` |
| `drama_genre` | "{dizi} hangi türde?" | `dramaId` |

> **Flutter davranışı:** `templateKey` + `params` ile uygulama lokalize soru metnini kendi
> içinde üretir (çeviri JSON'ından), yanlış şıkları DB'den dinamik çeker.

### `options[]` — Şık Alt Dizisi

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | — | Şık ID'si, örn. `"a"` · `"b"` · `"c"` · `"d"` |
| `text` | string | `QuizOpt.text` | Fallback şık metni (EN) |
| `sub` | string | `QuizOpt.sub` | Alt bilgi, örn. `"달의 조류 · 2024"` |
| `translations` | map | — | `{ "tr": { "text": "…", "sub": "…" }, "ko": {…} }` |

---

## `results/{resultId}`

Flutter modeli: Henüz Flutter modeli yok — sadece backend yazar.

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | — | Firestore doküman ID'si |
| `userId` | string | — | `users/{uid}` referansı |
| `packId` | string | — | `quizPacks/{packId}` referansı |
| `correct` | number | — | Doğru cevap sayısı |
| `total` | number | — | Toplam soru sayısı |
| `elapsedSecs` | number | — | Toplam geçen süre (saniye) |
| `xpEarned` | number | — | Bu oyundan kazanılan XP |
| `answers` | map | — | `{ questionId: selectedOptionId }` — hile önleme için |
| `createdAt` | timestamp | — | Oyun bitiş zamanı |

---

## `news/{newsId}`

Flutter modeli: `NewsItem` (`lib/models/models.dart`)

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `id` | string | `NewsItem.id` | Firestore doküman ID'si |
| `tag` | string | `NewsItem.tag` | Etiket metni, örn. `"EXKLÜZİF"` · `"YENİ"` |
| `tagBg` | string | `NewsItem.tagBg` (Color) | Etiket arka plan rengi (hex) |
| `tagFg` | string | `NewsItem.tagFg` (Color) | Etiket yazı rengi (hex) |
| `headline` | string | `NewsItem.headline` | Türkçe manşet |
| `headlineEn` | string | — | İngilizce manşet |
| `headlineKo` | string | — | Korece manşet |
| `source` | string | `NewsItem.source` | Kaynak adı, örn. `"Quizdram"` · `"Soompi"` |
| `sourceUrl` | string | — | Orijinal haber URL'i |
| `time` | string | `NewsItem.time` | Görüntü zamanı, örn. `"2s"` · `"1g"` (hesaplanmış) |
| `publishedAt` | timestamp | — | Gerçek yayın zamanı — `time` buradan hesaplanır |
| `hue` | string | `NewsItem.hue` (Color) | Kart aksan rengi (hex) |
| `hangul` | string | `NewsItem.hangul` | Dekoratif hangul/ideogram karakteri |
| `category` | string | — | `trend` · `new_show` · `gossip` · `interview` |
| `imageUrl` | string | — | Firebase Storage URL — kapak görseli |
| `body` | string | — | Türkçe haber içeriği (zengin metin, HTML/Markdown) |
| `bodyEn` | string | — | İngilizce içerik |
| `bodyKo` | string | — | Korece içerik |
| `dramaId` | string | — | İlgili drama (varsa) |
| `status` | string | — | `draft` · `review` · `published` |
| `createdAt` | timestamp | — | Oluşturma zamanı |
| `updatedAt` | timestamp | — | Son güncelleme zamanı |

---

## `users/{uid}`

Flutter modeli: Henüz Flutter modeli yok — şu an mock `LeaderEntry` + `QzBadge` kullanılıyor.

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `uid` | string | — | Firebase Auth UID (doküman ID) |
| `displayName` | string | `LeaderEntry.name` | Görünen kullanıcı adı |
| `email` | string | — | Firebase Auth e-posta |
| `avatarUrl` | string | — | Firebase Storage URL veya preset avatar kodu |
| `lang` | string | — | Tercih edilen dil kodu: `tr` · `en` · `ko` · `ja` · `zh` |
| `country` | string | — | ISO 3166-1 alpha-2, örn. `"TR"` — `LeaderEntry.country` emoji kaynağı |
| `role` | string | — | `user` · `editor` · `admin` — admin panel erişim kontrolü |
| `xp` | number | — | Toplam XP puanı |
| `level` | number | — | Mevcut seviye |
| `streak` | number | `LeaderEntry.streak` | Günlük oyun serisi |
| `lastPlayedAt` | timestamp | — | Son oyun zamanı |
| `badges` | string[] | `QzBadge.name` (earned) | Kazanılan rozet ID'leri |
| `bannedAt` | timestamp | — | Ban zamanı (null = aktif kullanıcı) |
| `bannedReason` | string | — | Admin ban notu |
| `createdAt` | timestamp | — | Kayıt zamanı |

---

## `leaderboard`

Cloud Function tarafından periyodik olarak hesaplanır. Flutter `LeaderEntry` doğrudan buradan okur.

### `leaderboard/weekly` ve `leaderboard/allTime`

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `entries` | LeaderEntry[] | `LeaderEntry` listesi | Sıralı kullanıcı listesi |

### `entries[]` — Gömülü Dizi

| Alan | Tip | Flutter | Açıklama |
|---|---|---|---|
| `rank` | number | `LeaderEntry.rank` | Sıra |
| `userId` | string | — | `users/{uid}` referansı |
| `displayName` | string | `LeaderEntry.name` | Görünen ad |
| `country` | string | `LeaderEntry.country` | Bayrak emoji kaynağı |
| `score` | string | `LeaderEntry.score` | Görüntü skoru, örn. `"24.8k"` |
| `xp` | number | — | Ham XP değeri — `score` buradan formatlanır |
| `streak` | number | `LeaderEntry.streak` | Günlük seri |
| `updatedAt` | timestamp | — | Hesaplama zamanı |

---

## `badges` (Statik)

Rozetler Firestore'da koleksiyon olarak tutulmaz — `users/{uid}.badges[]` içinde sadece
kazanılan rozet ID'leri saklanır. Rozet tanımları uygulamada statik olarak tanımlıdır
(`lib/data.dart` → `kBadges`). Admin paneli ileride bir `badgeDefinitions/` koleksiyonu
ekleyebilir (Faz 2 rozet sistemi için).

### Mevcut Statik Rozet ID'leri

| ID | Flutter `QzBadge.name` | Hangul | Açıklama |
|---|---|---|---|
| `streak_21` | `21g Seri` | `연속` | 21 günlük kesintisiz oyun serisi |
| `k_expert` | `K-Uzmanı` | `K` | Tüm KR quiz paketlerini tamamla |
| `first_season` | `İlk Sezon` | `1` | İlk quiz paketini tamamla |
| `cn_hunter` | `C-Avcısı` | `C` | Tüm CN quiz paketlerini tamamla |
| `anime` | `Anime` | `A` | Tüm JP quiz paketlerini tamamla |
| `duel_champ` | `1v1 Şamp.` | `王` | İlk 1v1 düelloyu kazan |
| `speedster` | `Hızlı` | `速` | Bir quiz paketini 30 saniyede bitir |
| `perfect` | `Mükemmel` | `満` | Bir pakette 100% doğru cevap |

---

## Güvenlik Kuralları (Özet)

```
users/{uid}         → okuma: sahibi veya admin
                    → yazma: sahibi (yalnızca displayName/avatarUrl/lang) veya admin
dramas, cast, news  → okuma: herkes · yazma: admin veya editor
quizPacks           → okuma: herkes · yazma: admin veya editor
results/{resultId}  → okuma: sahibi veya admin · yazma: Cloud Function (istemci yazamaz)
leaderboard         → okuma: herkes · yazma: Cloud Function
```

> **Not:** `users/{uid}.role` alanı Firestore Security Rules ile korunur — kullanıcı
> kendi dokümanını güncellerken `role`, `xp`, `level`, `streak`, `badges`, `bannedAt`
> alanlarına dokunamaz. Bkz. DATABASE.md'deki kural örneği.

---

## Alanlar Arası İlişkiler

```
dramas/{dramaId}
  └─ cast/{castId}.dramaIds[]         (cast bu dramada oynuyor)
  └─ quizPacks/{packId}.dramaId       (bu dramaya ait quiz paketi)
  └─ news/{newsId}.dramaId            (bu dramaya ait haber)

users/{uid}
  └─ results/{resultId}.userId        (kullanıcının oyun geçmişi)
  └─ leaderboard/.entries[].userId    (liderboard satırı)

quizPacks/{packId}
  └─ results/{resultId}.packId        (bu pakette oynanan oyunlar)
```
