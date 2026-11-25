# LernWerk v0.5 – regression and Android handoff report

## Revision scope

- Persistent top-bar controls for global level and native interface language (Turkish, English, Arabic, Ukrainian).
- A1-only selection; A2 is 75% A2 + 25% A1 by default; B1 is 75% B1 + 25% A2 and explicitly excludes A1. The lower-level review slice can be disabled.
- Level weighting is applied to vocabulary, verbs, grammar, mixed vocabulary+verbs and paired work-mode items.
- Every learning card in the current sample has its own original SVG scene. The visual catalogue and manual relevance scores are listed in `docs/IMAGE_AUDIT.md`.
- The section selector has a mixed-all-subtopics row and uses the actual card illustration for each topic thumbnail.
- Learning sessions and work sessions have separate progress keys for each level, module and subtopic. Incomplete sessions offer continue or restart.
- Work mode uses two steps per learning target: an image-led direct question and a separate, new-context fill-in-the-blank without image or hint.
- Mistake review first chooses vocabulary+verbs or grammar, then offers the relevant subsection archives.
- The Android workflow is the only automatic native build on `main` pushes. iOS jobs are gated behind an explicit manual dispatch and are not run for this Android-only revision.

## Automated checks

| Test group | Per run | Runs | Result |
|---|---:|---:|---|
| Node.js application/content/revision tests | 43 | 3 | 129/129 passed |
| Java 21 learning-rule self-test | 1 suite | 2 | 2/2 passed |
| JavaScript syntax checks | 8 modules | 1 | 8/8 passed |
| SVG XML parsing | 123 assets | 1 | 123/123 valid |
| Illustration mapping | 123 cards | 1 | 123 unique keys and 123 unique SVGs |
| Illustration relevance audit | 123 cards | 1 | Minimum 4.0/5; average 4.59/5 |

## Key regression cases

- All four requested interface languages are present and no extra language is offered in this selector.
- A2 and B1 review mixes use the correct adjacent level only; B1 does not include A1.
- Learning and work session keys are distinct for each level and subsection.
- The work direct prompt and gap sentence are different; the gap screen has no image or learning hint.
- A one-item subsection still obtains valid distractors from the full module pool.
- The direct work question and fill-in-the-blank are both tracked separately for each learning target.
- Mistakes are separated into vocabulary+verbs and grammar, with subsection-level filtering.
- Subtopic thumbnails reference the individual topic card artwork, not a repeated generic thumbnail.
- The offline cache preloads the built bundle at `dist/app.js`.

## Build handoff

The source changes are intended for GitHub Actions Android build on `main`:

1. install dependencies on the Ubuntu runner;
2. bundle JavaScript;
3. generate the Capacitor Android project;
4. run Gradle `assembleDebug`;
5. verify package ID `de.lernwerk.dtz`;
6. verify APK v2 signature and SHA-256;
7. upload `lernwerk-android-debug-apk` artifact.

A local dependency installation in this environment timed out; the actual Android Gradle build must therefore be verified on the GitHub runner before an APK is delivered. No Android APK is claimed as produced by this report until that workflow finishes successfully.

## Device and content limits

- No physical Android device is attached to this environment. Emulator/CI compilation does not prove phone installation or device-specific TTS voice availability.
- The current A1/A2/B1 datasets are learning/test samples, not complete official Goethe/DTZ catalogues.
- Arabic and Ukrainian currently cover interface labels only; the learning-content translations remain to be professionally translated and reviewed.
- iOS is intentionally not built in this revision, per the user's instruction to defer iOS until Apple account information is ready.
- Production authentication, cloud sync, billing and live AdMob are not connected.


## DeutschKraft brand/exam-hub preview (25 November 2026)

- Rebranded the mobile header, app title and manifest to DeutschKraft.
- Added a locally cached custom lifting-student mascot and new launcher icon assets.
- Added a separate B1 Prüfungen hub with Hören, Lesen, Schreiben and Sprechen placeholders. No copied model-test tasks are included.
- Added BAMF DTZ word-list and PONS DE–TR references to the source register with rights notes.
- Tests: 46/46 passed in each of 3 consecutive runs (138/138).
- JavaScript syntax checks passed for app.js, core.js, content.js, illustrations.js, i18n.js, sources.js and work-mode.js.
- Manifest, local asset and service-worker cache checks passed.

**Release limitation:** the current sample catalogue is 64 words, 31 verbs, 28 grammar cards and 15 practice questions. This is not a complete A1/A2/B1 or DTZ catalogue. No APK was produced from this preview. The next release gate is a rights-cleared, independently authored full coverage catalogue with a per-entry image-quality audit.
