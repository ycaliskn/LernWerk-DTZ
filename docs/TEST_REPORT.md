# LernWerk A1 test report — 25 November 2026

## Scope of this run

The checked source snapshot contains 58 A1 vocabulary cards, 25 A1 verb cards and 20 A1 grammar exercises. It is a curated test pack, not the complete Goethe A1 vocabulary inventory. The official Goethe list describes an approximately 650-word scope; protected source text and example sentences are not copied wholesale. The A1 grammar sequence is cross-checked against the public 12-lesson VHS-Lernportal overview.

## Automated test results

| Test group | Per run | Runs | Result |
|---|---:|---:|---|
| Node.js content, learning rules and source UI tests | 22 | 3 | 66/66 passed |
| Java 21 learning-rule self-test | 1 suite | 3 | 3/3 passed |
| JavaScript parse checks | 5 modules | 1 | 5/5 passed |
| Source/content structural audit | 58 words, 25 verbs, 20 grammar items | 1 | Passed |

## Behaviours covered

- The language selector has 17 unique language entries, with Turkish and English first.
- A2 includes A1 and B1 includes A1 + A2 + B1.
- Vocabulary cards have nonempty German prompts, Turkish/English meanings, answer options and valid answer indices; IDs are unique and arrays contain no holes.
- Verb cards contain the six present-tense persons and both Präteritum and Perfekt values.
- Grammar questions have valid options and keyed answers and cover the A1 VHS progression areas represented in this demo pack.
- A wrong answer enters the mistake list and resets the correct-review streak.
- Three distinct spaced successful review sessions remove a mistake; duplicate successes within one session cannot count.
- Mini-ad eligibility occurs after every third answer; Pro suppresses ads. Interstitial eligibility is limited to one per 20 minutes and Pro suppresses it.
- Resume/restart preserves unrelated progress fields.
- The in-app source register is reachable from home and study screens and has rights / non-affiliation notes.

## Verification limits — do not over-read the green tests

- A headless Chromium smoke attempt did not complete in this Linux container; no browser E2E result is claimed.
- No physical Android phone or iPhone was available for installation/testing.
- This Linux execution environment has Node 22 and Java 21 but no Android SDK, Gradle, ADB, macOS or Xcode. It did not produce an APK, AAB, iOS Simulator app or IPA locally.
- GitHub Actions workflows are defined in source. An actual GitHub Actions run and build artifact must be observed before any APK/Simulator package can be claimed as produced.
- iOS device IPA/TestFlight requires Apple Developer signing material and App Store Connect API configuration in GitHub Secrets; secrets must never be sent in chat.
- No live AdMob, billing, account linking, cloud synchronization, production authentication or secure native storage is implemented.
- The 17-language menu is present, but fully curated learning translations are not available for all 17 languages.
- The sample uses emoji placeholders, not licensed photography. Device/browser German speech synthesis is used when available.
- The official Goethe A1 list is much broader than the current 58-word sample. A1 still needs expansion/review, and A2/B1 learning packs remain unpopulated.

## Reproduce checks

```bash
npm run test:3x
for i in 1 2 3; do npm run api:test; done
for f in app/app.js app/core.js app/content.js app/i18n.js app/sources.js; do node --check "$f"; done
```
