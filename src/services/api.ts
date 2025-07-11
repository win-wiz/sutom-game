import { API_URL } from '@/constants';
import type { 
  ApiResponse, 
  StartGameRequest, 
  StartDailyChallengeRequest,
  GuessRequest, 
  GuessResponse, 
  GameSession, 
  GameStats,
  EndGameData,
  DailyChallengeStats,
  DailyStatsRequest
} from '@/types';

const API_BASE_URL = `${API_URL}/api/sutom/game-session`;

class GameSessionAPI {
  /**
   * 开始新的游戏会话
   */
  async startGame(request: StartGameRequest): Promise<ApiResponse<{
    sessionId: string;
    wordData: GameSession['wordData'];
    gameInfo: Pick<GameSession['gameInfo'], 'attempts' | 'maxAttempts' | 'startTime'>;
  }>> {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json() as Promise<ApiResponse<{
      sessionId: string;
      wordData: GameSession['wordData'];
      gameInfo: Pick<GameSession['gameInfo'], 'attempts' | 'maxAttempts' | 'startTime'>;
    }>>;
  }

  /**
   * 开始每日挑战
   */
  async startDailyChallenge(request: StartDailyChallengeRequest): Promise<ApiResponse<{
    sessionId: string;
    wordData: GameSession['wordData'];
    gameInfo: Pick<GameSession['gameInfo'], 'attempts' | 'maxAttempts' | 'startTime'>;
  }>> {
    const response = await fetch(`${API_BASE_URL}/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json() as Promise<ApiResponse<{
      sessionId: string;
      wordData: GameSession['wordData'];
      gameInfo: Pick<GameSession['gameInfo'], 'attempts' | 'maxAttempts' | 'startTime'>;
    }>>;
  }

  /**
   * 提交猜测
   */
  async submitGuess(request: GuessRequest): Promise<ApiResponse<GuessResponse>> {
    const response = await fetch(`${API_BASE_URL}/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json() as Promise<ApiResponse<GuessResponse>>;
  }

  /**
   * 结束游戏会话并获取详细统计
   */
  async endGame(sessionId: string): Promise<ApiResponse<EndGameData>> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json() as Promise<ApiResponse<EndGameData>>;
  }

  /**
   * 获取游戏会话状态
   */
  async getGameSession(sessionId: string): Promise<ApiResponse<{
    sessionId: string;
    wordData: Pick<GameSession['wordData'], 'maskedWord' | 'difficulty' | 'length'>;
    gameInfo: GameSession['gameInfo'];
    guesses: GameSession['guesses'];
  }>> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`);
    return response.json() as Promise<ApiResponse<{
      sessionId: string;
      wordData: Pick<GameSession['wordData'], 'maskedWord' | 'difficulty' | 'length'>;
      gameInfo: GameSession['gameInfo'];
      guesses: GameSession['guesses'];
    }>>;
  }

  /**
   * 获取全局游戏统计信息
   */
  async getStats(): Promise<ApiResponse<GameStats>> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json() as Promise<ApiResponse<GameStats>>;
  }

  /**
   * 获取每日挑战统计信息
   * @param request 包含日期和可选用户ID的请求参数
   */
  async getDailyStats(request: DailyStatsRequest): Promise<ApiResponse<DailyChallengeStats>> {
    const { date, userId } = request;
    const url = new URL(`${API_BASE_URL}/daily-stats/${date}`);
    
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const response = await fetch(url.toString());
    return response.json() as Promise<ApiResponse<DailyChallengeStats>>;
  }
}

export const gameSessionAPI = new GameSessionAPI(); 