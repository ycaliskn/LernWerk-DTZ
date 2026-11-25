# DeutschKraft — content coverage, source rights and release gate

## Product identity

- Product name: **DeutschKraft**
- Subtitle: **Deutsch A1–B1 · DTZ Vorbereitung**
- Promise: *Wort für Wort. Schritt für Schritt. Stark bis B1.*
- The mascot is an original commissioned-style image showing a learner lifting a barbell above an open book. The image is included as `app/assets/deutschkraft-mascot.png`; launcher icons are generated from the same source.

## Reference set inspected

1. BAMF / DTZ handbook, chapter 8 (sprachliche Inventare) and chapter 9 (Wortlisten): https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/Modellsaetze/dtz-handbuch_pdf.pdf?__blob=publicationFile&v=8
2. Goethe-Institut A1 Wortliste: https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf
3. Goethe-Institut A2 Wortliste: https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Wortliste.pdf
4. Goethe-Institut B1 Wortliste: https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf
5. Goethe-Institut DTZ practice and downloads (Modellsatz, audio, Prüfungshandbuch, Wortliste): https://www.goethe.de/de/spr/mig/deu.html
6. PONS DTZ Wortliste DE–TK: https://pons-langenscheidt-zusatzmaterial.de/audio-daten/DaF/Deutsch-Test%20f%C3%BCr%20Zuwanderer%20-%20wordlist%20DE-TK_final.pdf
7. User reference booklet: `DTZ_Hoeren_Lesen_Revize_Calisma_Kitapcigi.docx` (24 pages; PONS MT1–3 / telc reference, two g.a.s.t. model sets, reading-language analysis and high-yield grammar).
8. User's extended research booklet: `DTZ_Hoeren_Lesen_Genisletilmis_Arastirmali_Kitapcik.docx` (39 pages; revised source analysis and original exercises).
9. User's grammar reference: `Almanca_Grammatik_B1_DTZ_Goethe_Tam_Rehber.pdf` and supporting preposition / conjunction guides.

## What the official DTZ list actually says

The BAMF handbook says the DTZ vocabulary inventory covers A1, A2 and B1 and contains approximately **2,700 entries in total**. It is split into a word-group list and an alphabetical list; entries occur in one part or the other, so the counts must not be added together. The alphabetical part has approximately 2,100 main entries and 600 indented secondary entries. The manual explicitly says the lists are reference tools for test authors and teaching-material developers, and orientation aids for teachers—not a ready-made student textbook or a standalone exam-preparation syllabus.

The seven semantic groups are:

1. Abbreviations used in the DTZ
2. Exam instruction language
3. Numbers and dates (time, dates, weekdays, parts, seasons and holidays)
4. Currencies, measures and weights
5. Countries, continents, nationalities and languages
6. Educational institutions
7. Terms used in the Orientierungskurs final test (politics/democracy, history/responsibility, people/society)

The Goethe reference sizes commonly cited in the existing user research are approximately A1 650, A2 1,300 and B1 2,400. Those figures are not to be summed directly with the DTZ 2,700 because there is substantial overlap, and the B1 count varies by counting method (headwords, inflected forms, compounds and secondary entries). The exact app coverage report must count normalized lemmas, not PDF pages or raw OCR tokens.

## Important rights boundary

The BAMF manual is a copyrighted publication (Cornelsen / BAMF source); the Goethe wordlists are copyrighted Goethe materials; the PONS list carries PONS copyright. Their complete original selection, ordering, examples and tables must not simply be copied into a public GitHub repository or an app distributed publicly without the relevant permission. This repository therefore records them as **coverage references**, not as a license to reproduce the full lists. We will author our own Turkish and English meanings, examples, distractors, grammar explanations, exercises and illustrations. If a full verbatim reproduction of every official headword/entry is required for a public product, written redistribution permission is a release prerequisite.

No copied source example sentence is to be used as a learning card. Every app sentence must be independently authored and checked for grammar, meaning, naturalness and level.

## Level tagging policy

- `A1`, `A2`, `B1`: only when supported by the level-specific Goethe reference or a reviewed level crosswalk.
- `DTZ-extra`: an entry present in the BAMF DTZ inventory but not confidently mapped to one Goethe level.
- No automatic promotion to B1 merely because a word appears in a DTZ test sample.
- For A2 practice, the configured mix remains 75% A2 + 25% A1 review.
- For B1 practice, the configured mix remains 75% B1 + 25% A2 review; A1 is not mixed into B1 unless the user separately starts an A1 revision session.

## Image acceptance rules

Each learning card must have a distinct original image asset and a matching `image-audit` entry:

- relevance score from 1–5; scores below 4 are rejected and revised;
- separate visual concept for close nouns (e.g. Haus, Wohnung, Zimmer, Küche, Bad);
- visual should show the actual meaning, not just a generic category symbol;
- grammar visuals should diagram the structure (word order, case roles, clause boundary, tense timeline), not decorate it;
- learning cards and the direct stage of work mode show the card's image;
- the second, fill-in-the-blank stage has no image or answer-revealing hint.

## Current release gate

The current v0.5 app is only a small sample: 64 word cards, 31 verb cards, 28 grammar cards and 15 practice questions. It is not a complete A1/A2/B1 or DTZ release. This preview adds the DeutschKraft brand and a separate B1 Prüfungen hub, but must not be labelled as the full content release until the vocabulary and grammar coverage audits are complete.
