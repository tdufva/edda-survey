import survey from '../analysis/survey.json';
export const SORT_ARCHETYPES = [
  'Continued Growth',
  'Collapse',
  'Discipline',
  'Transformation',
] as const;
export const SORT_POSITIONS = [
  'Architecting',
  'Resisting',
  'Exploiting',
  'Avoiding',
  'Shaped',
] as const;
export type Framework = 'dator' | 'areas';
export type Archetype =
  | (typeof SORT_ARCHETYPES)[number]
  | (typeof SORT_POSITIONS)[number];
export type Board = Record<string, string[]>;
export const categories = (framework: Framework) =>
  framework === 'areas' ? SORT_POSITIONS : SORT_ARCHETYPES;
export const sourceCards = survey.respondents.flatMap((r) =>
  r.answers.map((text, i) => ({
    id: `R${r.id}-Q${String(i + 1).padStart(2, '0')}`,
    respondent: `R${r.id}`,
    question: survey.questions[i].short,
    text,
  })),
);
export const emptyBoard = (framework: Framework = 'dator'): Board =>
  Object.fromEntries(categories(framework).map((a) => [a, []]));
export function addCard(board: Board, archetype: Archetype, id: string): Board {
  if (
    !board[archetype] ||
    !sourceCards.some((c) => c.id === id) ||
    board[archetype].includes(id)
  )
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
export function exportBoard(board: Board, framework: Framework = 'dator') {
  return JSON.stringify(
    {
      format: `edda-${framework}-sorting`,
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
export function importBoard(
  text: string,
  framework: Framework = 'dator',
): Board {
  const file = JSON.parse(text);
  if (
    !file ||
    file.format !== `edda-${framework}-sorting` ||
    file.version !== 1 ||
    file.snapshot !== survey.refreshed_at ||
    JSON.stringify(file.source) !== JSON.stringify(sourceCards)
  )
    throw new Error(
      `Open a ${framework.toUpperCase()} sorting file for this survey snapshot.`,
    );
  const result = emptyBoard(framework);
  for (const a of categories(framework)) {
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
