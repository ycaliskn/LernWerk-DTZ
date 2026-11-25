# LernWerk – Deutsch A1–B1 / DTZ

A mobile-responsive, offline-first German learning app prototype packaged with Capacitor 8 for Android and iOS.

## Current release scope

- Five study areas: vocabulary, verbs, grammar, mistakes and mixed practice.
- Turkish-first UI and 17 language choices; full learning translations currently only have Turkish/English samples.
- Cumulative A1/A2/B1 level selection and local guest progress.
- A1 demo content only (8 vocabulary cards, 5 verb cards and 4 grammar cards); this is not a complete Goethe A1 catalogue.
- Java 21 learning rules and a local demo HTTP API.
- Source register, curriculum roadmap, OpenAPI and PostgreSQL schema drafts.

## Build and test

```bash
npm start
npm test
npm run test:3x
npm run api:test
```

GitHub Actions contains CI and mobile build workflows. Android debug APK and iOS Simulator artifacts will be uploaded when the workflow runs. A physical-device iOS IPA requires Apple signing secrets. The workflows are configured but not yet verified by a GitHub Actions run.

## Important limitations

Production authentication, cloud sync, real AdMob, store billing, complete multi-language translations, full official A1 content, licensed photo assets and physical-device QA are not complete. Do not treat this prototype as a production or store-ready release.

See `docs/ARCHITECTURE.md`, `docs/TEST_REPORT.md` and `docs/BUILD_AND_RELEASE.md`.
