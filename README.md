# LernWerk – Deutsch A1–B1 / DTZ

A mobile-responsive, offline-first German learning app for vocabulary, verbs, grammar, mistake review and independent gap-fill practice. Android/iOS builds use Capacitor 8.

## Included in revision 0.3
- Turkish-first interface and 17-language selector.
- Cumulative level access: A2 includes A1; B1 includes A1 + A2 + B1.
- Separate explanation-based learning cards and a fill-in-the-blank practice mode with new sentences.
- 64 vocabulary cards (58 A1 + 3 A2 + 3 B1).
- 31 verb cards (25 A1 + 3 A2 + 3 B1), with Präsens, Präteritum and Perfekt.
- 28 grammar cards (20 A1 + 3 A2 + 5 B1).
- 15 gap-fill questions (5 per level), linked to the corresponding learning topic for mistake review.
- Original, offline SVG illustrations for every vocabulary, verb and grammar card.
- Native Android speech through `@capacitor-community/text-to-speech` 8.0.2, with German voice availability checks and browser fallback.
- Official-source register and staged grammar roadmap.
- Guest progress persistence, session resume/restart and spaced mistake review.
- Java 21 learning-rule module, demo HTTP API, PostgreSQL schema draft and OpenAPI v1 contract.

## Tests
- Node.js: 31 test cases × 3 independent runs = 93 successful test executions.
- Java learning-rule suite: 3 independent runs passed.
- JavaScript syntax checks and content sentence/answer audits passed.
- GitHub Actions CI verifies web tests, Java tests and secret scanning.
- Android debug APK workflow verifies package ID and APK signature.
- No physical Android device installation or real-device audio playback is claimed; see `docs/TEST_REPORT.md`.

## Content boundaries
- A1 remains a curated sample pack, not the full Goethe A1 word list (~650-word reference scope).
- A2 and B1 contain representative samples for trying the level, not complete level curricula.
- The 17-language selector is present, but curated learning translations currently cover Turkish and English sample content.
- Account linking, cloud sync, production authentication, live AdMob and subscriptions are not connected.
- A signed iOS device IPA/TestFlight build is deferred until Apple Developer signing details are configured in GitHub Actions Secrets.

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
