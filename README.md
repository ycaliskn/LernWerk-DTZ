# LernWerk – Deutsch A1–B1 / DTZ

A first mobile-responsive, offline-first learning prototype for German vocabulary, verbs, grammar, mistake review and mixed practice. The same web application is prepared for iOS and Android packaging with Capacitor 8.

## Included in this initial increment

- Turkish-first interface and a 17-language selector.
- A1 / A2 / B1 level selection with cumulative access (A2 includes A1; B1 includes A1 + A2 + B1).
- Five study areas: vocabulary, verbs, grammar, mistake review and mixed mode.
- Visual-placeholder vocabulary cards, example sentences, Turkish/English translations, and German text-to-speech where supported by the device/browser. Real licensed photo assets are not included yet.
- Verb conjugation examples across Präsens, Präteritum and Perfekt.
- A1 course topic roadmap.
- Dedicated “Resmî kaynaklar” section with A1/A2/B1 grammar sequence, level-specific references, direct source links and rights notes. Grammar practice screens provide a shortcut to their sources.
- Guest progress persistence in IndexedDB; no account required for local use.
- Session resume / restart choice.
- Mistake review based on different sessions: first correct review counts immediately, second requires at least 10 minutes, third at least 24 hours; a new wrong answer resets the successful review streak.
- Ad placement policy logic: compact slot after every 3 answered questions; interstitial eligibility after a 20-minute cooldown at a safe transition only. Real AdMob SDK is not connected in this prototype.
- Java 21 domain-rule module and local health/config API shell.
- PostgreSQL schema draft and OpenAPI v1 contract.

## Important prototype boundaries

- The currently bundled learning content is a curated A1 demonstration set (58 vocabulary cards, 25 verb cards and 20 grammar exercises), not the complete official ~650-word Goethe A1 catalogue. A2 and B1 learning packs are not populated.
- Turkish and English are the fully populated vocabulary translation examples; other language selections are represented in the UI framework but their complete learning-content translation packs remain to be curated and reviewed.
- Account linking, cloud synchronisation, real AdMob ads, real subscriptions and store verification are architecture/API placeholders, not live services.
- Local IndexedDB data is not encrypted in this prototype. Use only demo progress until platform secure storage is implemented.
- APK/IPA binaries have not been built in this environment. Android SDK/Studio and macOS/Xcode are not installed here. Native build instructions are in `docs/BUILD_AND_RELEASE.md`.

## Quick start

```bash
npm start
# visit http://localhost:4173
```

## Tests

```bash
npm test
npm run test:3x
npm run api:test
```

The updated 25 November 2026 verification report is in `docs/TEST_REPORT.md`. Node.js tests (22 test cases per run) and Java domain-rule tests were run three consecutive times. JavaScript syntax checks passed. Browser-based end-to-end and physical-device tests have not passed or been claimed.

## Native packaging

Capacitor dependencies and config are prepared in the root project. A GitHub Actions workflow (`.github/workflows/mobile-build.yml`) is included to generate a debug APK and an iOS Simulator build on GitHub runners. It also contains an optional signed-IPA job that requires the Apple signing/API secrets described in `docs/BUILD_AND_RELEASE.md`. The workflow has not yet run. See `docs/BUILD_AND_RELEASE.md` and `docs/GITHUB_SETUP.md`.

## Project folders

- `app/` – mobile responsive PWA and learning logic.
- `api-java/` – Java 21 domain rules and local demo HTTP API.
- `database/` – PostgreSQL schema draft.
- `openapi/` – API endpoint contract.
- `docs/` – architecture, content sourcing, security and release instructions.

## Source alignment

The content roadmap refers to official Goethe A1/A2/B1 word list pages and BAMF DTZ material. This project is independent and is not affiliated with or endorsed by Goethe-Institut, telc or BAMF. See `docs/CONTENT_SOURCES.md` and the detailed `docs/GRAMMAR_CURRICULUM.md`.

Advertising details: see `docs/AD_POLICY.md`. The frequency/placement logic is tested, but the AdMob SDK and live ad-unit IDs are deliberately not wired until the publisher account, consent configuration and category blocklist are ready.
