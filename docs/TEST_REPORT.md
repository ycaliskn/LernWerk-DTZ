# LernWerk A1 test report — 25 November 2026

## Scope
The original A1 baseline contained 58 vocabulary cards, 25 verbs and 20 grammar exercises. Revision 0.3 extends the catalogue with A2/B1 samples; see the revision section below. The A1 pack remains curated, not the complete Goethe A1 catalogue. Goethe's official word list defines a broader scope of roughly 650 words. Protected source text and example sentences are not copied wholesale. A1 grammar is cross-checked against the public 12-lesson VHS-Lernportal overview.

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


## Revision 0.3 — illustrated cards, practice mode and audio repair

The current revision adds:
- 64 vocabulary cards (58 A1 + 3 A2 + 3 B1).
- 31 verb cards (25 A1 + 3 A2 + 3 B1).
- 28 grammar cards (20 A1 + 3 A2 + 5 B1).
- 15 independent gap-fill questions (5 per level), each with a new sentence rather than reusing the explanation-card example.
- Original SVG illustrations generated locally for every vocabulary, verb and grammar card; no external image request or emoji-only card placeholder is required.
- A separate fill-in-the-blank route in Study Modes. Practice answers are associated with the corresponding learning card for mistake review.
- Native Android speech via `@capacitor-community/text-to-speech` 8.0.2. The previous implementation relied only on Web Speech API; Android WebView does not expose `speechSynthesis` consistently. The native plugin uses Android TextToSpeech and checks whether a German voice is installed before speaking.

### Revision 0.3 verification
- Node.js suite: 31 tests per run × 3 independent runs = 93 successful test executions.
- Java learning-rule self-test: 3 independent runs passed.
- JavaScript syntax checks: app entry, content, core, i18n, sources and illustration modules passed.
- Content audit: all learning examples have sentence text, clean punctuation, unique IDs and valid answer indices; all 15 practice prompts are distinct from learning examples.
- CI build must confirm the esbuild bundle and Android APK after the native TTS dependency is installed. A physical-device voice playback test is still required; build success alone does not prove that the device has a German TTS voice installed.
