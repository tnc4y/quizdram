# Quizdram — Product & Technical Roadmap

## Current State — MVP Prototype (May 2025)

Static Flutter prototype with full UI: onboarding, quiz play/result, cast profiles,
magazine feed, leaderboard, and user profile. All data is hard-coded mock data.
Multi-language support (TR / EN / KO) via `ValueNotifier`.

---

## Backend Architecture

### Recommended Stack

| Layer | Technology | Reason |
|---|---|---|
| **Auth** | Firebase Auth | Social login (Google, Apple) + anonymous play out-of-the-box |
| **Database** | Firestore | Real-time leaderboard, offline support, flexible schema |
| **Media Storage** | Firebase Storage | Cast photos, drama posters |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Streak reminders, new quiz alerts |
| **Server Logic** | Cloud Functions (Node.js / Dart) | Score validation, anti-cheat, scheduled quiz rotation |
| **CMS / Content** | Directus (self-hosted) or Contentful | Non-technical editors add dramas, news, quiz packs |
| **Analytics** | Firebase Analytics + Mixpanel | Funnel tracking, quiz drop-off analysis |

### Data Model (Firestore Collections)

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

leaderboard/weekly   → aggregated by Cloud Function
leaderboard/allTime  → aggregated by Cloud Function
```

### Service Layer (already scaffolded in `lib/services/`)

Each abstract class in `lib/services/` maps 1-to-1 to a Firestore collection.
To connect backend: create concrete `FirebaseQuizService`, `FirebaseUserService` etc.
and inject them via a top-level provider (use `provider` or `riverpod` package).

---

## Phase 0 — Foundation (June 2025)

**Goal:** Replace mock data with real backend. No new UI features.

- [ ] Add `firebase_core`, `firebase_auth`, `cloud_firestore` to `pubspec.yaml`
- [ ] Implement `FirebaseQuizService` from `lib/services/quiz_service.dart`
- [ ] Implement `FirebaseUserService` from `lib/services/user_service.dart`
- [ ] Implement `FirebaseNewsService` from `lib/services/news_service.dart`
- [ ] Add anonymous auth on first launch (no forced sign-up)
- [ ] Seed Firestore with first 5 quiz packs (Lunar Tide, Neon Seoul…)
- [ ] Replace `Navigator` calls with `go_router` for deep-link readiness
- [ ] Wire XP/level system: +250 XP per correct answer, level thresholds
- [ ] Add `flutter_secure_storage` for token persistence

**Milestone:** App works end-to-end with real data on TestFlight / internal track.

---

## Phase 1 — Core Product (Q3 2025)

**Goal:** Public-ready quiz engine + content pipeline.

### Quiz Engine
- [ ] 10+ quiz packs across all 4 regions (KR / CN / JP / TH)
- [ ] Quiz pack detail screen (cover, difficulty, play count, creator)
- [ ] Timed scoring formula: faster answers earn bonus XP
- [ ] Hint system: deduct 50 XP, reveal one wrong option
- [ ] Daily quiz rotation (Cloud Function scheduled trigger at 00:00 UTC)
- [ ] Offline play: cache today's quiz pack locally

### Account & Profile
- [ ] Social sign-in: Google + Apple
- [ ] Username, avatar selection (preset hangul character avatars)
- [ ] Profile share card (screenshot-friendly, shareable to Instagram stories)
- [ ] Push notification: "Your 22-day streak is at risk 🔥" (FCM)

### Content
- [ ] CMS integration: editors add dramas/cast/news without code deploys
- [ ] Magazine feed with categories: Trend, New Show, Gossip, Interview
- [ ] Search: dramas, cast members, quiz packs

### Tech
- [ ] Crash reporting: Firebase Crashlytics
- [ ] CI/CD: GitHub Actions → TestFlight + Play Store internal track

---

## Phase 2 — Engagement & Social (Q4 2025)

**Goal:** Make users come back daily and bring friends.

### Leaderboard 2.0
- [ ] Real-time weekly leaderboard (Firestore live listener)
- [ ] Friends leaderboard: follow/unfollow users
- [ ] Country-level regional rankings
- [ ] Leaderboard animation (rank-up confetti)

### Social
- [ ] Comment threads on news articles
- [ ] Quiz result share card with score + streak
- [ ] "Challenge a friend" — send a specific quiz pack via deep link
- [ ] User feed: see what quizzes friends recently played

### Gamification
- [ ] Badge system (12 badges, server-validated): K-Expert, Speedster, Perfect Score…
- [ ] Streak freeze item: spend 100 XP to protect a streak
- [ ] Weekly challenge: themed quiz pack with bonus XP multiplier
- [ ] Seasonal events: K-Drama Awards Week, Chinese New Year pack

---

## Phase 3 — Live & 1v1 (Q1 2026)

**Goal:** Real-time multiplayer to differentiate from competitors.

- [ ] **1v1 Duel mode**: WebSocket matchmaking (Firebase Realtime DB or Supabase Realtime)
  - Match two players on the same quiz pack simultaneously
  - Live score ticker visible to both players
  - Winner gets 2× XP, gains Duel Rating
- [ ] **Live Quiz Events**: creator broadcasts a pack, thousands answer in sync
  - Similar to Kahoot but drama-themed
  - Host control panel (admin web app)
- [ ] Duel leaderboard, Duel Rank badge tier system (Bronze → Diamond)

---

## Phase 4 — Monetization (Q2 2026)

**Goal:** Sustainable revenue without pay-to-win.

| Feature | Model |
|---|---|
| **Quizdram PRO** | ₺79/mo subscription — ad-free, early access to new packs, exclusive badge frames |
| **Hint Packs** | Buy 10 hints for ₺19 (otherwise earned via XP) |
| **Avatar Frames** | Cosmetic seasonal frames: ₺9 each |
| **Sponsored Packs** | Drama studios sponsor official quiz packs with cast photos |
| **Brand Partnerships** | K-beauty / fashion brands as leaderboard sponsors |

**Note:** Core quiz play must always remain free. Monetization targets power users.

---

## Language Expansion

Currently active: **TR, EN, KO**
In `kLangs` but not yet translated: **JA, ZH**

- [ ] Phase 1: Add Japanese translations to `lib/lang.dart` → unlock JA
- [ ] Phase 1: Add Simplified Chinese translations → unlock ZH
- [ ] Phase 2: Thai (TH) — large BL drama audience

---

## Feature Backlog (Unscheduled)

- Drama detail page (episodes, streaming links, cast grid)
- Cast vs Cast comparison screen
- "Which drama character are you?" personality quiz format
- Watch party integration (sync viewing + live quiz)
- Mod tools: community-submitted quiz packs (review queue)
- Web version (Flutter Web) for desktop players
- iPad / tablet layout

---

## Key Metrics to Track

| Metric | Target (Phase 1 launch) |
|---|---|
| D1 retention | > 40 % |
| D7 retention | > 20 % |
| Avg session length | > 4 min |
| Quiz completion rate | > 70 % |
| Streak > 3 days | > 30 % of active users |
| Monthly active users | 10 000 (3 months post-launch) |
