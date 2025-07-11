import { type GameState, type GameCell, type LetterState, type Difficulty, AUDIO_FILES } from '@/types/game';

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
  
  // 统计目标单词中每个字母的出现次数
  for (const letter of word) {
    lettersCount[letter] = (lettersCount[letter] ?? 0) + 1;
  }
  
  // 创建初始行，第一个字母已显示
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
  // 如果字母位置正确
  if (cellLetter === targetLetter) {
    return 'found';
  }
  
  // 如果字母存在于单词中但位置错误
  if (
    targetWord.includes(cellLetter) &&
    (lettersFound[cellLetter] ?? 0) <= (lettersCount[cellLetter] ?? 0)
  ) {
    return 'wrong';
  }
  
  // 字母不存在于单词中
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