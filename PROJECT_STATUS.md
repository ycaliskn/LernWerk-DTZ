# Project status — 25 November 2026

## Prepared in this increment

- Mobile-responsive, installable-web-app prototype with five learning areas.
- Turkish-first settings with 17 language options; English and Turkish sample learning translations.
- Expanded A1 sample pack: 58 vocabulary cards, 25 verb cards and 20 grammar exercises; topics cross-checked against Goethe A1 and the 12-lesson VHS A1 grammar outline. This remains a curated sample, not the full ~650-word Goethe list.
- Cumulative A1/A2/B1 access rules, local progress, session resume/restart, spaced mistake review and ad-placement rules.
- Java 21 learning-rule module and a local demo HTTP API.
- PostgreSQL schema draft, OpenAPI v1 contract, content-source register, security guidance and Capacitor 8 packaging configuration.
- CI workflow, mobile build workflow, CODEOWNERS and Dependabot configuration.
- Dedicated in-app grammar curriculum/source register. A1/A2/B1 topics link to BAMF, DVV/vhs-Lernportal, DW and Goethe references.

## Not yet implemented / not yet verified

- Full Goethe A1 Wortliste coverage (~650-word reference scope), complete A1 vocabulary review, A2 and B1 catalogues.
- Production Spring Boot service, account authentication/linking, remote sync and database deployment.
- Complete 17-language vocabulary/grammar translation packs and professional linguistic review.
- Real licensed photographs/illustrations for every card.
- Native AdMob SDK, publisher category blocks, GDPR consent platform and ad-unit configuration.
- Apple / Google purchase verification and live Pro subscription.
- Android/iOS native projects and APK/AAB/IPA binaries are not yet built. The GitHub Actions build workflow is prepared for Android debug APK, iOS Simulator and optional signed iOS IPA, but has not run; signing and physical-device checks remain.
- Full source import into the public GitHub repository is still pending verification; main-branch protection is not configured.

See `docs/GRAMMAR_CURRICULUM.md` for the level-by-level grammar plan and source basis; `docs/TEST_REPORT.md` for verified tests; `docs/GITHUB_SETUP.md` for connection/protection; and `docs/BUILD_AND_RELEASE.md` for platform build requirements.
