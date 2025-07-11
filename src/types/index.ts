// 游戏会话相关类型
export interface GameSession {
  sessionId: string;
  wordData: {
    id: number;
    encryptedWord: string;
    maskedWord: string;
    difficulty: string;
    length: number;
  };
  gameInfo: {
    attempts: number;
    maxAttempts: number;
    startTime: number;
    endTime?: number;
    isCompleted: boolean;
    isWon: boolean;
    gameTime?: number;
  };
  guesses: Array<{
    guess: string;
    isCorrect: boolean;
    timestamp: number;
  }>;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// 游戏开始请求
export interface StartGameRequest {
  difficulty?: 'easy' | 'medium' | 'hard';
  length?: number;
  maxAttempts?: number;
}

// 猜测请求
export interface GuessRequest {
  sessionId: string;
  guess: string;
}

// 猜测响应
export interface GuessResponse {
  isCorrect: boolean;
  attempts: number;
  maxAttempts: number;
  isCompleted: boolean;
  isWon: boolean;
  correctAnswer?: string;
  gameTime?: number;
  letterAnalysis: {
    letter: string;
    status: string;
    position: number;
    correctPosition: number;
    targetLetter: string;
  }[];
  // 根据 stats.md 添加单词统计（/guess 接口返回）
  wordStats?: {
    totalAttempts: number;
    totalSuccesses: number;
    successRate: number;
    averageAttemptsToWin: number;  // stats.md 中是 averageAttemptsToWin
    averageGameTime: number;
    perceivedDifficulty: number;
    sampleSize: number;
    lastPlayed: string;
  };
}

// 游戏统计 (/stats 接口)
export interface GameStats {
  overall: {
    totalSessions: number;      // 系统总游戏数
    completedSessions: number;  // 完成的游戏数
    wonSessions: number;        // 获胜的游戏数  
    winRate: number;            // 全系统胜率
    averageAttempts: number;    // 系统平均尝试次数
    averageGameTime: number;    // 系统平均游戏时间
  };
  dailyChallenge: {
    totalSessions: number;      // 每日挑战总数
  };
}

// 每日挑战统计接口 (/daily-stats/:date)
export interface DailyChallengeStats {
  server: {
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
  };
  personal?: {
    todayStatus: {
      hasPlayed: boolean;
      isWon: boolean;
      attempts: number;
      gameTime: number;
      sessionId: string;
    };
    dailyStats: {
      dailyChallengesPlayed: number;
      dailyChallengesWon: number;
      dailyWinRate: number;
      currentDailyStreak: number;
      longestDailyStreak: number;
    };
    overallStats: {
      totalGamesPlayed: number;
      totalGamesWon: number;
      overallWinRate: number;
      currentWinStreak: number;
      longestWinStreak: number;
      averageAttempts: number;
      averageGameTime: number;
      skillLevel: string;
    };
    recentHistory: Array<{
      date: string;
      isWon: boolean;
      attempts: number;
      gameTime: number;
    }>;
  };
}

// 单词信息
export interface WordInfo {
  id?: number;
  word: string;
  difficulty: string;
  length: number;
  definition?: string;
  origin?: string;
  category?: string;
  pronunciation?: string;
}

// 单词统计信息 (从 /guess 接口返回的 wordStats)
export interface WordStats {
  totalAttempts: number;
  totalSuccesses: number;
  successRate: number;
  averageAttempts: number;        // 用于本地模式兼容
  averageAttemptsToWin?: number;  // API返回的字段名
  averageGameTime: number;
  perceivedDifficulty: number;
  sampleSize?: number;
  lastPlayedAt?: string;          // 本地模式字段
  lastPlayed?: string;            // API返回的字段名
}

// 游戏结束响应数据
export interface EndGameData {
  sessionId: string;
  isWon: boolean;
  attempts: number;
  gameTime: number;
  wordInfo: WordInfo;
  wordStats: WordStats;
} 

// 每日挑战请求
export interface StartDailyChallengeRequest {
  date: string; // 日期
  difficulty?: string; // 难度
  maxAttempts?: number; // 最大尝试次数
  userId?: string; // 用户ID
}

// 每日挑战统计请求
export interface DailyStatsRequest {
  date: string; // 格式: YYYYMMDD
  userId?: string; // 可选的用户ID
}