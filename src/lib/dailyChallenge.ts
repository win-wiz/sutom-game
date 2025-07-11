import { wordService } from './wordService';
import { type Difficulty, type LegacyPersonalStats } from '@/types/game';
import { gameSessionAPI } from '@/services/api';
import type { DailyChallengeStats } from '@/types';

interface DailyChallengeState {
  date: string;
  word: string;
  difficulty: Difficulty;
  completed: boolean;
  attempts: number;
  won: boolean;
  guesses: string[];
  completedAt?: string;
  sessionId: string; // 改为必需字段
}

type DailyChallengeHistory = Record<string, DailyChallengeState>;

export class DailyChallengeService {
  private static readonly STORAGE_KEY = 'sutom-daily-challenge';
  private static readonly HISTORY_KEY = 'sutom-daily-challenge-history';

  /**
   * 将日期字符串转换为数字种子
   * 使用简单的哈希函数确保相同日期总是生成相同的种子
   */
  private static dateToSeed(dateString: string): number {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 获取今日日期字符串
   */
  private static getTodayString(): string {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]?.replace(/-/g, ''); // 获取今天日期
    if (!dateString) {
      throw new Error('无法获取今日日期');
    }
    return dateString;
  }

  /**
   * 基于日期生成每日挑战单词（完全随机）
   */
  private static generateDailyWord(dateString: string): { word: string; difficulty: Difficulty } {
    const seed = this.dateToSeed(dateString);
    
    // 获取所有单词，不分难度
    const allWords = wordService.getAllWords();
    
    if (allWords.length === 0) {
      throw new Error('没有可用的单词');
    }
    
    // 基于种子随机选择单词
    const wordIndex = seed % allWords.length;
    const selectedWord = allWords[wordIndex];
    
    if (!selectedWord) {
      throw new Error('无法获取单词');
    }
    
    return { word: selectedWord.word, difficulty: selectedWord.difficulty };
  }

