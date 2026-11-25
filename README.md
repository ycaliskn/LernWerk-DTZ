# LernWerk – Deutsch A1–B1 / DTZ

A mobile-responsive, offline-first German learning prototype for vocabulary, verbs, grammar, mistake review and mixed practice. It is packaged for Android and iOS with Capacitor 8.

## Included
- Turkish-first interface and 17-language selector.
- Cumulative A1/A2/B1 access (A2 includes A1; B1 includes A1 + A2 + B1).
- Five study areas: vocabulary, verbs, grammar, mistakes and mixed practice.
- Curated A1 test pack: 58 vocabulary cards, 25 verb cards and 20 grammar exercises.
- Example sentences and Turkish/English sample translations; German device/browser speech synthesis where supported.
- Verb forms in Präsens, Präteritum and Perfekt.
- Official-source register and A1 grammar roadmap.
- Guest progress persistence in IndexedDB, session resume/restart and spaced mistake review.
- Tested ad-placement logic (compact slot after every third answer; interstitial cooldown of 20 minutes at a safe transition). Real AdMob is not connected.
- Java 21 learning-rule module, demo HTTP API, PostgreSQL schema draft and OpenAPI v1 contract.

## Test status — 25 November 2026
- Node.js: 22 test cases × 3 runs = 66/66 passed.
- Java learning-rule suite: 3/3 passed.
- JavaScript syntax checks: 5/5 passed.
- GitHub Actions CI, Android debug APK build and iOS Simulator build: succeeded for commit `fa835fefd46070860321c1b6fab8e8bca76d18ca`.
- APK package ID and APK v2 signature verification passed.
- Physical device installation and browser E2E are not claimed; see `docs/TEST_REPORT.md`.

## Important boundaries
- This is a curated A1 test pack, not the complete Goethe A1 list (~650-word reference scope). A2/B1 learning packs are not populated.
- The language selector has 17 options, but fully curated learning translations are currently available only for Turkish/English sample content.
- The current visuals are emoji placeholders, not licensed photography.
- Account linking, cloud sync, production authentication, encrypted local storage, live AdMob and subscriptions are not connected.
- iOS Simulator artifact is for Xcode Simulator, not for physical iPhone. A signed device IPA/TestFlight build requires Apple Developer signing material and App Store Connect API secrets in GitHub Actions Secrets.
- No physical Android or iPhone has been used for installation testing.

## Quick start
```bash
npm install
npm start
# http://localhost:4173
```

## Tests
```bash
npm test
npm run test:3x
npm run api:test
```

See `docs/TEST_REPORT.md`, `docs/GRAMMAR_CURRICULUM.md`, `docs/CONTENT_SOURCES.md`, `docs/BUILD_AND_RELEASE.md` and `docs/GITHUB_SETUP.md`.

This independent project is not affiliated with or endorsed by Goethe-Institut, telc or BAMF.
