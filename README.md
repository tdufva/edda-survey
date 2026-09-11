# EDDA Survey

An integrated thematic, AREAS and Jim Dator Four Futures analysis of the EDDA internationalisation survey. The source snapshot was refreshed from the supplied Google Sheet on 10 September 2026: **11 respondents, 33 answers** (previously 7 / 21).

## Research views

- `/`: refreshed thematic analysis, preserving the prior codebook and adding the four new respondents.
- `/responses/`: verbatim source answers under stable, numbered respondent identifiers.
- `/areas/`: a provisional actor landscape separating reported action from proposals and mixed evidence.
- `/dator/`: independent answer-level future coding, primary/secondary distributions, question comparisons, meaning units and co-occurrence.
- `/comparison/`: interactive 4 × 5 matrix, primary versus secondary matches, source inspection and interpretive tensions.
- `/profiles/`: recurring profiles supported by at least two primary-primary answer matches.
- `/sorting/`: an initially empty manual Dator board, with respondent-grouped source cards, drag-to-copy across archetypes, keyboard/touch selection, removal, undo, and independent save/open arrangement files. It never changes the existing AI/researcher coding.
- `/validation/`: editable researcher coding with immutable original text and AI baseline.

The source uses **Shaped**, not “Shaping.” No pre-existing AREAS results were present in this repository. `analysis/coding.json` records the initial AI interpretive pass once and is reused by all framework views. It is not a keyword classifier or an automatically executing LLM service. New data needs a new interpretive coding pass; nothing is silently classified on page load.

## Data and provenance

`analysis/survey.json` is the exact exported answer text; timestamps are excluded. The first seven IDs retain their original row order, and R08–R11 are additions. The refresh also restores trailing whitespace present in the sheet that the old hand-entered page omitted. Original content is not edited for grammar or spelling.

`analysis/thematic.json` and `analysis/theme-codebook.csv` hold current counts and answer memberships. Prior seven-response counts remain in `analysis/theme-codebook-2026-09-01.csv`; `analysis/previous-response-page.txt` preserves the old published response reader. Historic response memberships were reconstructed from the original text because only aggregate thematic counts existed.

Counts are answer-level, not independent people or institutions. Percentages in the matrix divide by distinct answers coded in both dimensions within the active filters. Each cell counts an answer once, even with overlapping codes. Confidence remains ordinal; joint confidence is the lower label of the two frameworks. Empty categories are retained. AI coding is provisional and not researcher-validated.

## Saving research work

Edits apply to the current review layer and recalculate derived outputs. The root provider preserves applied edits during client-side navigation. **Save review file** downloads the complete JSON review; **Open review file** restores it after validation against the immutable source snapshot. Save before closing/reloading. No browser storage or shared server persistence is implied. An unload warning protects applied, unsaved changes. Unapplied editor drafts must be applied before navigating away.

Exports include Dator coding, aggregate data, matrix, combined CSV/JSON, quotations, profiles, reflexive notes and a Markdown analytical report. Section exports respect filters; a review file always contains every record. CSV formula-looking text is prefixed with an apostrophe for spreadsheet safety; JSON preserves exact text.

The methodological and actor-landscape prose is a dated baseline interpretation. Counts and recurring profiles update with researcher coding; fixed interpretive memos are clearly marked and can be contested in researcher notes. The survey did not provide a present actor-position map or a preferred future actor map, so no independently validated strategic gap analysis is claimed.

## Development and checks

```bash
pnpm install
pnpm dev
pnpm test:analysis
pnpm build:pages
pnpm test:pages
```

The architecture supports both the existing Sites deployment (`pnpm build`) and GitHub Pages (`pnpm build:pages`). Pushing `main` to GitHub publishes via the existing workflow. Researcher annotations are portable review files, not automatically committed or synced between researchers.
