# LernWerk project status – v0.5 Android revision

## Implemented in this revision

- Global level and native-language selectors are fixed in the top bar on every route. The currently offered interface languages are Turkish, English, Arabic and Ukrainian.
- All 123 current learning cards (64 vocabulary, 31 verbs, 28 grammar) map to an individual, locally bundled SVG illustration. Similar concepts such as apartment, house, bedroom, kitchen and bathroom use separate scenes. The visual audit rates every illustration at 4/5 or higher; see `docs/IMAGE_AUDIT.md`.
- Learning mode displays the individual learning card and its relevant illustration.
- Work mode is a separate two-step exercise: a new direct question with the illustration, followed by a different-context fill-in-the-blank sentence with no illustration, target heading or pre-answer hint.
- A1 selection uses A1 items only. A2 selection defaults to a 75% A2 / 25% A1 mix. B1 selection defaults to a 75% B1 / 25% A2 mix; A1 is excluded from B1 review. The lower-level review slice can be turned off. The same filter is applied to vocabulary, verbs, grammar and work-mode question pairs.
- Each learning/work mode has distinct saved progress by selected level, module and subtopic. The section list includes a mixed-all-subtopics choice and displays the corresponding subtopic's own illustration thumbnail.
- Mistakes are archived under two top-level groups: vocabulary+verbs and grammar. Each then branches by subtopic for targeted review.
- The separate study/work mode uses the global level and does not introduce another level selector.
- The PWA cache includes the generated app bundle so that offline launch keeps the current app JavaScript.

## Content scope and language limitations

- The A1 pack remains a curated learning sample, not the full Goethe A1 word list.
- A2 and B1 contain representative examples for testing level selection and weighting; they are not complete Goethe/DTZ catalogues.
- Interface labels are available in Turkish, English, Arabic and Ukrainian. The curated German learning content and sentence translations are not yet fully translated into Arabic and Ukrainian.

## Build / release status

- Android debug APK is built by the GitHub Actions workflow on pushes to `main`; the workflow verifies the application ID and APK v2 signature before uploading the artifact.
- iOS Simulator and signed iOS IPA jobs are deliberately disabled for automatic Android pushes. They can be run later by an explicit workflow dispatch after the owner requests iOS work and configures Apple credentials.
- Physical Android installation and device-specific German TTS playback still require a real Android phone.
- Production authentication, cloud sync, billing and live AdMob remain out of scope.

See `docs/TEST_REPORT.md`, `docs/IMAGE_AUDIT.md` and `docs/BUILD_AND_RELEASE.md`.
