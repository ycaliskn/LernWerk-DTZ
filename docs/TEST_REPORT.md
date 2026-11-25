# LernWerk A1 test report — 25 November 2026

## Scope
The current source snapshot contains 58 A1 vocabulary cards, 25 A1 verb cards and 20 A1 grammar exercises. This is a curated A1 test pack, not the complete Goethe A1 catalogue. Goethe's official word list defines a broader scope of roughly 650 words. Protected source text and example sentences are not copied wholesale. A1 grammar is cross-checked against the public 12-lesson VHS-Lernportal overview.

## Three-run automated verification

| Test group | Per run | Runs | Result |
|---|---:|---:|---|
| Node.js content, learning-rule and source UI tests | 22 | 3 | 66/66 passed |
| Java 21 learning-rule self-test | 1 suite | 3 | 3/3 passed |
| JavaScript parse checks | 5 modules | 1 | 5/5 passed |
| Source/content structural audit | 58 words, 25 verbs, 20 grammar items | 1 | Passed |
| GitHub CI web + Java test jobs | full job suite | 1 workflow run | Success |
| GitHub secret scan | Gitleaks | 1 workflow run | Success |

## Native build verification
GitHub Actions run `45658660098` completed successfully for commit `fa835fefd46070860321c1b6fab8e8bca76d18ca`.

- Android debug APK: Gradle build, package ID check, APK v2 signature verification and artifact upload succeeded.
- Package ID: `de.lernwerk.dtz`; version `1.0`; APK size 4,179,494 bytes.
- APK SHA-256: `18b1c0b307d3258b2dbc05c874cdf189b0a48e97a110e8c860d1aac3aa0831fe`.
- iOS Simulator: Xcode project generation, asset sync, simulator build and artifact upload succeeded.
- Simulator bundle ID: `de.lernwerk.dtz`; minimum iOS 15.0; app binary contains arm64 and x86_64 slices.
- Signed iOS device IPA/TestFlight job was skipped because Apple signing and App Store Connect secrets have not been configured.

## Behaviours covered
- 17 unique language options, Turkish and English first.
- A2 includes A1; B1 includes A1 + A2 + B1.
- Vocabulary cards have German prompts, TR/EN meanings, answer options and valid indices; unique IDs and no sparse arrays.
- Verb cards contain all six Präsens persons and Präteritum/Perfekt forms.
- Grammar quiz items have valid options and answer keys, covering the represented VHS A1 progression.
- Wrong answers enter the mistake list and reset the review streak.
- Three spaced successful reviews in distinct sessions clear a mistake; duplicate successes in one session do not count.
- Mini-ad eligibility after every third answer; interstitial at most once per 20 minutes at a safe transition; Pro suppresses ad events.
- Resume/restart preserves unrelated progress fields.
- Source register is reachable from home and study screens and includes attribution/rights notes.

## Verification limits
- A headless Chromium end-to-end smoke attempt did not complete; no browser E2E result is claimed.
- No physical Android phone or iPhone was available for installation testing. CI confirms the APK and Simulator builds and validates the APK package/signature; it does not prove physical-device installation.
- The iOS Simulator app is not an iPhone-installable IPA. Signed device IPA/TestFlight requires Apple Developer signing material and App Store Connect API configuration in GitHub Secrets. Never send signing secrets in chat.
- Live AdMob, billing, account linking, cloud sync, production authentication and secure native storage are not connected.
- The 17-language menu exists, but complete learning translations are currently only available for Turkish/English sample content.
- Current visuals are emoji placeholders rather than licensed photography; speech uses the device/browser German voice when available.
- The 58-word sample does not complete Goethe's roughly 650-word A1 scope. A2/B1 learning packs remain unpopulated.

## Reproduce
```bash
npm run test:3x
for i in 1 2 3; do npm run api:test; done
for f in app/app.js app/core.js app/content.js app/i18n.js app/sources.js; do node --check "$f"; done
```