  /**
   * 安全的localStorage操作 - 处理服务器端渲染
   */
  private static safeGetItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * 安全的localStorage操作 - 处理服务器端渲染
   */
  private static safeSetItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  /**
   * 获取今日挑战信息
   */
  static async getTodayChallenge(): Promise<DailyChallengeState> {
    const today = this.getTodayString();
    const stored = this.safeGetItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        const challenge = JSON.parse(stored) as DailyChallengeState;
        // 如果存储的是今天的挑战，直接返回
        if (challenge.date === today) {
          return challenge;
        }
      } catch (error) {
        console.error('解析每日挑战数据失败:', error);
      }
    }
    
    try {
      // 调用后台接口获取每日挑战
      const response = await gameSessionAPI.startDailyChallenge({ date: today });
      
      if (!response.success || !response.data) {
        throw new Error('获取每日挑战失败');
      }
      
      const { sessionId, wordData, gameInfo } = response.data;
      
      const newChallenge: DailyChallengeState = {
        date: today,
        word: wordData.maskedWord, // 使用掩码后的单词
        difficulty: wordData.difficulty as Difficulty,
        completed: false,
        attempts: gameInfo.attempts,
        won: false,
        guesses: [],
        sessionId, // 保存 sessionId
      };
      
      // 保存到本地存储
      this.safeSetItem(this.STORAGE_KEY, JSON.stringify(newChallenge));
      
      return newChallenge;
    } catch (error) {
      console.error('获取每日挑战失败:', error);
      throw error;
    }
  }

  /**
   * 更新今日挑战状态
   */
  static async updateTodayChallenge(updates: Partial<DailyChallengeState>): Promise<void> {
    const current = await this.getTodayChallenge();
    const updated = { ...current, ...updates };
    
    // 如果游戏完成，记录完成时间
    if (updated.completed && !current.completed) {
      updated.completedAt = new Date().toISOString();
    }
    
    // 更新当前挑战
    this.safeSetItem(this.STORAGE_KEY, JSON.stringify(updated));
    
    // 如果游戏完成，保存到历史记录
    if (updated.completed) {
      this.saveToHistory(updated);
    }
  }

  /**
   * 保存到历史记录
   */
  private static saveToHistory(challenge: DailyChallengeState): void {
    const historyStr = this.safeGetItem(this.HISTORY_KEY);
    let history: DailyChallengeHistory = {};
    
    if (historyStr) {
      try {
        history = JSON.parse(historyStr) as DailyChallengeHistory;
      } catch (error) {
        console.error('解析历史记录失败:', error);
        history = {};
      }
    }
    
    history[challenge.date] = challenge;
    this.safeSetItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * 获取历史记录
   */
  static getHistory(): DailyChallengeHistory {
    const historyStr = this.safeGetItem(this.HISTORY_KEY);
    if (!historyStr) return {};
    
    try {
      return JSON.parse(historyStr) as DailyChallengeHistory;
    } catch (error) {
      console.error('解析历史记录失败:', error);
      return {};
    }
  }

  /**
   * 获取每日挑战统计信息（使用新的 /daily-stats/:date 接口）
   */
  static async getDailyStats(date?: string, userId?: string): Promise<DailyChallengeStats | null> {
    const targetDate = date ?? this.getTodayString();
    
    try {
      const response = await gameSessionAPI.getDailyStats({
        date: targetDate,
        userId
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        console.warn('获取每日挑战统计失败:', response.message);
        return null;
      }
    } catch (error) {
      console.warn('调用getDailyStats API失败:', error);
      return null;
    }
  }

  /**
   * 获取统计信息（兼容旧接口，本地模式 + 服务器统计）
   */
  static async getStats(): Promise<{
    personal: LegacyPersonalStats;
    server: DailyChallengeStats['server'] | null;
  }> {
    // 个人统计（本地）
    const history = this.getHistory();
    const challenges = Object.values(history).sort((a, b) => a.date.localeCompare(b.date));
    const totalChallenges = challenges.length;
    const totalWins = challenges.filter(c => c.won).length;
    const winRate = totalChallenges > 0 ? (totalWins / totalChallenges) * 100 : 0;
    
    // 计算当前连胜
    let currentStreak = 0;
    for (let i = challenges.length - 1; i >= 0; i--) {
      const challenge = challenges[i];
      if (challenge?.won) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // 计算最长连胜
    let maxStreak = 0;
    let tempStreak = 0;
    for (const challenge of challenges) {
      if (challenge.won) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // 计算平均尝试次数
    const completedChallenges = challenges.filter(c => c.completed);
    const averageAttempts = completedChallenges.length > 0 
      ? completedChallenges.reduce((sum, c) => sum + c.attempts, 0) / completedChallenges.length
      : 0;
    
    const personal: LegacyPersonalStats = {
      totalChallenges,
      totalWins,
      winRate,
      currentStreak,
      maxStreak: maxStreak,
      averageAttempts,
    };
    
    // 全网统计（新接口）
    let server: DailyChallengeStats['server'] | null = null;
    try {
      const dailyStats = await this.getDailyStats();
      if (dailyStats?.server) {
        server = dailyStats.server;
      }
    } catch (e) {
      // 忽略错误，server 设为 null
      console.warn('获取服务器统计失败:', e);
    }
    
    return { personal, server };
  }

  /**
   * 获取完整的每日挑战统计信息（新接口）
   */
  static async getFullDailyStats(date?: string, userId?: string): Promise<{
    stats: DailyChallengeStats | null;
    localHistory: DailyChallengeHistory;
  }> {
    const stats = await this.getDailyStats(date, userId);
    const localHistory = this.getHistory();
    
    return {
      stats,
      localHistory
    };
  }

  /**
   * 检查是否可以进行今日挑战
   */
  static async canPlayToday(): Promise<boolean> {
    const today = await this.getTodayChallenge();
    return !today.completed;
  }

  /**
   * 获取下一次挑战的时间
   */
  static getNextChallengeTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * 格式化分享文本
   */
  static formatShareText(challenge: DailyChallengeState): string {
    const { date, difficulty, won, attempts } = challenge;
    const difficultyEmoji = {
      easy: '🟢',
      medium: '🟡',
      hard: '🔴'
    };
    
    const result = won ? `${attempts}/6` : 'X/6';
    const emoji = difficultyEmoji[difficulty];
    
    return `Sutom 每日挑战 ${date}
${emoji} ${difficulty.toUpperCase()} ${result}

#Sutom #每日挑战`;
  }
}

export const dailyChallengeService = DailyChallengeService; 