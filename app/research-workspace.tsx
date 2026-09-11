'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AREAS,
  DATOR,
  UNCLEAR,
  initialCoding,
  survey,
  aggregate,
  matrix,
  profiles,
  combined,
  csv,
  report,
  reflexiveNotes,
  areasCodes,
  type Coding,
} from '../lib/analysis';
import { download, useResearch } from './research-provider';
const colors: Record<string, string> = {
  'Continued Growth': '#34594c',
  Collapse: '#bf503b',
  Discipline: '#78629f',
  Transformation: '#447d92',
  [UNCLEAR]: '#7c807c',
};
const tabs = [
  ['Thematic', '/'],
  ['AREAS', '/areas/'],
  ['Dator Analysis', '/dator/'],
  ['Dator × AREAS Matrix', '/comparison/'],
  ['Interpretive Profiles', '/profiles/'],
  ['Validation', '/validation/'],
  ['Dator sorting board', '/sorting/'],
];
const definitions: Record<string, string> = {
  'Continued Growth': 'Existing institutions and practices expand or improve.',
  Collapse:
    'Practices, networks or institutions deteriorate or cannot continue.',
  Discipline:
    'Collective coordination, rules, values or intentional limits shape a future.',
  Transformation: 'The underlying logic of institutions or practices changes.',
  Architecting: 'Designing rules, infrastructure or governing arrangements.',
  Resisting: 'Actively opposing, slowing or reversing change.',
  Exploiting:
    'Working opportunities created by friction or gaps between systems.',
  Avoiding: 'Bypassing a transformation through alternative arrangements.',
  Shaped:
    'Navigating constraints without meaningful control of their direction.',
};
export default function ResearchWorkspace({
  view,
}: {
  view: 'areas' | 'dator' | 'comparison' | 'profiles' | 'validation';
}) {
  const { rows, dirty, save, restore, notes, setNotes } = useResearch();
  const [question, setQuestion] = useState('all'),
    [scope, setScope] = useState('all'),
    [status, setStatus] = useState('all'),
    [primaryOnly, setPrimaryOnly] = useState(false),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState(''),
    [cell, setCell] = useState<{ dator: string; areas: string } | null>(null),
    [message, setMessage] = useState('');
  const filtered = rows.filter(
    (r) =>
      (question === 'all' || r.question_id === question) &&
      (scope === 'all' || r.areas_scope === scope) &&
      (status === 'all' ||
        (status === 'validated'
          ? r.researcher_validated
          : !r.researcher_validated)) &&
      (!search ||
        `${r.id} ${r.original_response} ${r.themes.join(' ')}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const stats = aggregate(filtered),
    cells = matrix(filtered, primaryOnly),
    active = cell
      ? cells.find((c) => c.dator === cell.dator && c.areas === cell.areas)
      : null;
  const returnPosition = useRef(0);
  const inspect = (id: string) => {
    returnPosition.current = window.scrollY;
    setSelected(id);
  };
  useEffect(() => {
    if (selected)
      document
        .getElementById('coding-inspector')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected]);
  const title = {
    areas: 'Who can act on internationalisation?',
    dator: 'What futures do these answers imagine?',
    comparison: 'Future orientation × position toward change',
    profiles: 'Recurring combined orientations',
    validation: 'Read, question and revise the coding',
  }[view];
  function exportData(kind: string) {
    if (kind === 'report')
      return download(
        'edda-analytical-report.md',
        report(filtered, notes),
        'text/markdown',
      );
    if (kind === 'combined-csv')
      return download(
        'edda-combined-coding.csv',
        csv(combined(filtered)),
        'text/csv;charset=utf-8',
      );
    const content =
      kind === 'dator'
        ? filtered.map((r) => ({
            respondent_id: r.respondent_id,
            question_id: r.question_id,
            original_response: r.original_response,
            dator_primary: r.dator_primary,
            dator_secondary: r.dator_secondary,
            dator_confidence: r.dator_confidence,
            dator_rationale: r.dator_rationale,
            quote: r.dator_quote,
            meaning_units: r.meaning_units,
            researcher_validated: r.researcher_validated,
          }))
        : kind === 'aggregate'
          ? stats
          : kind === 'matrix'
            ? cells.map(({ matches: _matches, ...c }) => c)
            : kind === 'profiles'
              ? profiles(filtered)
              : kind === 'quotes'
                ? filtered.map((r) => ({
                    id: r.id,
                    respondent_id: r.respondent_id,
                    question_id: r.question_id,
                    quote: r.dator_quote,
                    areas_quote: r.areas_quote,
                    themes: r.themes,
                    researcher_validated: r.researcher_validated,
                  }))
                : kind === 'notes'
                  ? {
                      method: reflexiveNotes,
                      researcher_memo: notes,
                      respondent_notes: filtered
                        .filter((r) => r.researcher_notes)
                        .map((r) => ({ id: r.id, note: r.researcher_notes })),
                    }
                  : combined(filtered);
    download(
      `edda-${kind}.json`,
      JSON.stringify(
        {
          snapshot: survey.refreshed_at,
          filters: { question, scope, status, search, primaryOnly },
          unit: 'answer',
          data: content,
        },
        null,
        2,
      ),
    );
  }
  return (
    <main className="research-page">
      <header className="site-header">
        <Link className="brand" href="/">
          <span>EDDA</span>
          <span>survey</span>
        </Link>
        <Link href="/responses/">Original responses ↗</Link>
      </header>
      <nav className="research-tabs" aria-label="Analysis sections">
        {tabs.map(([label, path]) => (
          <Link
            key={path}
            href={path}
            aria-current={path === `/${view}/` ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="research-body">
        <div className="section-kicker">
          11 respondents · 33 answers · refreshed {survey.refreshed_at}
        </div>
        <h1>{title}</h1>
        <p className="research-intro">
          {view === 'areas'
            ? 'AREAS reads action and agency. This is a provisional map inferred from the answers, not an independently supplied actor map.'
            : view === 'dator'
              ? 'Dator asks what kind of future is imagined. A present barrier is not automatically a future scenario.'
              : 'Dator asks what future is imagined. AREAS asks how an actor is positioned toward change. These are complementary dimensions.'}
        </p>
        <div className="review-bar">
          <span className="badge">
            Empirical material → AI interpretation → researcher review
          </span>
          <span>
            {rows.filter((r) => r.researcher_validated).length}/{rows.length}{' '}
            validated
          </span>
          <button onClick={save}>Save review file</button>
          <label className="file-button">
            Open review file
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  try {
                    restore(await f.text());
                    setMessage(
                      'Review restored. Original survey text is unchanged.',
                    );
                  } catch (error) {
                    setMessage(String(error));
                  }
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
        <p className="fine-print">
          {dirty ? 'Unsaved revisions. ' : ''}Revisions stay available while
          navigating these tabs. Save a review file before closing or reloading;
          open it to resume on any device. This static application does not
          automatically save reviews to a server.
        </p>
        <output>{message}</output>
        <div className="filters">
          <label>
            Question
            <select
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setSelected('');
              }}
            >
              <option value="all">All questions</option>
              {survey.questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} · {q.short}
                </option>
              ))}
            </select>
          </label>
          <label>
            AREAS action evidence
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all">All scopes (includes proposals)</option>
              {['Reported', 'Proposed', 'Mixed', 'Unspecified'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Review status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All coding</option>
              <option value="validated">Researcher-validated</option>
              <option value="unvalidated">Not validated</option>
            </select>
          </label>
          <label>
            Find evidence
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Response ID, words or theme"
            />
          </label>
        </div>
        <div className="research-stats">
          <div>
            <strong>{filtered.length}</strong>
            <span>answers in selection</span>
          </div>
          <div>
            <strong>{stats.coded}</strong>
            <span>Dator classifiable</span>
          </div>
          <div>
            <strong>{cells[0].denominator}</strong>
            <span>coded in both frameworks</span>
          </div>
          <div>
            <strong>{stats.unclear}</strong>
            <span>unclear future orientation</span>
          </div>
        </div>
        {!filtered.length && (
          <p className="notice">
            No answers match these filters. Change the selection to inspect
            evidence.
          </p>
        )}
        {view === 'areas' && (
          <AreasLandscape rows={filtered} inspect={inspect} />
        )}
        {view === 'dator' && (
          <>
            <section className="research-section">
              <h2>Primary future orientation</h2>
              <p>
                Counts use {filtered.length} selected answers as the
                denominator, including Unclear. Secondary associations overlap.
              </p>
              <div className="bars">
                {[...DATOR, UNCLEAR].map((d) => {
                  const n = filtered.filter(
                    (r) => r.dator_primary === d,
                  ).length;
                  return (
                    <button
                      key={d}
                      className="bar-row"
                      onClick={() => {
                        setSelected(
                          filtered.find((r) => r.dator_primary === d)?.id || '',
                        );
                      }}
                      disabled={!n}
                    >
                      <span>{d}</span>
                      <span className="bar-track">
                        <span
                          style={{
                            width: `${filtered.length ? (n / filtered.length) * 100 : 0}%`,
                            background: colors[d],
                          }}
                        />
                      </span>
                      <b>
                        {n}/{filtered.length} ·{' '}
                        {filtered.length
                          ? Math.round((n / filtered.length) * 100)
                          : 0}
                        %
                      </b>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="research-section">
              <h2>Question wording changes what becomes visible</h2>
              {stats.by_question.map((q) => (
                <div key={q.question_id} className="stack-row">
                  <strong>
                    {q.question_id} ·{' '}
                    {
                      survey.questions.find((s) => s.id === q.question_id)
                        ?.short
                    }
                  </strong>
                  <div
                    className="stack"
                    aria-label={q.counts
                      .map((c) => `${c.archetype}: ${c.count}`)
                      .join('; ')}
                  >
                    {q.counts
                      .filter((c) => c.count)
                      .map((c) => (
                        <span
                          key={c.archetype}
                          style={{
                            width: `${(c.count / (q.total || 1)) * 100}%`,
                            background: colors[c.archetype],
                          }}
                          title={`${c.archetype}: ${c.count}/${q.total}`}
                        >
                          {c.count}
                        </span>
                      ))}
                  </div>
                  <div className="fine-print">
                    {q.counts
                      .map((c) => `${c.archetype}: ${c.count}`)
                      .join(' · ')}
                  </div>
                </div>
              ))}
              <p>
                Barrier answers chiefly describe current conditions; ideal and
                remedy questions invite preferred futures. A question effect
                must not be mistaken for a difference between respondent groups.
              </p>
            </section>
            <section className="research-section">
              <h2>Associations, themes and evidence</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Archetype</th>
                      <th>Primary</th>
                      <th>Secondary</th>
                      <th>Associated / all answers</th>
                      <th>Themes and source evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.distribution.map((d) => (
                      <tr key={d.archetype}>
                        <th>
                          {d.archetype}
                          <small>{definitions[d.archetype]}</small>
                        </th>
                        <td>{d.primary}</td>
                        <td>{d.secondary}</td>
                        <td>
                          {d.associated}/{filtered.length} ·{' '}
                          {d.percent_all_answers}%
                          <small>
                            {d.percent_coded_answers}% of Dator-coded answers
                          </small>
                        </td>
                        <td>
                          {d.themes
                            .slice(0, 4)
                            .map((t) => `${t.theme} (${t.count})`)
                            .join(' · ') || 'No supporting evidence'}
                          {d.quotations.map((q) => (
                            <Quote key={q.id} {...q} inspect={inspect} />
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="research-section">
              <h2>Hybrids and co-occurrence</h2>
              {stats.hybrids.length ? (
                stats.hybrids.map((h) => (
                  <p key={h.hybrid}>
                    <b>{h.hybrid}</b> · {h.count} answers
                  </p>
                ))
              ) : (
                <p>No hybrid futures in this selection.</p>
              )}
              <div className="cooccurrence">
                {stats.cooccurrence.map((c) => (
                  <div key={c.a + c.b}>
                    <span>
                      {c.a} + {c.b}
                    </span>
                    <strong>{c.count}</strong>
                  </div>
                ))}
              </div>
              <p>
                These are simultaneous associations. The data does not establish
                a temporal sequence such as Growth → Transformation.
              </p>
              <h3>Tensions within the archetypes</h3>
              <p>
                Growth includes both modest, occasional exchange (R09-Q02) and
                experience for every student (R11-Q02). Discipline includes
                participation rules (R07-Q03) and freedom and pluralism
                (R04-Q02). A shared label therefore does not imply agreement
                about volume, obligation or whose voice matters. These are
                baseline interpretive contrasts; review the linked answers when
                changing codes.
              </p>
              <Evidence
                ids={['R09-Q02', 'R11-Q02', 'R07-Q03', 'R04-Q02']}
                inspect={inspect}
              />
              <h3>Answers that resist the model</h3>
              <p>
                {stats.unclear} selected answers lack sufficient future
                material. Empty Collapse and Transformation categories, when
                present, reflect the evidence and coding threshold, not an
                inability of respondents to imagine them.
              </p>
              <Evidence
                ids={filtered
                  .filter((r) => r.dator_primary === UNCLEAR)
                  .map((r) => r.id)}
                inspect={inspect}
              />
            </section>
          </>
        )}
        {view === 'comparison' && (
          <>
            <section className="research-section matrix-section">
              <div className="section-line">
                <h2>Dator × AREAS</h2>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={primaryOnly}
                    onChange={(e) => setPrimaryOnly(e.target.checked)}
                  />
                  Primary-primary only
                </label>
              </div>
              <p>
                Each cell counts distinct answers, not code pairs or people.
                Percentages divide by{' '}
                <b>{cells[0].denominator} jointly coded answers</b> in this
                selection. Secondary codes can place one answer in multiple
                cells; totals may exceed 100%.{' '}
                {filtered.length - cells[0].denominator} answers are excluded
                because one or both dimensions are unclear.
              </p>
              <div className="table-scroll">
                <table className="matrix">
                  <caption>
                    Choose a cell to inspect its evidence and edit coding below.
                  </caption>
                  <thead>
                    <tr>
                      <th>Future ↓ / position →</th>
                      {AREAS.map((a) => (
                        <th key={a} scope="col">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DATOR.map((d) => (
                      <tr key={d}>
                        <th scope="row" aria-label={d}>
                          {d}
                        </th>
                        {cells
                          .filter((c) => c.dator === d)
                          .map((c) => (
                            <td key={c.areas}>
                              <button
                                aria-label={`${d} × ${c.areas}: ${c.count} answers, ${c.percent}%`}
                                aria-pressed={
                                  cell?.dator === d && cell.areas === c.areas
                                }
                                onClick={() => {
                                  setCell({ dator: d, areas: c.areas });
                                  setSelected('');
                                }}
                                className={c.count ? 'has-evidence' : ''}
                              >
                                <strong>{c.count}</strong>
                                <span>{c.percent}%</span>
                                <small>
                                  {c.primary_primary} primary ·{' '}
                                  {c.secondary_involved} secondary
                                </small>
                                <small>
                                  {c.themes
                                    .slice(0, 2)
                                    .map((t) => t.theme)
                                    .join(' · ') || 'No coded evidence'}
                                </small>
                              </button>
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {active && (
                <section className="cell-detail" aria-live="polite">
                  <div className="section-line">
                    <h3>
                      {active.dator} × {active.areas}
                    </h3>
                    <button
                      onClick={() => {
                        setCell(null);
                        setSelected('');
                      }}
                    >
                      Clear cell
                    </button>
                  </div>
                  <p>
                    {active.count}/{active.denominator} answers ·{' '}
                    {active.percent}% · {active.respondents.length} distinct
                    respondents. Joint confidence:{' '}
                    {active.confidence
                      .map((c) => `${c.level} ${c.count}`)
                      .join(' · ')}
                    . Uses the lower label in each pair.
                  </p>
                  <p>
                    Key themes:{' '}
                    {active.themes
                      .map((t) => `${t.theme} (${t.count})`)
                      .join(' · ') || 'None'}
                    .
                  </p>
                  {active.quotations.map((q) => (
                    <Quote key={q.id} {...q} inspect={inspect} />
                  ))}
                  {active.matches.map((r) => (
                    <button
                      className="response-link"
                      key={r.id}
                      onClick={() => inspect(r.id)}
                    >
                      <b>{r.id}</b> ·{' '}
                      {r.dator_primary === active.dator &&
                      r.areas_primary === active.areas
                        ? 'primary-primary'
                        : 'secondary-involved'}{' '}
                      · {r.areas_scope} ·{' '}
                      {r.researcher_validated ? 'Validated' : 'Not validated'}
                      <span>
                        {r.original_response.slice(0, 160)}
                        {r.original_response.length > 160 ? '…' : ''}
                      </span>
                    </button>
                  ))}
                  {!active.count && (
                    <p>
                      No matching answer. This absence is a property of the
                      selected coding, not evidence that the combination cannot
                      exist.
                    </p>
                  )}
                </section>
              )}
            </section>
            <MatrixReading rows={filtered} inspect={inspect} />
          </>
        )}
        {view === 'profiles' && (
          <section className="research-section">
            <h2>Profiles supported by repeated primary matches</h2>
            <p>
              A profile requires at least two answer-level primary-primary
              matches in the current selection. Rare combinations remain
              available in the matrix.
            </p>
            {profiles(filtered).map((p) => (
              <article className="profile" key={p.title}>
                <span className="badge">
                  AI interpretation · {p.count} answers
                </span>
                <h3>{p.title}</h3>
                <p>
                  {p.description} {p.interpretation}
                </p>
                <p>
                  <b>Dominant themes:</b>{' '}
                  {p.themes
                    .slice(0, 5)
                    .map((t) => `${t.theme} (${t.count})`)
                    .join(' · ')}
                </p>
                <p>
                  <b>Action evidence:</b>{' '}
                  {Object.entries(p.scope)
                    .map(([s, n]) => `${s}: ${n}`)
                    .join(' · ')}
                </p>
                {p.quotations.map((q) => (
                  <Quote key={q.id} {...q} inspect={inspect} />
                ))}
                <h4>Exceptions and contradictions</h4>
                {p.exceptions.length ? (
                  p.exceptions.map((e) => (
                    <p key={e.id}>
                      <button
                        className="evidence-link"
                        onClick={() => inspect(e.id)}
                      >
                        {e.id}
                      </button>{' '}
                      {e.rationale}
                    </p>
                  ))
                ) : (
                  <p>
                    No secondary-coded exceptions in this selection. Shared
                    primary labels can still mask differences in scale and
                    authority.
                  </p>
                )}
                <p className="fine-print">{p.caveat}</p>
                <Evidence ids={p.ids} inspect={inspect} />
              </article>
            ))}
            {!profiles(filtered).length && (
              <p>
                No repeated primary-primary orientation in this selection. No
                profile has been invented to fill the gap.
              </p>
            )}
          </section>
        )}
        {view === 'validation' && (
          <section className="research-section">
            <h2>Coding register</h2>
            <p>
              Select an answer to compare immutable AI coding with editable
              researcher interpretation. Changing a code clears its validated
              status until you validate the revised record.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Answer</th>
                    <th>Dator primary</th>
                    <th>AREAS primary</th>
                    <th>Action scope</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button
                          className="evidence-link"
                          onClick={() => inspect(r.id)}
                        >
                          {r.id}
                        </button>
                      </td>
                      <td>
                        {r.dator_primary}
                        <small>{r.dator_secondary.join(' + ')}</small>
                      </td>
                      <td>
                        {r.areas_primary}
                        <small>{r.areas_secondary.join(' + ')}</small>
                      </td>
                      <td>{r.areas_scope}</td>
                      <td>
                        {r.researcher_validated
                          ? 'Researcher-validated'
                          : r.origin === 'AI interpretation'
                            ? 'AI · unvalidated'
                            : 'Researcher edited · unvalidated'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {selected && (
          <Editor
            key={selected}
            id={selected}
            close={() => {
              setSelected('');
              window.scrollTo({
                top: returnPosition.current,
                behavior: 'smooth',
              });
            }}
          />
        )}
        <section className="research-section">
          <h2>Framework limitations and analytical tensions</h2>
          <details>
            <summary>Read the methodological notes</summary>
            {reflexiveNotes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </details>
          <label className="memo-label">
            Researcher interpretation · analytical memo
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record competing readings, disagreements, missing actors and interpretation of the matrix."
              rows={4}
            />
          </label>
          <p className="fine-print">
            The memo is researcher-authored. Saving or editing it does not mark
            individual answers as validated.
          </p>
        </section>
        <section className="research-section">
          <h2>Export the current selection</h2>
          <p>
            Exports include current researcher revisions and validation flags.
            Save review file above stores the complete review regardless of
            filters. Evidence and thematic tags in exports are retained
            alongside code changes.
          </p>
          <div className="export-buttons">
            {[
              ['dator', 'Response-level Dator JSON'],
              ['aggregate', 'Dator aggregate JSON'],
              ['matrix', 'Matrix JSON'],
              ['combined', 'Combined dataset JSON'],
              ['combined-csv', 'Combined dataset CSV'],
              ['quotes', 'Quotations JSON'],
              ['profiles', 'Profiles JSON'],
              ['notes', 'Reflexive notes JSON'],
              ['report', 'Analytical report Markdown'],
            ].map(([k, l]) => (
              <button key={k} onClick={() => exportData(k)}>
                {l} ↓
              </button>
            ))}
          </div>
        </section>
        <p className="source-links">
          Framework sources:{' '}
          <a
            href="https://www.10fconsortium.org/areas"
            target="_blank"
            rel="noreferrer"
          >
            10F Consortium · AREAS ↗
          </a>{' '}
          ·{' '}
          <a
            href="https://jfsdigital.org/articles-and-essays/2009-2/vol-14-no-2-november/articles/futuristsalternative-futures-at-the-manoa-school/"
            target="_blank"
            rel="noreferrer"
          >
            Jim Dator · Alternative Futures at the Manoa School (2009) ↗
          </a>
        </p>
      </div>
    </main>
  );
}
function Evidence({
  ids,
  inspect,
}: {
  ids: string[];
  inspect: (id: string) => void;
}) {
  return (
    <div className="evidence-list">
      {ids.map((id) => (
        <button key={id} onClick={() => inspect(id)}>
          {id}
        </button>
      ))}
    </div>
  );
}
function Quote({
  id,
  quote,
  inspect,
}: {
  id: string;
  quote: string;
  inspect: (id: string) => void;
}) {
  return (
    <blockquote>
      <p>“{quote}”</p>
      <button onClick={() => inspect(id)}>{id} · inspect evidence ↗</button>
    </blockquote>
  );
}
function MatrixReading({
  rows,
  inspect,
}: {
  rows: Coding[];
  inspect: (id: string) => void;
}) {
  const cells = matrix(rows),
    empty = cells.filter((c) => !c.count),
    rare = cells.filter((c) => c.count === 1);
  return (
    <section className="research-section">
      <h2>Read relationships, not rankings</h2>
      <p className="badge">
        Descriptive counts recompute with coding · interpretations need
        researcher review
      </p>
      {DATOR.map((d) => {
        const c = cells
          .filter((c) => c.dator === d)
          .sort((a, b) => b.count - a.count);
        return (
          <p key={d}>
            <b>{d}:</b>{' '}
            {c[0].count
              ? `${c
                  .filter((x) => x.count === c[0].count)
                  .map((x) => x.areas)
                  .join(
                    ' and ',
                  )} has the most associations (${c[0].count} answers per leading cell). This includes proposals and secondary codes unless filtered; it does not establish control over the wider transformation.`
              : 'No jointly coded evidence. No dominant AREAS position can be inferred.'}
          </p>
        );
      })}
      <p>
        <b>
          {empty.length} empty cells; {rare.length} single-answer cells.
        </b>{' '}
        Sparse cells need close reading, not dismissal.
      </p>
      {rare.map((c) => (
        <div key={c.dator + c.areas}>
          {c.dator} × {c.areas}: <Evidence ids={c.ids} inspect={inspect} />
        </div>
      ))}
      <h3>Combinations by question</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Jointly coded answers</th>
              <th>Observed primary-primary combinations</th>
            </tr>
          </thead>
          <tbody>
            {survey.questions.map((q) => {
              const qm = matrix(
                rows.filter((r) => r.question_id === q.id),
                true,
              );
              return (
                <tr key={q.id}>
                  <th>
                    {q.id} · {q.short}
                  </th>
                  <td>
                    {qm[0].denominator}/
                    {rows.filter((r) => r.question_id === q.id).length}
                  </td>
                  <td>
                    {qm
                      .filter((c) => c.count)
                      .map((c) => `${c.dator} × ${c.areas}: ${c.count}`)
                      .join('; ') || 'None: one or both dimensions are unclear'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3>Agency at one scale, dependence at another</h3>
      <p>
        R09-Q03 reports small course changes but says long-term work lacks
        dedicated resources. Architecting and Shaped can coexist. R11-Q03
        describes incentives and a successful camp alongside persistent
        barriers; institutional action does not automatically remove constraints
        on participation.
      </p>
      <Evidence ids={['R09-Q03', 'R11-Q03']} inspect={inspect} />
      <h3>Growth is not automatically Exploiting</h3>
      <p>
        R03-Q03 proposes applying for a grant and piloting courses. It describes
        design within the existing system, not arbitrage between incompatible
        systems. Calling every opportunity Exploiting would artificially fill
        that column.
      </p>
      <Evidence ids={['R03-Q03']} inspect={inspect} />
      <h3>Coordination can expand participation and narrow choice</h3>
      <p>
        R07-Q03 suggests a mandatory curriculum element; R04-Q02 makes academic
        freedom and plurality conditions of an ideal. These are two different
        logics within Discipline. The dataset does not establish whether they
        can be reconciled.
      </p>
      <Evidence ids={['R07-Q03', 'R04-Q02']} inspect={inspect} />
      <h3>Avoiding travel can support internationalisation</h3>
      <p>
        R11-Q02 proposes distance participation when travel is impossible.
        Bypassing mobility requirements can sustain a growth-oriented
        internationalisation agenda. Calling this Avoiding depends on defining
        the transformation around physical mobility; under a broader definition
        of international learning it may be adaptation instead. Confidence is
        low for that reason.
      </p>
      <Evidence ids={['R11-Q02']} inspect={inspect} />
      <p className="fine-print">
        These named contrasts describe the initial interpretive pass, not
        automatically regenerated conclusions after every edit. Use the
        researcher memo to accept, contest or replace them. Filter by question
        to separate present barriers from imagined ideals and proposed remedies.
      </p>
    </section>
  );
}
function AreasLandscape({
  rows,
  inspect,
}: {
  rows: Coding[];
  inspect: (id: string) => void;
}) {
  return (
    <>
      <section className="research-section">
        <h2>Current evidence and proposed positions</h2>
        <p>
          The transformation tracked here is the effort to make
          internationalisation part of everyday education and research. These
          counts describe answers that mention actions, not a census of distinct
          actors. No preferred actor-position map was supplied.
        </p>
        <div className="position-grid">
          {AREAS.map((a) => {
            const matches = rows.filter((r) => areasCodes(r).includes(a));
            return (
              <article key={a}>
                <h3>{a}</h3>
                <p>{definitions[a]}</p>
                <strong>{matches.length} associated answers</strong>
                <p className="fine-print">
                  Reported:{' '}
                  {matches.filter((r) => r.areas_scope === 'Reported').length} ·
                  Proposed:{' '}
                  {matches.filter((r) => r.areas_scope === 'Proposed').length} ·
                  Mixed:{' '}
                  {matches.filter((r) => r.areas_scope === 'Mixed').length}
                </p>
                <Evidence ids={matches.map((r) => r.id)} inspect={inspect} />
                {!matches.length && (
                  <p>
                    No action evidence in this selection. This does not
                    establish absence outside the survey.
                  </p>
                )}
              </article>
            );
          })}
        </div>
        <p>
          Unplaced answers: {rows.filter((r) => !areasCodes(r).length).length}.
          Describing a value, a desired outcome or possible partnership does not
          necessarily establish a strategic action.
        </p>
      </section>
      <section className="research-section">
        <h2>Actor map inferred from reported action</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Actor / scale</th>
                <th>Position and evidence</th>
                <th>Limits of the inference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Staff and students · Local</th>
                <td>
                  Shaped by time, finance, curricular windows, employment and
                  care obligations.
                  <Evidence
                    ids={['R01-Q01', 'R05-Q01', 'R07-Q01', 'R11-Q01']}
                    inspect={inspect}
                  />
                </td>
                <td>
                  Accounts vary; these are not interchangeable constraints or
                  proof of a single collective actor.
                </td>
              </tr>
              <tr>
                <th>Faculty making small course changes · Local</th>
                <td>
                  Architecting small course elements while Shaped by longer-term
                  resources.
                  <Evidence ids={['R09-Q03']} inspect={inspect} />
                </td>
                <td>
                  Course-level discretion does not establish control over
                  staffing or university budgets.
                </td>
              </tr>
              <tr>
                <th>
                  Institution organising exchanges and projects · Local /
                  partnership reach
                </th>
                <td>
                  Architecting participation opportunities; tentatively Avoiding
                  travel barriers through remote/home alternatives.
                  <Evidence ids={['R11-Q01', 'R11-Q03']} inspect={inspect} />
                </td>
                <td>
                  One respondent reports these actions. The institution and
                  students occupy different roles in the same answer.
                </td>
              </tr>
              <tr>
                <th>Pedagogic unit · Local</th>
                <td>
                  Shaped by workload and low institutional priority.
                  <Evidence ids={['R10-Q01']} inspect={inspect} />
                </td>
                <td>
                  The allocation decision and decision-makers’ reasons are not
                  supplied.
                </td>
              </tr>
              <tr>
                <th>
                  English-speaking academics and local academic context · Local
                  / sectoral implications
                </th>
                <td>
                  Local context is described as Shaped by unequal interpretive
                  priority.
                  <Evidence ids={['R04-Q01']} inspect={inspect} />
                </td>
                <td>
                  Asymmetric influence is described, but intentional
                  rule-setting by English-speaking academics is not
                  demonstrated.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="research-section">
        <h2>Landscape reading</h2>
        <p>
          In the initial coding, Shaped is crowded in accounts of present
          conditions. Architecting becomes much more visible when answers
          describe remedies. Treating those remedies as accomplished power would
          make the landscape look more open than the evidence supports.
          Resisting and Exploiting lack direct action evidence: scepticism, low
          interest and normal grant applications do not meet those thresholds.
        </p>
        <Evidence ids={['R07-Q01', 'R03-Q03', 'R08-Q03']} inspect={inspect} />
        <h3>Vulnerabilities</h3>
        <p>
          R09 says central leadership already has ambition, yet funding remains
          hard to secure. Support at the top is therefore not evidence of a
          funded implementation route. R08 asks for a coordinator beyond project
          periods; continuity currently depends on a role whose sustained
          mandate is not established. R11 reports incentives alongside unchanged
          barriers, so motivation measures alone appear insufficient in that
          account.
        </p>
        <Evidence ids={['R09-Q01', 'R08-Q03', 'R11-Q03']} inspect={inspect} />
        <h3>Possible coalitions · hypotheses, not observed alliances</h3>
        <p>
          A constrained pedagogic unit (R10) and faculty already embedding small
          activities (R09) could share an interest in scheduled collaboration,
          even though one emphasises deprioritisation and the other local
          initiative. R08’s proposed academic coordinator and International
          office could divide academic matching and logistical work; the answer
          explicitly proposes complementarity. R04’s concern for plurality could
          align with R11’s concern for students unable to travel, around access
          that does not privilege a single language or mobility route. That last
          link is an analyst’s hypothesis; neither answer reports such a
          coalition.
        </p>
        <Evidence
          ids={['R10-Q01', 'R09-Q03', 'R08-Q03', 'R04-Q02', 'R11-Q02']}
          inspect={inspect}
        />
        <h3>Conditional routes to more room to act</h3>
        <p>
          R08 specifies a dependency: visiting-teacher information must arrive
          before registration so that students can reserve time, followed by
          partner agreement on credit recognition. A sustained academic
          coordinator also requires an employment mandate. R09’s existing small
          course changes show a narrower shift is already possible; they do not
          demonstrate that larger commitments can be financed. These are
          conditions inferred from proposals, not a preferred-map gap analysis.
          No structural impossibility can be established from these answers
          alone.
        </p>
        <Evidence ids={['R08-Q02', 'R08-Q03', 'R09-Q03']} inspect={inspect} />
        <h3>Blind spots</h3>
        <p>
          Budget holders and grant rules are mentioned but not mapped through
          their own actions. Student views are mostly reported by staff; paid
          work, family obligations and language confidence may need different
          responses. National curriculum authorities, partner schools and
          administrative workers are incompletely represented. English-language
          priority is named, but the survey does not show how it is reproduced
          in decisions. No answer supplies the resources, mandate or risk
          tolerance needed for a reliable feasibility assessment.
        </p>
        <Evidence
          ids={['R05-Q01', 'R07-Q01', 'R09-Q01', 'R11-Q01', 'R04-Q01']}
          inspect={inspect}
        />
        <p className="fine-print">
          This actor reading is a dated AI memo linked to source answers.
          Position counts above use current filtered coding; the memo does not
          silently change after researcher edits.
        </p>
      </section>
    </>
  );
}
function Editor({ id, close }: { id: string; close: () => void }) {
  const { rows, update } = useResearch();
  const current = rows.find((r) => r.id === id)!;
  const original = initialCoding.find((r) => r.id === id)!;
  const [draft, setDraft] = useState<Coding>(structuredClone(current)),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  const change = (patch: Partial<Coding>) => {
    setDraft((r) => ({
      ...r,
      ...patch,
      researcher_validated: false,
      origin: 'Researcher interpretation',
    }));
    setSaved(false);
  };
  const commit = () => {
    if (!draft.dator_rationale.trim() || !draft.areas_rationale.trim())
      return setError(
        'Both frameworks need a rationale, including when unclear.',
      );
    if (
      !draft.dator_quote.trim() ||
      !draft.areas_quote.trim() ||
      !draft.original_response.includes(draft.dator_quote) ||
      !draft.original_response.includes(draft.areas_quote)
    )
      return setError(
        'Evidence quotations must be non-empty, verbatim parts of the source answer.',
      );
    if (!draft.meaning_units.length)
      return setError(
        'Retain at least one meaning unit, even if it is unclassifiable.',
      );
    if (
      draft.meaning_units.some(
        (u) =>
          !u.text.trim() ||
          !draft.original_response.includes(u.text) ||
          !u.rationale.trim(),
      )
    )
      return setError(
        'Every meaning unit must be verbatim and have a rationale.',
      );
    update(draft);
    setError('');
    setSaved(true);
  };
  const selectPrimary = (framework: 'dator' | 'areas', value: string) => {
    if (framework === 'dator')
      change({
        dator_primary: value,
        dator_secondary:
          value === UNCLEAR
            ? []
            : draft.dator_secondary.filter((x) => x !== value),
      });
    else
      change({
        areas_primary: value,
        areas_secondary:
          value === 'Unclear'
            ? []
            : draft.areas_secondary.filter((x) => x !== value),
      });
  };
  return (
    <section
      id="coding-inspector"
      className="coding-editor research-section"
      aria-label={`Inspect ${id}`}
    >
      <div className="section-line">
        <div>
          <span className="section-kicker">Response inspector · {id}</span>
          <h2>
            {survey.questions.find((q) => q.id === current.question_id)?.short}
          </h2>
        </div>
        <button onClick={close}>Close inspector</button>
      </div>
      <div className="empirical">
        <span className="badge">
          Empirical material · original response · {current.respondent_id}
        </span>
        <p>{original.original_response}</p>
        <Link href={`/responses/#respondent-${current.respondent_id.slice(1)}`}>
          Read this respondent’s three answers ↗
        </Link>
      </div>
      <details className="ai-baseline">
        <summary>Immutable AI baseline · coded {original.coded_at}</summary>
        <h3>
          Dator: {original.dator_primary}
          {original.dator_secondary.length
            ? ' + ' + original.dator_secondary.join(' + ')
            : ''}
        </h3>
        <p>
          {original.dator_rationale}{' '}
          <b>{original.dator_confidence} confidence.</b>
        </p>
        <h3>
          AREAS: {original.areas_primary}
          {original.areas_secondary.length
            ? ' + ' + original.areas_secondary.join(' + ')
            : ''}
        </h3>
        <p>
          {original.areas_rationale}{' '}
          <b>
            {original.areas_confidence} confidence · {original.areas_scope}.
          </b>
        </p>
        <h4>Original meaning units</h4>
        {original.meaning_units.map((u, i) => (
          <p key={i}>
            “{u.text}” — {u.dator_codes.join(' + ') || 'Unclear'}: {u.rationale}
          </p>
        ))}
      </details>
      <div className="section-line">
        <h3>Researcher review layer</h3>
        <span className="badge">
          {current.researcher_validated
            ? 'Researcher-validated'
            : current.origin === 'AI interpretation'
              ? 'AI coding · awaiting review'
              : 'Researcher edited · unvalidated'}
        </span>
      </div>
      <div className="editor-columns">
        {(['dator', 'areas'] as const).map((f) => {
          const isD = f === 'dator',
            choices = isD ? DATOR : AREAS,
            primary = isD ? draft.dator_primary : draft.areas_primary,
            secondary = isD ? draft.dator_secondary : draft.areas_secondary;
          return (
            <fieldset key={f}>
              <legend>
                {isD ? 'Dator · future orientation' : 'AREAS · action position'}
              </legend>
              <label>
                Primary classification
                <select
                  value={primary}
                  onChange={(e) => selectPrimary(f, e.target.value)}
                >
                  {[...choices, isD ? UNCLEAR : 'Unclear'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <span>Secondary codes</span>
              <div className="secondary-options">
                {choices.map((c) => (
                  <label className="inline-check" key={c}>
                    <input
                      type="checkbox"
                      checked={secondary.includes(c)}
                      disabled={
                        c === primary ||
                        primary === UNCLEAR ||
                        primary === 'Unclear'
                      }
                      onChange={(e) =>
                        change({
                          [`${f}_secondary`]: e.target.checked
                            ? [...secondary, c]
                            : secondary.filter((x) => x !== c),
                        })
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
              <label>
                Confidence
                <select
                  value={isD ? draft.dator_confidence : draft.areas_confidence}
                  onChange={(e) =>
                    change({ [`${f}_confidence`]: e.target.value })
                  }
                >
                  {['High', 'Medium', 'Low'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Coding rationale
                <textarea
                  rows={5}
                  value={isD ? draft.dator_rationale : draft.areas_rationale}
                  onChange={(e) =>
                    change({ [`${f}_rationale`]: e.target.value })
                  }
                />
              </label>
              <label>
                Verbatim evidence
                <textarea
                  rows={2}
                  value={isD ? draft.dator_quote : draft.areas_quote}
                  onChange={(e) => change({ [`${f}_quote`]: e.target.value })}
                />
              </label>
            </fieldset>
          );
        })}
      </div>
      <div className="filters">
        <label>
          AREAS action scope
          <select
            value={draft.areas_scope}
            onChange={(e) => change({ areas_scope: e.target.value })}
          >
            {['Reported', 'Proposed', 'Mixed', 'Unspecified'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Scale
          <select
            value={draft.areas_scale}
            onChange={(e) => change({ areas_scale: e.target.value })}
          >
            {['Local', 'Regional/Sectoral', 'Global'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Themes (semicolon-separated)
          <input
            key={draft.themes.join('; ')}
            defaultValue={draft.themes.join('; ')}
            onBlur={(e) =>
              change({
                themes: e.target.value
                  .split(';')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </div>
      <details>
        <summary>Review meaning units ({draft.meaning_units.length})</summary>
        {draft.meaning_units.map((u, i) => (
          <div className="meaning-unit" key={i}>
            <label>
              Meaning unit {i + 1} · verbatim
              <textarea
                value={u.text}
                onChange={(e) =>
                  change({
                    meaning_units: draft.meaning_units.map((m, j) =>
                      j === i ? { ...m, text: e.target.value } : m,
                    ),
                  })
                }
              />
            </label>
            <div className="secondary-options">
              {DATOR.map((d) => (
                <label className="inline-check" key={d}>
                  <input
                    type="checkbox"
                    checked={u.dator_codes.includes(d)}
                    onChange={(e) =>
                      change({
                        meaning_units: draft.meaning_units.map((m, j) =>
                          j === i
                            ? {
                                ...m,
                                dator_codes: e.target.checked
                                  ? [...m.dator_codes, d]
                                  : m.dator_codes.filter((x) => x !== d),
                              }
                            : m,
                        ),
                      })
                    }
                  />
                  {d}
                </label>
              ))}
            </div>
            <label>
              Meaning-unit rationale
              <textarea
                value={u.rationale}
                onChange={(e) =>
                  change({
                    meaning_units: draft.meaning_units.map((m, j) =>
                      j === i ? { ...m, rationale: e.target.value } : m,
                    ),
                  })
                }
              />
            </label>
            <button
              onClick={() =>
                change({
                  meaning_units: draft.meaning_units.filter((_, j) => j !== i),
                })
              }
            >
              Remove unit
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            change({
              meaning_units: [
                ...draft.meaning_units,
                { text: '', dator_codes: [], rationale: '' },
              ],
            })
          }
        >
          Add meaning unit
        </button>
        <p className="fine-print">
          Meaning units and overall codes are separate interpretive decisions.
          Review both after making changes; they are not mechanically
          synchronised.
        </p>
      </details>
      <label>
        Researcher interpretation / disagreement
        <textarea
          value={draft.researcher_notes}
          onChange={(e) => change({ researcher_notes: e.target.value })}
        />
      </label>
      <label className="inline-check">
        <input
          type="checkbox"
          checked={draft.researcher_validated}
          onChange={(e) => {
            setDraft({
              ...draft,
              researcher_validated: e.target.checked,
              origin: 'Researcher interpretation',
            });
            setSaved(false);
          }}
        />
        I have reviewed and validated this answer’s coding
      </label>
      <div className="export-buttons">
        <button className="primary-button" onClick={commit}>
          Apply review to analysis
        </button>
        <button
          onClick={() => {
            setDraft(structuredClone(current));
            setError('');
            setSaved(false);
          }}
        >
          Discard unapplied edits
        </button>
        <button
          onClick={() => {
            setDraft({
              ...structuredClone(original),
              origin: 'Researcher interpretation',
            });
            setSaved(false);
          }}
        >
          Restore AI baseline in editor
        </button>
      </div>
      <output>
        {error ||
          (saved
            ? 'Review applied. Aggregates and matrix have recalculated. Save review file to keep your work.'
            : 'Changes in this editor take effect after Apply review to analysis.')}
      </output>
    </section>
  );
}
