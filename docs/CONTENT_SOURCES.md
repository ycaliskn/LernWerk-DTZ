# Content sources and editorial policy

Primary official references (checked 25 November 2026):

- Goethe-Zertifikat A1: Start Deutsch 1 – exam page and A1 word-list PDF: https://www.goethe.de/de/spr/prf/ueb/pa1.html and https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf
- Goethe-Zertifikat A2 – exam page and A2 word-list PDF: https://www.goethe.de/de/spr/prf/ueb/pa2.html and https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Wortliste.pdf
- Goethe-Zertifikat B1 – exam page and B1 word-list PDF: https://www.goethe.de/de/spr/prf/ueb/pb1.html and https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf
- Deutsch-Test für Zuwanderer – Goethe-Institut page containing DTZ model sets, listening examples, examination handbook and DTZ word list: https://www.goethe.de/de/spr/mig/deu.html and https://www.goethe.de/resources/files/pdf209/dtz_wortliste.pdf
- BAMF DTZ handbook (exam design / CEFR scope reference): https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/Modellsaetze/dtz-handbuch_pdf.pdf?__blob=publicationFile&v=6
- BAMF / Deutsch-Test für Zuwanderer: use the current official DTZ handbook, exam guidelines and publicly supplied model tests as the exam-specific reference. Confirm the current document edition before every content release.
- telc: may be used as a secondary comparison source for CEFR progression, but the app's DTZ alignment must remain explicit.

Official-source observations:

- Goethe's A1 list describes its scope through topic groups and an alphabetical word list; its front matter says it is mainly a reference and recommends didactically structured materials for vocabulary practice. The A1 topics in `app/content.js` follow its ten broad topic groups.
- The official A1 word list identifies entries such as `der Apfel`, `die Arbeit`, `der Arzt`, `der Bus`, `das Buch`, `die Familie`, `die Wohnung`, `einkaufen`, `fahren`, `gehen` and `machen`. The small app demo uses original example sentences and distractors.
- Goethe's A2 and B1 word-list PDFs explicitly state that the works and their parts are protected by copyright and that reuse beyond legally permitted cases needs prior written permission. Their vocabulary is therefore used as a scope/reference for original content, not bulk-imported as copied text.
- These word lists are vocabulary references, not a single complete official grammar syllabus. Grammar topics are sequenced editorially for CEFR progression and cross-checked against official Goethe / DTZ sample tasks and exam documentation.

Editorial rules:

1. Maintain a source register for each content item: source organisation, source document/page, checked date and usage/licence note.
2. Do not bulk-copy a protected commercial course or teacher's PDF. Create original Turkish/English explanations, example sentences, questions and distractors; use external word-list facts only within the applicable legal terms.
3. A1 is the first content release. A2 and B1 stay unavailable until reviewed against their official lists and checked by a German-language reviewer. The DTZ itself assesses A2 and B1; A1 is included as the foundation learning path.
4. A language pack is not marked complete until translations, RTL rendering where relevant, plural forms, articles, example meanings and distractors are reviewed by a fluent reviewer.
5. Exam alignment does not imply affiliation, certification or endorsement by Goethe-Institut, telc or BAMF.

Bundled demo content is intentionally small and should not be presented as a complete Goethe / DTZ vocabulary catalogue.


Grammar references and level-by-level curriculum: see [`GRAMMAR_CURRICULUM.md`](GRAMMAR_CURRICULUM.md). The app presents the same reference register under “Resmî kaynaklar”, with direct links and rights notes.

## A1 word-list cross-check (25 November 2026)

The Goethe-Institut's official *Wortliste Goethe-Zertifikat A1: Start Deutsch 1* is linked directly in the in-app source register: https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf. The 29-page document describes an approximately 650-word inventory, 13 common word-group categories and A1 daily-life domains. It notes that roughly half of the listed words should be available as active vocabulary. LernWerk uses the official list as a scope/reference check; it does not reproduce the full list or its example sentences.

The public VHS-Lernportal A1 overview is also used for the 12-lesson grammar progression: https://www.vhs-lernportal.de/wws/bin/4007242-4008322-2-vhs_lp_themen-grammatik_a1.pdf. The overview includes pronouns and Präsens, word order and questions, articles, negation, accusative, separable verbs, time expressions, dative prepositions, imperative, modal verbs, Perfekt, comparative forms and ordinal numbers.
