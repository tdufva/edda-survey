'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { initialCoding, type Coding, parseReview } from '../lib/analysis';
type Review = {
  rows: Coding[];
  update: (r: Coding) => void;
  notes: string;
  setNotes: (s: string) => void;
  dirty: boolean;
  save: () => void;
  restore: (s: string) => void;
};
const Context = createContext<Review | null>(null);
export function download(
  name: string,
  content: string,
  type = 'application/json',
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ResearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rows, setRows] = useState<Coding[]>(initialCoding),
    [notes, writeNotes] = useState(''),
    [dirty, setDirty] = useState(false);
  const update = (r: Coding) => {
    setRows((prev) => prev.map((p) => (p.id === r.id ? r : p)));
    setDirty(true);
  };
  const value: Review = {
    rows,
    update,
    notes,
    setNotes: (s) => {
      writeNotes(s);
      setDirty(true);
    },
    dirty,
    save: () => {
      download(
        'edda-researcher-review.json',
        JSON.stringify(
          {
            schema_version: 1,
            survey_snapshot: '2026-09-10',
            saved_at: new Date().toISOString(),
            rows,
            notes,
          },
          null,
          2,
        ),
      );
      setDirty(false);
    },
    restore: (text) => {
      const review = parseReview(text);
      setRows(review.rows);
      writeNotes(review.notes);
      setDirty(false);
    },
  };
  return (
    <Context.Provider value={value}>
      {children}
      {dirty && <UnloadGuard />}
    </Context.Provider>
  );
}
function UnloadGuard() {
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);
  return null;
}
export function useResearch() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Research provider missing');
  return ctx;
}
