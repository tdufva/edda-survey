import baseline from '../analysis/coding.json';
import survey from '../analysis/survey.json';
export const DATOR = [
  'Continued Growth',
  'Collapse',
  'Discipline',
  'Transformation',
] as const;
export const AREAS = [
  'Architecting',
  'Resisting',
  'Exploiting',
  'Avoiding',
  'Shaped',
] as const;
export const UNCLEAR = 'Unclear / Not classifiable';
export type Coding = (typeof baseline)[number];
export const initialCoding: Coding[] = baseline;
export { survey };
export const datorCodes = (r: Coding) =>
  [...new Set([r.dator_primary, ...r.dator_secondary])].filter((x) =>
    DATOR.includes(x as (typeof DATOR)[number]),
  );
export const areasCodes = (r: Coding) =>
  [...new Set([r.areas_primary, ...r.areas_secondary])].filter((x) =>
    AREAS.includes(x as (typeof AREAS)[number]),
  );
export const percent = (n: number, d: number) =>
  d ? Math.round((n / d) * 1000) / 10 : 0;
export function confidence(rows: Coding[]) {
  // Ordinal labels are retained, not averaged as if they were measured probabilities.
  return ['High', 'Medium', 'Low'].map((level) => ({
    level,
    count: rows.filter(
      (r) =>
        (r.dator_confidence === 'Low' || r.areas_confidence === 'Low'
          ? 'Low'
          : r.dator_confidence === 'Medium' || r.areas_confidence === 'Medium'
            ? 'Medium'
            : 'High') === level,
    ).length,
  }));
}
export function themes(rows: Coding[]) {
  const counts: Record<string, number> = {};
  rows.forEach((r) =>
    new Set(r.themes).forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    }),
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([theme, count]) => ({ theme, count }));
}
export function aggregate(rows: Coding[]) {
  const coded = rows.filter((r) => datorCodes(r).length);
  return {
    denominator: rows.length,
    coded: coded.length,
    unclear: rows.length - coded.length,
    distribution: DATOR.map((archetype) => ({
      archetype,
      primary: rows.filter((r) => r.dator_primary === archetype).length,
      secondary: rows.filter((r) => r.dator_secondary.includes(archetype))
        .length,
      associated: rows.filter((r) => datorCodes(r).includes(archetype)).length,
      percent_all_answers: percent(
        rows.filter((r) => datorCodes(r).includes(archetype)).length,
        rows.length,
      ),
      percent_coded_answers: percent(
        rows.filter((r) => datorCodes(r).includes(archetype)).length,
        coded.length,
      ),
      themes: themes(rows.filter((r) => datorCodes(r).includes(archetype))),
      quotations: rows
        .filter((r) => datorCodes(r).includes(archetype))
        .slice(0, 3)
        .map((r) => ({ id: r.id, quote: r.dator_quote })),
    })),
    by_question: survey.questions.map((q) => ({
      question_id: q.id,
      total: rows.filter((r) => r.question_id === q.id).length,
      counts: [...DATOR, UNCLEAR].map((archetype) => ({
        archetype,
        count: rows.filter(
          (r) => r.question_id === q.id && r.dator_primary === archetype,
        ).length,
      })),
    })),
    hybrids: [
      ...new Set(
        rows
          .filter((r) => datorCodes(r).length > 1)
          .map((r) => datorCodes(r).sort().join(' + ')),
      ),
    ].map((hybrid) => ({
      hybrid,
      count: rows.filter(
        (r) =>
          datorCodes(r).length > 1 &&
          datorCodes(r).sort().join(' + ') === hybrid,
      ).length,
    })),
    cooccurrence: DATOR.flatMap((a, i) =>
      DATOR.slice(i + 1).map((b) => ({
        a,
        b,
        count: rows.filter(
          (r) => datorCodes(r).includes(a) && datorCodes(r).includes(b),
        ).length,
      })),
    ),
  };
}
export function matrix(rows: Coding[], primaryOnly = false) {
  const eligible = rows.filter(
    (r) => datorCodes(r).length && areasCodes(r).length,
  );
  return DATOR.flatMap((dator) =>
    AREAS.map((areas) => {
      const matches = eligible.filter((r) =>
        primaryOnly
          ? r.dator_primary === dator && r.areas_primary === areas
          : datorCodes(r).includes(dator) && areasCodes(r).includes(areas),
      );
      return {
        dator,
        areas,
        count: matches.length,
        denominator: eligible.length,
        percent: percent(matches.length, eligible.length),
        primary_primary: matches.filter(
          (r) => r.dator_primary === dator && r.areas_primary === areas,
        ).length,
        secondary_involved: matches.filter(
          (r) => r.dator_primary !== dator || r.areas_primary !== areas,
        ).length,
        respondents: [...new Set(matches.map((r) => r.respondent_id))],
        ids: matches.map((r) => r.id),
        themes: themes(matches),
        confidence: confidence(matches),
        quotations: matches
          .slice(0, 2)
          .map((r) => ({ id: r.id, quote: r.dator_quote })),
        matches,
      };
    }),
  );
}
export const reflexiveNotes = [
  'The unit is one answer to one question, not one person. Answers from the same respondent are related; counts cannot be treated as independent observations or population estimates.',
  'The questions solicit barriers, ideals and remedies, not alternative-future scenarios. Current scarcity is not automatically Collapse; technology, identity learning and joint courses are not automatically Transformation.',
  'AREAS concerns action. Proposed coordination is kept separate from reported activity. An ideal does not establish an actor’s resources, authority or current position. Mixed answers contain both enabled and constrained action.',
  'Shaped is the source framework’s fifth position. Shaping is not used as an alias for active design. Ordinary use of a grant is not enough to establish Exploiting; criticism and low motivation are not enough to establish Resisting.',
  'Dator exposes institutional continuity and values in an imagined future even when AREAS cannot identify any action. AREAS exposes present constraints even when Dator has no future-oriented material to code.',
  'The two dimensions can be different without contradicting each other: an actor can build small course elements and still lack resources for long-term collaboration. A response-level cross-product indicates co-presence, not a proven causal relationship between each actor and each future.',
  'Discipline is contested in this corpus: coordination can be an instrument for continued growth rather than a distinct future. Secondary codes retain this ambiguity. Confidence is an ordinal analytic judgement, not a calibrated probability; joint confidence takes the lower of the two labels.',
  'Empty cells mean no supporting coded answers in this sample and filter. They do not demonstrate that a position or future is absent from the wider landscape. Rare answers can be analytically important.',
  'Survey participants describe other actors; these are accounts, not independently verified institutional facts. No respondent-supplied present actor map or preferred future positioning map was provided. No validated preferred-map gap analysis is claimed.',
  'Names and timestamps are omitted, but detailed quotations can reveal institutional or national context. These identifiers are pseudonyms, not a guarantee of anonymity.',
  'Initial coding is an AI interpretive pass dated 10 September 2026, not consensus coding or researcher validation. Original text and the initial coding are immutable; researcher revisions form a separate review layer. Save the review file to preserve edits across sessions.',
];
export function profiles(rows: Coding[]) {
  return matrix(rows, true)
    .filter((c) => c.count >= 2)
    .map((c) => ({
      title: `${c.dator} + ${c.areas}`,
      count: c.count,
      ids: c.ids,
      themes: c.themes,
      quotations: c.quotations,
      description: `${c.count} answers combine ${c.dator} as their dominant future orientation with ${c.areas} as their primary action position.`,
      interpretation:
        c.areas === 'Architecting'
          ? c.dator === 'Discipline'
            ? 'These answers locate change in coordinated provision: workload, staffing, schedules or curriculum rules. Designing participation conditions matters more here than predicting a radically new university.'
            : 'These answers couple expanded existing exchange with concrete course, project or infrastructure design. They show that Architecting can reproduce and improve the existing system.'
          : `The combination is supported by these answer-level codes; inspect the different actors and action scopes before treating it as a shared strategic identity.`,
      exceptions: c.matches
        .filter((r) => r.dator_secondary.length || r.areas_secondary.length)
        .map((r) => ({
          id: r.id,
          rationale: `${r.dator_secondary.length ? 'Dator secondary: ' + r.dator_secondary.join(', ') + '. ' : ''}${r.areas_secondary.length ? 'AREAS secondary: ' + r.areas_secondary.join(', ') + '. ' : ''}${r.areas_rationale}`,
        })),
      scope: c.matches.reduce(
        (a, r) => ({ ...a, [r.areas_scope]: (a[r.areas_scope] || 0) + 1 }),
        {} as Record<string, number>,
      ),
      caveat:
        'Recurring means at least two answers, not two independent institutions. Proposed action does not show implementation capacity; this threshold is descriptive, not statistical.',
    }));
}
export function combined(rows: Coding[]) {
  return rows.map((r) => ({
    ...r,
    matrix_position: datorCodes(r).flatMap((d) =>
      areasCodes(r).map((a) => ({
        dator: d,
        areas: a,
        match:
          r.dator_primary === d && r.areas_primary === a
            ? 'primary-primary'
            : 'secondary-involved',
      })),
    ),
  }));
}
export function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v: unknown) => {
    let t =
      v === null || v === undefined
        ? ''
        : typeof v === 'string'
          ? v
          : typeof v === 'number' ||
              typeof v === 'boolean' ||
              typeof v === 'bigint'
            ? String(v)
            : JSON.stringify(v);
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
    return '"' + t.replaceAll('"', '""') + '"';
  };
  return [
    headers.map(cell).join(','),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(',')),
  ].join('\r\n');
}
export function parseReview(text: string): { rows: Coding[]; notes: string } {
  const value = JSON.parse(text);
  if (
    value.schema_version !== 1 ||
    !Array.isArray(value.rows) ||
    value.rows.length !== initialCoding.length
  )
    throw new Error(
      'This review file does not match the 33-answer survey snapshot.',
    );
  const seen = new Set<string>();
  const rows = value.rows.map((r: Coding) => {
    const original = initialCoding.find((b) => b.id === r.id);
    if (
      !original ||
      seen.has(r.id) ||
      r.original_response !== original.original_response ||
      r.respondent_id !== original.respondent_id ||
      r.question_id !== original.question_id
    )
      throw new Error(
        'Duplicate ID or changed source response. Import rejected; current work is unchanged.',
      );
    seen.add(r.id);
    if (
      ![...DATOR, UNCLEAR].includes(
        r.dator_primary as (typeof DATOR)[number],
      ) ||
      ![...AREAS, 'Unclear'].includes(r.areas_primary) ||
      !Array.isArray(r.dator_secondary) ||
      !Array.isArray(r.areas_secondary) ||
      r.dator_secondary.some(
        (x) =>
          !DATOR.includes(x as (typeof DATOR)[number]) || x === r.dator_primary,
      ) ||
      r.areas_secondary.some(
        (x) =>
          !AREAS.includes(x as (typeof AREAS)[number]) || x === r.areas_primary,
      ) ||
      new Set(r.dator_secondary).size !== r.dator_secondary.length ||
      new Set(r.areas_secondary).size !== r.areas_secondary.length ||
      (r.dator_primary === UNCLEAR && r.dator_secondary.length) ||
      (r.areas_primary === 'Unclear' && r.areas_secondary.length)
    )
      throw new Error('Invalid primary or secondary codes.');
    if (
      !['High', 'Medium', 'Low'].includes(r.dator_confidence) ||
      !['High', 'Medium', 'Low'].includes(r.areas_confidence) ||
      !['Reported', 'Proposed', 'Mixed', 'Unspecified'].includes(
        r.areas_scope,
      ) ||
      !['Global', 'Regional/Sectoral', 'Local'].includes(r.areas_scale) ||
      typeof r.researcher_validated !== 'boolean'
    )
      throw new Error('Invalid confidence, scope, scale or validation status.');
    for (const k of [
      'dator_rationale',
      'areas_rationale',
      'researcher_notes',
      'dator_quote',
      'areas_quote',
    ] as const)
      if (typeof r[k] !== 'string') throw new Error('Invalid text field.');
    if (
      !r.dator_quote.trim() ||
      !r.areas_quote.trim() ||
      !r.original_response.includes(r.dator_quote) ||
      !r.original_response.includes(r.areas_quote)
    )
      throw new Error('Evidence must be verbatim.');
    if (
      !Array.isArray(r.themes) ||
      r.themes.some((x) => typeof x !== 'string') ||
      !Array.isArray(r.meaning_units) ||
      !r.meaning_units.length ||
      r.meaning_units.some(
        (u) =>
          typeof u.text !== 'string' ||
          !r.original_response.includes(u.text) ||
          typeof u.rationale !== 'string' ||
          !Array.isArray(u.dator_codes) ||
          u.dator_codes.some(
            (x) => !DATOR.includes(x as (typeof DATOR)[number]),
          ),
      )
    )
      throw new Error('Invalid meaning units or themes.');
    return {
      ...original,
      dator_primary: r.dator_primary,
      dator_secondary: r.dator_secondary,
      dator_confidence: r.dator_confidence,
      dator_rationale: r.dator_rationale,
      dator_quote: r.dator_quote,
      areas_primary: r.areas_primary,
      areas_secondary: r.areas_secondary,
      areas_confidence: r.areas_confidence,
      areas_rationale: r.areas_rationale,
      areas_quote: r.areas_quote,
      areas_scope: r.areas_scope,
      areas_scale: r.areas_scale,
      themes: r.themes,
      meaning_units: r.meaning_units,
      researcher_validated: r.researcher_validated,
      researcher_notes: r.researcher_notes,
      origin:
        r.origin === 'AI interpretation'
          ? 'AI interpretation'
          : 'Researcher interpretation',
    };
  });
  return { rows, notes: typeof value.notes === 'string' ? value.notes : '' };
}
export function report(rows: Coding[], notes: string) {
  const a = aggregate(rows),
    m = matrix(rows),
    p = profiles(rows);
  return `# EDDA: Dator × AREAS\n\nSurvey refreshed ${survey.refreshed_at}. ${rows.length} answer-level records; ${a.coded} Dator-coded; ${m[0].denominator} jointly coded. Counts describe the current export selection, not a population.\n\n## Dator distribution\n\n${a.distribution.map((d) => `- ${d.archetype}: ${d.primary} primary; ${d.secondary} secondary; ${d.associated} associated (${d.percent_all_answers}% of all selected answers).`).join('\n')}\n\nUnclear: ${a.unclear}.\n\n## Matrix\n\n${m.map((c) => `- ${c.dator} × ${c.areas}: ${c.count}/${c.denominator} (${c.percent}%), ${c.primary_primary} primary-primary; ${c.secondary_involved} secondary-involved. Evidence: ${c.ids.join(', ') || 'none'}.`).join('\n')}\n\n## Interpreting the matrix\n\n${DATOR.map(
    (d) => {
      const cells = m
        .filter((c) => c.dator === d)
        .sort((a, b) => b.count - a.count);
      return cells[0].count
        ? `${d}: the leading AREAS associations are ${cells
            .filter((c) => c.count === cells[0].count)
            .map((c) => c.areas)
            .join(' and ')} (${cells[0].count} answers in each leading cell).`
        : `${d}: no jointly coded evidence; no dominant position can be inferred.`;
    },
  ).join(
    '\n\n',
  )}\n\n${m.filter((c) => c.count === 0).length} cells are empty; ${m.filter((c) => c.count === 1).length} have one supporting answer. Absence applies to this selection, not the wider landscape.\n\n### Question differences\n\n${survey.questions
    .map((q) => {
      const qm = matrix(
        rows.filter((r) => r.question_id === q.id),
        true,
      );
      return `${q.id} (${q.short}): ${qm[0].denominator} jointly coded; ${
        qm
          .filter((c) => c.count)
          .map((c) => `${c.dator} × ${c.areas}: ${c.count}`)
          .join('; ') || 'no primary-primary matches'
      }.`;
    })
    .join(
      '\n\n',
    )}\n\n### Baseline tensions to review after changing codes\n\nR09-Q03 describes self-initiated course elements alongside dependence on dedicated resources. Local Architecting can coexist with being Shaped. R11-Q03 reports institutional incentives while barriers persist. R03-Q03 proposes a grant application and pilots; ordinary grant use is not evidence of arbitrage. R07-Q03 proposes mandatory learning, whereas R04-Q02 values academic freedom and plurality: Discipline contains different views of obligation. R11-Q02 bypasses travel through remote participation; Avoiding is tentative because this still advances international learning. These are source-linked baseline readings, not automatically regenerated conclusions.\n\n## Interpretive profiles\n\n${p.map((x) => `### ${x.title}\n\n${x.description} ${x.interpretation}\n\n${x.quotations.map((q) => `> ${q.quote}\n> — ${q.id}`).join('\n\n')}\n\nExceptions: ${x.exceptions.map((e) => e.id + ': ' + e.rationale).join(' ') || 'No secondary-coded exceptions in this selection.'}\n\n${x.caveat}`).join('\n\n')}\n\n## Framework limitations and analytical tensions\n\n${reflexiveNotes.map((n) => '- ' + n).join('\n')}\n\n## Researcher interpretation\n\n${notes || 'No researcher memo added.'}\n\n## Sources\n\n- [AREAS, 10F Consortium](https://www.10fconsortium.org/areas)\n- [Jim Dator, Alternative Futures at the Manoa School (2009)](https://jfsdigital.org/articles-and-essays/2009-2/vol-14-no-2-november/articles/futuristsalternative-futures-at-the-manoa-school/)\n`;
}
