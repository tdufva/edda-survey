'use client';
import { useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { GripVertical, Plus, X, Undo2, Download } from 'lucide-react';
import survey from '../../analysis/survey.json';
import {
  categories,
  type Framework,
  sourceCards,
  addCard,
  removeCard,
  emptyBoard,
  exportBoard,
  importBoard,
  type Archetype,
} from '../../lib/sorting';
import { useSorting } from '../sorting-provider';
import { download } from '../research-provider';
const descriptions: Record<Archetype, string> = {
  'Continued Growth': 'Expansion or improvement within existing systems.',
  Collapse: 'Deterioration, fragmentation or breakdown.',
  Discipline: 'Shared rules, coordination or deliberate limits.',
  Transformation: 'A fundamental change in the logic of the system.',
  Architecting:
    'Creating rules, infrastructure or arrangements that direct change.',
  Resisting: 'Actively opposing, slowing or reversing change.',
  Exploiting:
    'Using opportunities created by gaps or friction between systems.',
  Avoiding: 'Bypassing change through parallel or alternative arrangements.',
  Shaped:
    'Adapting within constraints without meaningful control of their direction.',
};
export default function SortingBoard({
  framework = 'dator',
}: {
  framework?: Framework;
}) {
  const isAreas = framework === 'areas';
  const title = isAreas ? 'AREAS sorting board' : 'Dator sorting board';
  const positionWord = isAreas ? 'position' : 'archetype';
  const boardCategories = categories(framework);
  const route = isAreas ? '/areas-sorting/' : '/sorting/';
  const { board, change, undo, canUndo, dirty, markSaved } =
    useSorting(framework);
  const [selected, setSelected] = useState<string | null>(null),
    [hover, setHover] = useState<Archetype | null>(null),
    [message, setMessage] = useState(''),
    [dragging, setDragging] = useState<string | null>(null),
    [replaceFile, setReplaceFile] = useState<string | null>(null);
  const gesture = useRef<{
    id: string;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const assigned = new Set(Object.values(board).flat());
  function place(a: Archetype, id: string) {
    const next = addCard(board, a, id);
    if (next === board) {
      setMessage(`${id} is already in ${a}.`);
    } else {
      change(next);
      setMessage(`${id} added to ${a}. The source card remains available.`);
    }
    setHover(null);
  }
  function target(x: number, y: number) {
    return document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('[data-archetype]')?.dataset.archetype as
      | Archetype
      | undefined;
  }
  function start(e: PointerEvent<HTMLButtonElement>, id: string) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { id, x: e.clientX, y: e.clientY, moved: false };
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g) return;
    if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 6) g.moved = true;
    if (g.moved) {
      setDragging(g.id);
      setHover(target(e.clientX, e.clientY) || null);
    }
  }
  function end(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    setDragging(null);
    setHover(null);
    if (g.moved) {
      const a = target(e.clientX, e.clientY);
      if (a) place(a, g.id);
      else
        setMessage(
          `No placement made. Drop the card inside a ${positionWord}.`,
        );
    } else setSelected(g.id);
  }
  function readFile(text: string) {
    try {
      const next = importBoard(text, framework);
      change(next);
      markSaved();
      setSelected(null);
      setReplaceFile(null);
      setMessage('Saved arrangement opened.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to open this file.',
      );
      setReplaceFile(null);
    }
  }
  function card(id: string, archetype?: Archetype) {
    const c = sourceCards.find((x) => x.id === id)!;
    return (
      <article
        key={id}
        className={`sort-card ${selected === id ? 'selected' : ''}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', id);
          e.dataTransfer.effectAllowed = 'copy';
          setDragging(id);
        }}
        onDragEnd={() => {
          setDragging(null);
          setHover(null);
        }}
      >
        <div className="sort-card-top">
          <button
            className="drag-handle"
            aria-label={`Drag or select ${id}`}
            title={`Drag to a ${positionWord}, or select then choose Add selected answer`}
            onPointerDown={(e) => start(e, id)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={() => {
              gesture.current = null;
              setDragging(null);
              setHover(null);
            }}
            onClick={() => setSelected(id)}
          >
            <GripVertical size={18} />
          </button>
          <strong>{id}</strong>
          <span>{c.question}</span>
          {archetype && (
            <button
              className="sort-remove"
              aria-label={`Remove ${id} from ${archetype}`}
              onClick={() => {
                change(removeCard(board, archetype, id));
                setMessage(
                  `${id} removed from ${archetype}. Other placements are unchanged.`,
                );
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
        {c.text.length > 360 ? (
          <>
            <p>{c.text.slice(0, 300)}…</p>
            <details>
              <summary>Read full answer</summary>
              <p>{c.text}</p>
            </details>
          </>
        ) : (
          <p>{c.text}</p>
        )}
        {!archetype && (
          <div className="card-placements">
            {boardCategories
              .filter((a) => board[a].includes(id))
              .map((a) => (
                <span key={a}>{a}</span>
              ))}
          </div>
        )}
        <button
          className="select-card"
          aria-pressed={selected === id}
          onClick={() => {
            setSelected(selected === id ? null : id);
            setMessage(
              `Select a ${positionWord} for ${id} using Add selected answer.`,
            );
          }}
        >
          {selected === id
            ? `Selected · choose a ${positionWord}`
            : 'Select to place'}
        </button>
      </article>
    );
  }
  return (
    <main className="research-page sorting-page">
      <header className="site-header">
        <Link className="brand" href="/">
          <span>EDDA</span>
          <span>survey</span>
        </Link>
        <Link href="/comparison/">Dator × AREAS ↗</Link>
      </header>
      <nav className="research-tabs" aria-label="Analysis sections">
        {[
          ['Thematic', '/'],
          ['AREAS', '/areas/'],
          ['Dator Analysis', '/dator/'],
          ['Dator × AREAS Matrix', '/comparison/'],
          ['Interpretive Profiles', '/profiles/'],
          ['Validation', '/validation/'],
          ['Dator sorting board', '/sorting/'],
          ['AREAS sorting board', '/areas-sorting/'],
        ].map(([label, path]) => (
          <Link
            key={path}
            href={path}
            aria-current={path === route ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="sort-heading">
        <div>
          <div className="section-kicker">
            Manual interpretation · {survey.respondents.length} respondents ·{' '}
            {sourceCards.length} answers
          </div>
          <h1>{title}</h1>
          <p>
            Drag each answer into one or more{' '}
            {isAreas ? 'AREAS positions' : 'archetypes'}. Source cards stay in
            place, so you can use the same answer again. This board starts empty
            and keeps your sorting separate from the existing AI coding and the
            other sorting board.
          </p>
          {isAreas && (
            <p className="fine-print">
              Place evidence of what actors do, rather than their identity or
              wishes. “Shaped” describes constrained agency. A proposal is not
              proof of action; leave an answer unplaced if the evidence is
              insufficient.
            </p>
          )}
        </div>
        <div className="sort-tools">
          <button
            onClick={() => {
              download(
                `edda-${framework}-sorting.json`,
                exportBoard(board, framework),
              );
              markSaved();
              setMessage(
                'Arrangement downloaded. Keep this file to resume later.',
              );
            }}
          >
            <Download size={16} /> Save arrangement
          </button>
          <label className="file-button">
            Open arrangement
            <input
              aria-label="Open arrangement"
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const text = await file.text();
                    importBoard(text, framework);
                    if (dirty) setReplaceFile(text);
                    else readFile(text);
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : 'Unable to read file.',
                    );
                  }
                  e.target.value = '';
                }
              }}
            />
          </label>
          <button
            disabled={!canUndo}
            onClick={() => {
              undo();
              setMessage('Last change undone.');
            }}
          >
            <Undo2 size={16} /> Undo
          </button>
          <button
            disabled={!assigned.size}
            onClick={() => {
              change(emptyBoard(framework));
              setMessage('Board cleared. Use Undo to restore it.');
            }}
          >
            Clear board
          </button>
        </div>
      </div>
      <div className="sort-status">
        <strong>
          {assigned.size}/{sourceCards.length} answers placed ·{' '}
          {Object.values(board).flat().length} placements
        </strong>
        <span>
          {dirty ? 'Unsaved changes. ' : ''}Save a file before closing or
          reloading. Applied arrangements remain available while navigating this
          site.
        </span>
      </div>
      {replaceFile && (
        <div className="notice">
          You have unsaved placements. Open the file and replace this
          arrangement?{' '}
          <button onClick={() => readFile(replaceFile)}>Open file</button>
          <button onClick={() => setReplaceFile(null)}>
            Keep current arrangement
          </button>
          <p>
            You can use Undo after opening to recover the previous arrangement.
          </p>
        </div>
      )}
      <div className="sort-announcement">
        <output aria-live="polite">
          {message ||
            `Drag a card, or select it and use “Add selected answer” in a ${positionWord}.`}
        </output>
        {selected && (
          <button onClick={() => setSelected(null)}>
            Clear selection: {selected}
          </button>
        )}
      </div>
      <div className="sorting-layout">
        <section className="source-panel" aria-labelledby="source-heading">
          <h2 id="source-heading">Answers by respondent</h2>
          <p className="fine-print">
            Original wording · each card is one complete answer. Long answers
            can be expanded.
          </p>
          <div className="source-scroll">
            {survey.respondents.map((r) => (
              <section key={r.id} className="respondent-source">
                <h3>Respondent R{r.id}</h3>
                <div className="respondent-card-grid">
                  {sourceCards
                    .filter((c) => c.respondent === `R${r.id}`)
                    .map((c) => card(c.id))}
                </div>
              </section>
            ))}
          </div>
        </section>
        <section
          className="archetype-panel"
          aria-labelledby="archetype-heading"
        >
          <h2 id="archetype-heading">
            {isAreas
              ? 'Five positions · your interpretation'
              : 'Four futures · your interpretation'}
          </h2>
          <p className="fine-print">
            A card can appear once in each {positionWord}. Removing one
            placement leaves its other placements intact.
          </p>
          <div
            className={`archetype-grid ${isAreas ? 'areas-sorting-grid' : ''}`}
          >
            {boardCategories.map((a, i) => (
              <section
                key={a}
                data-archetype={a}
                className={`archetype-lane lane-${i} ${hover === a ? 'drop-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  setHover(a);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                    setHover(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (sourceCards.some((c) => c.id === id)) place(a, id);
                  setDragging(null);
                  setHover(null);
                }}
                aria-label={`${a} drop area`}
              >
                <div className="lane-heading">
                  <h3>{a}</h3>
                  <span>{board[a].length}</span>
                </div>
                <p className="lane-description">{descriptions[a]}</p>
                <button
                  className="add-selected"
                  disabled={!selected}
                  onClick={() => selected && place(a, selected)}
                >
                  <Plus size={15} />
                  Add selected answer{selected ? ` · ${selected}` : ''}
                </button>
                <div className="lane-cards">
                  {board[a].length ? (
                    board[a].map((id) => card(id, a))
                  ) : (
                    <p className="drop-hint">
                      Drop answers here
                      <br />
                      <small>Unassigned until you make a placement</small>
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
      {dragging && (
        <div className="drag-notice" aria-live="polite">
          Moving a copy of {dragging}
          {hover ? ` → ${hover}` : ` · drop into a ${positionWord}`}
        </div>
      )}
    </main>
  );
}
