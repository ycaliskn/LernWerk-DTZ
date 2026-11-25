# DeutschKraft project status — content research and brand preview

## Brand / UI preview

- Product name: DeutschKraft
- Subtitle: Deutsch A1–B1 · DTZ Vorbereitung
- Original lifting-learner mascot and launcher icons added.
- Separate `B1 Prüfungen` hub added with Hören, Lesen, Schreiben and Sprechen placeholders.
- Internal package ID remains `de.lernwerk.dtz` intentionally, to preserve update compatibility and local progress from the earlier test build. A package-ID migration must be handled separately before a public store release.

## Current sample content (not the full catalogue)

- 64 vocabulary cards: 58 A1, 3 A2, 3 B1
- 31 verb cards
- 28 grammar cards
- 15 work-mode practice questions

This is not the complete Goethe A1/A2/B1 or BAMF DTZ word inventory. Do not advertise this preview as a complete exam-preparation app and do not issue it as the full-content release.

## Research findings

- The BAMF DTZ handbook describes about 2,700 entries across its word-group and alphabetical lists; the alphabetical section has roughly 2,100 main and 600 secondary entries.
- The BAMF list covers A1/A2/B1 and is meant as a reference for test/material authors, not as a ready-made student learning deck.
- The grammar coverage map records the seven major BAMF linguistic inventory groups and their subtopics.
- Official Goethe, BAMF and PONS materials are copyrighted. The app links to them for coverage checks and authors its own explanations, examples, questions and illustrations. Full verbatim list reproduction in a public repository requires redistribution permission.

## Verification

- Node tests: 46/46 in each of three consecutive runs (138/138).
- JavaScript syntax: 7 modules checked.
- Manifest/asset/service-worker checks: passed.
- No new APK was built for this preview because its word and grammar catalogues remain incomplete.

See `docs/CONTENT_SCOPE_AND_RIGHTS.md`, `docs/GRAMMAR_COVERAGE_MAP.md`, `docs/B1_PRUEFUNGEN_HUB.md` and `docs/TEST_REPORT.md`.
