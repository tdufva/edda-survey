import survey from '../analysis/survey.json';
export const SORT_ARCHETYPES = [
  'Continued Growth',
  'Collapse',
  'Discipline',
  'Transformation',
] as const;
export type Archetype = (typeof SORT_ARCHETYPES)[number];
export type Board = Record<Archetype, string[]>;
export const sourceCards = survey.respondents.flatMap((r) =>
  r.answers.map((text, i) => ({
    id: `R${r.id}-Q${String(i + 1).padStart(2, '0')}`,
    respondent: `R${r.id}`,
    question: survey.questions[i].short,
    text,
  })),
);
export const emptyBoard = (): Board => ({
  'Continued Growth': [],
  Collapse: [],
  Discipline: [],
  Transformation: [],
});
export function addCard(board: Board, archetype: Archetype, id: string): Board {
  if (!sourceCards.some((c) => c.id === id) || board[archetype].includes(id))
    return board;
  return { ...board, [archetype]: [...board[archetype], id] };
}
export function removeCard(
  board: Board,
  archetype: Archetype,
  id: string,
): Board {
  return { ...board, [archetype]: board[archetype].filter((x) => x !== id) };
}
export function exportBoard(board: Board) {
  return JSON.stringify(
    {
      format: 'edda-dator-sorting',
      version: 1,
      snapshot: survey.refreshed_at,
      source: sourceCards,
      placements: board,
      saved_at: new Date().toISOString(),
    },
    null,
    2,
  );
}
export function importBoard(text: string): Board {
  const file = JSON.parse(text);
  if (
    file.format !== 'edda-dator-sorting' ||
    file.version !== 1 ||
    file.snapshot !== survey.refreshed_at ||
    JSON.stringify(file.source) !== JSON.stringify(sourceCards)
  )
    throw new Error('This file does not match this survey snapshot.');
  const result = emptyBoard();
  for (const a of SORT_ARCHETYPES) {
    const ids = file.placements?.[a];
    if (
      !Array.isArray(ids) ||
      ids.some(
        (id) => typeof id !== 'string' || !sourceCards.some((c) => c.id === id),
      ) ||
      new Set(ids).size !== ids.length
    )
      throw new Error('Invalid or duplicate answer identifiers.');
    result[a] = ids;
  }
  return result;
}
