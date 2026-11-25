# LernWerk – Deutsch A1–B1 / DTZ

Offline-first German-learning application prototype built with Capacitor 8.

## v0.5 Android revision

- Global A1/A2/B1 and native-language selectors available throughout the app.
- Interface languages: Turkish, English, Arabic and Ukrainian.
- Level weighting: A1 only; A2 = 75% A2 + 25% A1; B1 = 75% B1 + 25% A2 (never A1). Lower-level review can be disabled.
- Vocabulary, verbs and grammar each offer an all-subtopics mixed entry.
- Independent learning/work progress by level, module and subtopic, with continue/restart.
- Individual SVG artwork for all 123 current learning cards; no repeated generic picture across cards.
- Two-step work mode: picture-led direct question followed by a new-context, no-image fill-in-the-blank.
- Mistake archives split into vocabulary+verbs and grammar, then by subtopic.

## Content scope

Current A1/A2/B1 cards are representative learning and level-testing samples, not complete official Goethe or DTZ catalogues. Arabic and Ukrainian currently localize interface labels; full learning-content translations are not yet complete. See `docs/CONTENT_SOURCES.md`, `docs/GRAMMAR_CURRICULUM.md` and `docs/IMAGE_AUDIT.md`.

## Run and test

```bash
npm install
npm run build:web
npm start
npm run test
npm run test:3x
npm run api:test
```

## Android build

Pushes to `main` run the Android debug APK workflow. The workflow bundles the app, creates the Capacitor Android project, builds `assembleDebug`, verifies package ID and APK v2 signature, then uploads `lernwerk-android-debug-apk`.

Open [GitHub Actions](https://github.com/ycaliskn/LernWerk-DTZ/actions) to download the latest artifact. iOS jobs are deferred and do not run automatically for Android updates. They will only be enabled when explicitly requested and Apple signing details are configured.

## Project structure

- `app/` – PWA UI, learning content, illustrations, progress logic and tests.
- `api-java/` – Java 21 domain rules and demo HTTP API.
- `database/` – PostgreSQL schema draft.
- `openapi/` – API contract draft.
- `docs/` – architecture, source, image audit, test and release notes.

This is an independent learning project, not affiliated with or endorsed by Goethe-Institut, BAMF or telc.
