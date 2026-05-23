# 퀴즈드라마 · Quizdram

Asian drama quiz + magazine app. Test your knowledge of K-drama, C-drama, J-drama and Thai series.

Built with Flutter (mobile) and Next.js 16 (admin panel), powered by Firebase.

---

## Stack

| | |
|---|---|
| **Mobile** | Flutter · Dart · Firebase Auth · Cloud Firestore · Firebase Storage |
| **Admin** | Next.js 16 · TypeScript · Tailwind CSS · Firebase Admin SDK |
| **Auth** | Google Sign-In · Anonymous (guest) · Session cookies |
| **Content** | TMDB API → Firestore (server-side, key never exposed to client) |

---

## Project Structure

```
quizdram/
├── lib/                    # Flutter app
│   ├── screens/            # Onboarding, Home, Quiz, News, Leaderboard, Profile…
│   ├── services/           # Firebase service layer (quiz, user, news, leaderboard, drama)
│   ├── widgets/            # Shared UI components
│   ├── theme.dart          # Cream / Midnight palettes
│   └── lang.dart           # TR / EN / KO strings
│
├── admin/                  # Next.js admin panel
│   ├── app/(auth)/         # Login page
│   ├── app/(dashboard)/    # Dramas, Quiz, News, Cast, Users pages
│   ├── app/api/            # TMDB route handlers (server-side)
│   └── proxy.ts            # Session-cookie route protection
│
└── ROADMAP.md
```

---

## Getting Started

### Mobile

```bash
flutter pub get
flutter run
```

Requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from your Firebase project.

### Admin Panel

```bash
cd admin
npm install
npm run dev
```

Create `admin/.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
TMDB_API_KEY=...
```

The first admin user needs `role: "admin"` set manually in Firestore (`users/{uid}`).

---

## Features

- **Quiz** — Cast, title, and release-year questions. Timed scoring with XP bonuses.
- **Magazine** — K-drama news feed with category filters (Trend, New Show, Gossip, Interview).
- **Leaderboard** — Weekly and all-time rankings.
- **Profile** — XP progress, level, streaks, and badge collection.
- **Themes** — Cream (light) and Midnight (dark) palettes, switchable at runtime.
- **Languages** — Turkish, English, Korean UI strings.

---

## Content Pipeline

```
Admin Panel → TMDB API (server-side)
           → Firebase Storage   (poster + cast photos)
           → Firestore          (drama metadata, quiz packs, news)
           ↓
Mobile App reads Firestore & Storage — never talks to TMDB directly
```
