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
  sessionId: string; // Changer en champ obligatoire
}

type DailyChallengeHistory = Record<string, DailyChallengeState>;

export class DailyChallengeService {
  private static readonly STORAGE_KEY = 'sutom-daily-challenge';
  private static readonly HISTORY_KEY = 'sutom-daily-challenge-history';

  /**
   * Convertir la chaîne de date en graine numérique
   * Utiliser une fonction de hachage simple pour s'assurer que la même date génère toujours la même graine
   */
  private static dateToSeed(dateString: string): number {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Obtenir la chaîne de date d'aujourd'hui
   */
  private static getTodayString(): string {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]?.replace(/-/g, ''); // Obtenir la date d'aujourd'hui
    if (!dateString) {
      // Lancer une erreur en français
      throw new Error('Impossible de récupérer la date du jour');
    }
    return dateString;
  }

  /**
   * Générer le mot du défi quotidien basé sur la date (complètement aléatoire)
   */
  private static generateDailyWord(dateString: string): { word: string; difficulty: Difficulty } {
    const seed = this.dateToSeed(dateString);
    
    // Obtenir tous les mots, sans distinction de difficulté
    const allWords = wordService.getAllWords();
    
    if (allWords.length === 0) {
      throw new Error('Aucun mot disponible');
    }
    
    // Sélectionner aléatoirement un mot basé sur la graine
    const wordIndex = seed % allWords.length;
    const selectedWord = allWords[wordIndex];
    
    if (!selectedWord) {
      throw new Error('Impossible de récupérer le mot');
    }
    
    return { word: selectedWord.word, difficulty: selectedWord.difficulty };
  }

  /**
   * Opération localStorage sécurisée - gérer le rendu côté serveur
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
   * Opération localStorage sécurisée - gérer le rendu côté serveur
   */
  private static safeSetItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Échec de la sauvegarde des données:', error);
    }
  }

  /**
   * Obtenir les informations du défi d'aujourd'hui
   */
  static async getTodayChallenge(): Promise<DailyChallengeState> {
    const today = this.getTodayString();
    const stored = this.safeGetItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        const challenge = JSON.parse(stored) as DailyChallengeState;
        // Si le défi stocké est celui d'aujourd'hui, le retourner directement
        if (challenge.date === today) {
          return challenge;
        }
      } catch (error) {
        console.error('Échec de la récupération des données du défi quotidien:', error);
      }
    }
    
    try {
      // Appeler l'interface backend pour obtenir le défi quotidien
      const response = await gameSessionAPI.startDailyChallenge({ date: today });
      
      if (!response.success || !response.data) {
        throw new Error('Échec de la récupération du défi quotidien');
      }
      
      const { sessionId, wordData, gameInfo } = response.data;
      
      const newChallenge: DailyChallengeState = {
        date: today,
        word: wordData.maskedWord, // Utiliser le mot masqué
        difficulty: wordData.difficulty as Difficulty,
        completed: false,
        attempts: gameInfo.attempts,
        won: false,
        guesses: [],
        sessionId, // Sauvegarder sessionId
      };
      
      // Sauvegarder dans le stockage local
      this.safeSetItem(this.STORAGE_KEY, JSON.stringify(newChallenge));
      
      return newChallenge;
    } catch (error) {
      console.error('Échec de la récupération du défi quotidien:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut du défi d'aujourd'hui
   */
  static async updateTodayChallenge(updates: Partial<DailyChallengeState>): Promise<void> {
    const current = await this.getTodayChallenge();
    const updated = { ...current, ...updates };
    
    // Si le jeu est terminé, enregistrer l'heure de completion
    if (updated.completed && !current.completed) {
      updated.completedAt = new Date().toISOString();
    }
    
    // Mettre à jour le défi actuel
    this.safeSetItem(this.STORAGE_KEY, JSON.stringify(updated));
    
    // Si le jeu est terminé, sauvegarder dans l'historique
    if (updated.completed) {
      this.saveToHistory(updated);
    }
  }

  /**
   * Sauvegarder dans l'historique
   */
  private static saveToHistory(challenge: DailyChallengeState): void {
    const historyStr = this.safeGetItem(this.HISTORY_KEY);
    let history: DailyChallengeHistory = {};
    
    if (historyStr) {
      try {
        history = JSON.parse(historyStr) as DailyChallengeHistory;
      } catch (error) {
        console.error('Échec de la récupération de l\'historique:', error);
        history = {};
      }
    }
    
    history[challenge.date] = challenge;
    this.safeSetItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Obtenir l'historique
   */
  static getHistory(): DailyChallengeHistory {
    const historyStr = this.safeGetItem(this.HISTORY_KEY);
    if (!historyStr) return {};
    
    try {
      return JSON.parse(historyStr) as DailyChallengeHistory;
    } catch (error) {
      console.error('Échec de la récupération de l\'historique:', error);
      return {};
    }
  }

  /**
   * Obtenir les statistiques du défi quotidien (utiliser la nouvelle interface /daily-stats/:date)
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
        console.warn('Échec de la récupération des statistiques du défi quotidien:', response.message);
        return null;
      }
    } catch (error) {
      console.warn('Échec de l\'appel à l\'API getDailyStats:', error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques (compatible avec l'ancienne interface, mode local + statistiques serveur)
   */
  static async getStats(): Promise<{
    personal: LegacyPersonalStats;
    server: DailyChallengeStats['server'] | null;
  }> {
    // Statistiques personnelles (locales)
    const history = this.getHistory();
    const challenges = Object.values(history).sort((a, b) => a.date.localeCompare(b.date));
    const totalChallenges = challenges.length;
    const totalWins = challenges.filter(c => c.won).length;
    const winRate = totalChallenges > 0 ? (totalWins / totalChallenges) * 100 : 0;
    
    // Calculer la série de victoires actuelle
    let currentStreak = 0;
    for (let i = challenges.length - 1; i >= 0; i--) {
      const challenge = challenges[i];
      if (challenge?.won) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculer la plus longue série de victoires
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
    
    // Calculer le nombre moyen de tentatives
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
    
    // Statistiques du réseau (nouvelle interface)
    let server: DailyChallengeStats['server'] | null = null;
    try {
      const dailyStats = await this.getDailyStats();
      if (dailyStats?.server) {
        server = dailyStats.server;
      }
    } catch (e) {
      // Ignorer les erreurs, définir server à null
      console.warn('Échec de la récupération des statistiques du serveur:', e);
    }
    
    return { personal, server };
  }

  /**
   * Obtenir les statistiques complètes du défi quotidien (nouvelle interface)
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
   * Vérifier si le défi d'aujourd'hui peut être joué
   */
  static async canPlayToday(): Promise<boolean> {
    const today = await this.getTodayChallenge();
    return !today.completed;
  }

  /**
   * Obtenir l'heure du prochain défi
   */
  static getNextChallengeTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Formater le texte de partage
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
    
    return `Sutom Défi Quotidien ${date}
${emoji} ${difficulty.toUpperCase()} ${result}

#Sutom #DéfiQuotidien`;
  }
}

export const dailyChallengeService = DailyChallengeService;