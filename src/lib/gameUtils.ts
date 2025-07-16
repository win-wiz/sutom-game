import { type GameState, type GameCell, type LetterState, type Difficulty } from '@/types/game';

export const DEFAULT_WORD = 'cacophonie';

export const getWordFromUrl = (): string => {
  if (typeof window === 'undefined') return DEFAULT_WORD;
  
  const params = new URLSearchParams(window.location.search);
  const encodedWord = params.get('word');
  
  if (!encodedWord) return DEFAULT_WORD;
  
  try {
    return atob(encodedWord);
  } catch {
    return DEFAULT_WORD;
  }
};

export const createEmptyCell = (letter = '.'): GameCell => ({
  letter,
  state: 'default'
});

export const createInitialGameState = (word: string): GameState => {
  return createInitialGameStateWithDifficulty(word, null);
};

export const createInitialGameStateWithDifficulty = (word: string, difficulty: Difficulty | null): GameState => {
  const lettersCount: Record<string, number> = {};
  
  // Compter le nombre d'occurrences de chaque lettre dans le mot cible
  for (const letter of word) {
    lettersCount[letter] = (lettersCount[letter] ?? 0) + 1;
  }
  
  // Créer la ligne initiale, la première lettre est déjà affichée
  const initialRow = {
    cells: word.split('').map((letter, index) => 
      createEmptyCell(index === 0 ? letter : '.')
    ),
    isCompleted: false
  };
  
  return {
    targetWord: word,
    difficulty,
    currentRow: 0,
    rows: [initialRow],
    gameStatus: 'playing',
    lettersCount,
    lettersFound: {},
    keyboardStates: {}
  };
};

export const checkLetter = (
  cellLetter: string,
  targetLetter: string,
  position: number,
  targetWord: string,
  lettersFound: Record<string, number>,
  lettersCount: Record<string, number>
): LetterState => {
  // Si la position de la lettre est correcte
  if (cellLetter === targetLetter) {
    return 'found';
  }
  
  // Si la lettre existe dans le mot mais à la mauvaise position
  if (
    targetWord.includes(cellLetter) &&
    (lettersFound[cellLetter] ?? 0) <= (lettersCount[cellLetter] ?? 0)
  ) {
    return 'wrong';
  }
  
  // La lettre n'existe pas dans le mot
  return 'not-found';
};

export const playAudio = (audioFile: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(audioFile);
    audio.play().catch(console.error);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isValidLetter = (key: string): boolean => {
  return /^[a-zA-Z]$/.test(key);
};

export const normalizeKey = (key: string): string => {
  return key.toLowerCase();
};

export const isRowComplete = (row: GameCell[]): boolean => {
  return row.every(cell => cell.letter !== '.');
};

export const isGameWon = (row: GameCell[], targetWord: string): boolean => {
  return row.map(cell => cell.letter).join('') === targetWord;
};