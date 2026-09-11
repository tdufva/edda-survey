'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { emptyBoard, type Board } from '../lib/sorting';
type SortingContext = {
  board: Board;
  change: (b: Board) => void;
  undo: () => void;
  canUndo: boolean;
  dirty: boolean;
  markSaved: () => void;
};
const Context = createContext<SortingContext | null>(null);
export default function SortingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<Board[]>([emptyBoard()]);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return (
    <Context.Provider
      value={{
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
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSorting() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Missing sorting provider');
  return ctx;
}
