export type LetterState = 'found' | 'wrong' | 'not-found' | 'default';

export type Difficulty = 'easy' | 'medium' | 'hard';

// 难度级别显示信息
export interface DifficultyInfo {
  level: Difficulty;
  name: string;
  description: string;
  color: string;
}

// 单词API响应接口
export interface WordResponse {
  word: string;
  difficulty: Difficulty;
}

export interface GameCell {
  letter: string;
  state: LetterState;
}

export interface GameRow {
  cells: GameCell[];
  isCompleted: boolean;
}

export interface GameState {
  targetWord: string;
  difficulty: Difficulty | null; // 添加难度级别字段
  currentRow: number;
  rows: GameRow[];
  gameStatus: 'playing' | 'won' | 'lost';
  lettersCount: Record<string, number>;
  lettersFound: Record<string, number>;
  keyboardStates: Record<string, LetterState>;
}

export interface KeyboardLetterProps {
  letter: string;
  state: LetterState;
  onClick: (letter: string) => void;
}

export interface GameGridProps {
  rows: GameRow[];
}

export interface VirtualKeyboardProps {
  onLetterClick: (letter: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  keyboardStates: Record<string, LetterState>;
  disabled?: boolean;
}

export const FRENCH_KEYBOARD_LAYOUT = [
  // 第一行（主区）
  ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  // 第二行（主区）
  ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
  // 第三行（主区）
  ['w', 'x', 'c', 'v', 'b', 'n'],
  // 第四行（特殊字母+操作键，分组排列）
  ['backspace', 'é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'œ', 'enter'],
  // 第五行（补充特殊字母）
  ['ù', 'û', 'ü', 'ô', 'î', 'ï']
];

export const AUDIO_FILES = {
  found: '/sound/found.wav',
  wrong: '/sound/wrong.wav',
  notFound: '/sound/not-found.wav',
  win: '/sound/win.mp3',
} as const; 

// 今日状态（兼容新API结构）
export interface TodayStatus {
  hasPlayed: boolean;
  isWon: boolean;
  attempts: number;
  gameTime: number;
  sessionId: string;
}

// 每日挑战统计（兼容新API结构）
export interface DailyStats {
  dailyChallengesPlayed: number;
  dailyChallengesWon: number;
  dailyWinRate: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
}

// 整体统计（兼容新API结构）
export interface OverallStats {
  totalGamesPlayed: number;
  totalGamesWon: number;
  overallWinRate: number;
  currentWinStreak: number;
  longestWinStreak: number;
  averageAttempts: number;
  averageGameTime: number;
  skillLevel: string;
}

// 个人统计（兼容新API结构）
export interface PersonalStats {
  todayStatus?: TodayStatus;
  dailyStats?: DailyStats;
  overallStats?: OverallStats;
  recentHistory?: Array<{
    date: string;
    isWon: boolean;
    attempts: number;
    gameTime: number;
  }>;
}

// 服务器统计（兼容新API结构）
export interface ServerStats {
  totalParticipants: number;
  totalCompleted: number;
  totalWon: number;
  winRate: number;
  completionRate: number;
  averageAttempts: number;
  averageGameTime: number;
  attemptsDistribution: number[];
  topPerformers: Array<{
    userId?: string;
    attempts: number;
    gameTime: number;
    rank: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    type: 'completed' | 'won' | 'failed';
    attempts?: number;
  }>;
  isActive: boolean;
}

// 兼容旧版本的简化统计接口（用于本地模式）
export interface LegacyPersonalStats {
  totalChallenges: number;
  totalWins: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  averageAttempts: number;
}