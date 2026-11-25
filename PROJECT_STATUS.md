# Project status — 25 November 2026

## Prepared
- Mobile-responsive, installable-web-app prototype with five learning areas.
- Turkish-first settings with 17 language options; sample learning translations in Turkish and English.
- Expanded A1 sample pack: 58 vocabulary cards, 25 verb cards and 20 grammar exercises. This is a curated test pack, not the full ~650-word Goethe A1 list.
- Cumulative A1/A2/B1 access, local guest progress, session resume/restart and spaced mistake-review rules.
- Java 21 learning-rule module and local demo HTTP API.
- PostgreSQL schema draft, OpenAPI v1 contract, content-source register, security guidance and Capacitor 8 packaging configuration.
- GitHub CI, Android and iOS Simulator build workflows, CODEOWNERS and Dependabot configuration.
- Full 45-file source tree is present on public GitHub `main`.

## Verified on 25 November 2026
- Node.js: 22 tests per run, 3 separate runs; 66/66 passed.
- Java learning-rule test suite: 3 separate runs; all passed.
- 5 JavaScript syntax checks and structural content audit passed.
- GitHub Actions CI, Android debug APK build and iOS Simulator build succeeded for commit `fa835fefd46070860321c1b6fab8e8bca76d18ca`.
- APK package ID `de.lernwerk.dtz`, APK v2 signature and SHA-256 checked; see `docs/TEST_REPORT.md`.
- iOS Simulator app built for simulator architectures; not a device IPA.

## Not yet implemented / not yet verified
- Full Goethe A1 Wortliste coverage and full A1 editorial review; A2/B1 learning packs.
- Professional linguistic review and full translations for all 17 interface languages.
- Licensed photographs/illustrations for every card.
- Production Spring Boot service, account authentication/linking, remote sync and database deployment.
- Encrypted native local storage.
- Native AdMob SDK, publisher category blocks, GDPR consent platform and ad-unit configuration.
- Apple/Google purchase verification and live Pro subscription.
- Physical-device installation tests on Android/iPhone and browser E2E tests.
- Signed iOS device IPA/TestFlight: requires Apple signing and App Store Connect secrets in GitHub repository settings. Do not share secrets in chat.
- Main-branch protection is not configured.

See `docs/GRAMMAR_CURRICULUM.md`, `docs/CONTENT_SOURCES.md`, `docs/TEST_REPORT.md`, `docs/GITHUB_SETUP.md` and `docs/BUILD_AND_RELEASE.md`.
