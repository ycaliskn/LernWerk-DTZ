# LernWerk v0.4 – regression report

## Revision scope

- 121 learning cards (64 vocabulary, 31 verbs, 26 grammar) each map to a distinct, hand-authored SVG scene. Home, apartment building, bedroom, kitchen and bathroom have separate illustrations.
- The fill-in-the-blank mode uses independent practice sentences and renders no illustration, learning-card heading, or pre-answer hint.
- Learning sessions are separated by module and subsection/topic. Existing whole-module sessions are migrated to the relevant subsection so the learner can continue from the closest matching item.
- Mistakes are archived independently by words, verbs and grammar, then by subsection/topic; each archive can launch a review session.
- A2 vocabulary sessions can optionally include a 25% A1 review slice. The setting can be turned off. The same weighting applies to the combined words+verbs mode.
- Previous local progress is retained; legacy mistake records are assigned to their module/topic during migration.

## Automated checks

| Test group | Per run | Runs | Result |
|---|---:|---:|---|
| Node.js app/content/learning/revision tests | 37 | 3 | 111/111 passed |
| Java learning-rule self-test | 1 suite | 3 | 3/3 passed |
| JavaScript syntax checks | 6 modules | 1 | 6/6 passed |
| SVG XML parsing | 121 assets | 1 | 121/121 valid |
| Illustration mapping | 121 cards | 1 | 121 unique keys and 121 unique SVGs |

## Build verification

The mobile workflow is configured to bundle the app, run Capacitor sync, build the Android debug APK, verify package identity and signature, and upload the artifact. This source revision has not yet completed a new GitHub Actions Android build. Do not use an earlier APK as the v0.4 release.

## Device verification limits

- No physical Android device was available for installation testing.
- No physical iPhone / signed IPA was requested in this revision.
- Native speech output still depends on a German voice installed in Android Text-to-Speech settings.
- A2/B1 content remains a curated sample, not the full official Goethe or DTZ vocabulary/grammar inventory.
