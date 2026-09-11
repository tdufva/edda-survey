'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { emptyBoard, type Board, type Framework } from '../lib/sorting';
type SortingContext = {
  board: Board;
  change: (b: Board) => void;
  undo: () => void;
  canUndo: boolean;
  dirty: boolean;
  markSaved: () => void;
};
const Context = createContext<Record<Framework, SortingContext> | null>(null);
export default function SortingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dator = useBoardState('dator');
  const areas = useBoardState('areas');
  return (
    <Context.Provider value={{ dator, areas }}>{children}</Context.Provider>
  );
}
function useBoardState(framework: Framework): SortingContext {
  const [history, setHistory] = useState<Board[]>([emptyBoard(framework)]);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return {
    board: history[history.length - 1],
    change: (b) => {
      setHistory((h) => [...h, b]);
      setDirty(true);
    },
    undo: () => {
      setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
      setDirty(true);
    },
    canUndo: history.length > 1,
    dirty,
    markSaved: () => setDirty(false),
  };
}

export function useSorting(framework: Framework = 'dator') {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Missing sorting provider');
  return ctx[framework];
}
