'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { type GameState, type Difficulty, AUDIO_FILES } from '@/types/game';
import {
  playAudio,
  sleep,
  isValidLetter,
  normalizeKey,
  isRowComplete,
  isGameWon,
  createEmptyCell,
  getWordFromUrl
} from '@/lib/gameUtils';
import { dictionaryService, type DictionaryValidationResult } from '@/lib/dictionaryService';
import { dailyChallengeService } from '@/lib/dailyChallenge';
import { gameSessionAPI } from '@/services/api';
import type { ApiResponse, GameSession, GuessResponse, GameStats, EndGameData } from '@/types';

const CHECK_DELAY = 270;

type GameMode = 'main-menu' | 'playing';

// === Wordle双色分配算法 ===
function computeLetterStates(cells: { letter: string }[], targetWord: string): ('found' | 'wrong' | 'not-found')[] {
  const resultStates = Array<'found' | 'wrong' | 'not-found'>(cells.length).fill('not-found');
  const targetArr = targetWord.split('');
  const used = Array(targetArr.length).fill(false);
  
  // Pass 1: 标记 found
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const targetChar = targetArr[i];
    if (cell && targetChar && cell.letter === targetChar) {
      resultStates[i] = 'found';
      used[i] = true;
    }
  }
  
  // Pass 2: 标记 wrong
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (resultStates[i] === 'found' || !cell) continue;
    const idx = targetArr.findIndex((ch, j) => ch === cell.letter && !used[j]);
    if (idx !== -1) {
      resultStates[i] = 'wrong';
      used[idx] = true;
    }
  }
  
  return resultStates;
}

// 定义 GameContext 的类型
interface GameContextType {
  // 游戏状态
  gameState: GameState | null;
  sessionId: string | null;
  gameMode: GameMode;
  selectedDifficulty: Difficulty | null;
  lastPlayedDifficulty: Difficulty | null;
  isChecking: boolean;
  isValidating: boolean;
  isLoadingWord: boolean;
  validationResult: DictionaryValidationResult | null;
  isDailyChallenge: boolean;
  endGameData: EndGameData | null;
  
  // 游戏控制
  handleKeyInput: (key: string) => void;
  handleVirtualKeyboard: (action: string) => void;
  closeValidationResult: () => void;
  handleGameComplete: (won: boolean, attempts: number, providedEndGameData?: EndGameData | null) => Promise<void>;
  
  // 模式切换
  returnToMainMenu: () => void;
  
  // 难度和游戏管理
  handleDifficultySelect: (difficulty: Difficulty) => void;
  startNewGame: () => Promise<void>;
  startDailyChallenge: () => Promise<void>;
  quickStart: () => Promise<void>;
  restartGame: () => Promise<void>;
  returnToDifficultySelection: () => void;
  getGameStats: () => Promise<GameStats | null>;
}

// 创建 Context
const GameContext = createContext<GameContextType | null>(null);

// GameProvider 组件
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DictionaryValidationResult | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [lastPlayedDifficulty, setLastPlayedDifficulty] = useState<Difficulty | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('main-menu');
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [endGameData, setEndGameData] = useState<EndGameData | null>(null);
  const [gameCompleteProcessing, setGameCompleteProcessing] = useState(false);
  const endGameDataRef = useRef<EndGameData | null>(null);

  // 创建一个设置endGameData的辅助函数
  const setEndGameDataWithRef = useCallback((data: EndGameData | null) => {
    endGameDataRef.current = data;
    setEndGameData(data);
  }, []);

  // 从localStorage加载上次选择的难度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDifficulty = localStorage.getItem('sutom-last-difficulty');
      if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
        setLastPlayedDifficulty(savedDifficulty as Difficulty);
      }
    }
  }, []);

  // 创建带难度的初始游戏状态
  const createInitialGameStateWithDifficulty = useCallback((word: string, difficulty: Difficulty | null): GameState => {
    const lettersCount: Record<string, number> = {};
    
    // 统计目标单词中每个字母的出现次数
    for (const letter of word) {
      lettersCount[letter] = (lettersCount[letter] ?? 0) + 1;
    }
    
    // 创建所有6行，第一行第一个字母已显示，其余行为空
    const maxAttempts = 6;
    const rows = Array.from({ length: maxAttempts }, (_, index) => {
      if (index === 0) {
        // 第一行：第一个字母已显示
        return {
          cells: word.split('').map((letter, cellIndex) => 
            createEmptyCell(cellIndex === 0 ? letter : '.')
          ),
          isCompleted: false
        };
      } else {
        // 其余行：第一个字母显示，其余为空
        return {
          cells: word.split('').map((_, cellIndex) => 
            createEmptyCell(cellIndex === 0 ? word.charAt(0) : '.')
          ),
          isCompleted: false
        };
      }
    });
    
    return {
      targetWord: word,
      difficulty,
      currentRow: 0,
      rows,
      gameStatus: 'playing',
      lettersCount,
      lettersFound: {},
      keyboardStates: {}
    };
  }, []);

  // 返回主菜单
  const returnToMainMenu = useCallback(() => {
    setGameMode('main-menu');
    setGameState(null);
    setSessionId(null);
    setSelectedDifficulty(null);
    setValidationResult(null);
    setIsDailyChallenge(false);
    setEndGameDataWithRef(null);
    setGameCompleteProcessing(false);
  }, [setEndGameDataWithRef]);

  // 选择难度
  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  }, []);

  // 开始新游戏
  const startNewGame = useCallback(async () => {
    if (!selectedDifficulty) return;
    
    console.log('🎮 startNewGame called with difficulty:', selectedDifficulty);
    
    setIsLoadingWord(true);
    if (gameState?.gameStatus !== 'won' && gameState?.gameStatus !== 'lost') {
      setEndGameDataWithRef(null);
    }
    setGameCompleteProcessing(false);
    
    try {
      // 保存用户选择的难度
      if (typeof window !== 'undefined') {
        localStorage.setItem('sutom-last-difficulty', selectedDifficulty);
        setLastPlayedDifficulty(selectedDifficulty);
      }
      
      // 调用后台 API 开始游戏
      try {
        const response = await gameSessionAPI.startGame({
          difficulty: selectedDifficulty,
          maxAttempts: 6
        });
        
        if (response.success && response.data) {
          const { sessionId: newSessionId, wordData, gameInfo } = response.data;
          const newGameState = createInitialGameStateWithDifficulty(wordData.maskedWord, selectedDifficulty);
          
          console.log('🎮 API response received:', response.data);
          setGameState(newGameState);
          setSessionId(newSessionId);
          setGameMode('playing');
          
          // 保存 sessionId 到 localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sutom-session-id', newSessionId);
          }
        } else {
          throw new Error(response.message || 'API调用失败');
        }
      } catch (error) {
        console.warn('API调用失败，使用本地模式:', error);
        // 使用本地模式作为 fallback
        const fallbackWord = selectedDifficulty === 'easy' ? 'chat' : 
                            selectedDifficulty === 'medium' ? 'ordinateur' : 'cacophonie';
        const newGameState = createInitialGameStateWithDifficulty(fallbackWord, selectedDifficulty);
        console.log('🎮 Using local mode with fallback word:', fallbackWord);
        setGameState(newGameState);
        setGameMode('playing');
        setSessionId(null);
      }
    } finally {
      setIsLoadingWord(false);
    }
  }, [selectedDifficulty, createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef]);

  // 开始每日挑战
  const startDailyChallenge = useCallback(async () => {
    const canPlay = await dailyChallengeService.canPlayToday();
    if (!canPlay) {
      return;
    }

    setIsLoadingWord(true);
    if (gameState?.gameStatus !== 'won' && gameState?.gameStatus !== 'lost') {
      setEndGameDataWithRef(null);
    }
    setGameCompleteProcessing(false);
    
    try {
      const challengeData = await dailyChallengeService.getTodayChallenge();
      const newGameState = createInitialGameStateWithDifficulty(challengeData.word, null);
      setGameState(newGameState);
      setGameMode('playing');
      setIsDailyChallenge(true);
      setSessionId(challengeData.sessionId);
    } catch (error) {
      console.error('获取每日挑战失败:', error);
    } finally {
      setIsLoadingWord(false);
    }
  }, [createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef]);

  // 快速开始
  const quickStart = useCallback(async () => {
    const difficulty = lastPlayedDifficulty ?? 'medium';
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutom-last-difficulty', difficulty);
      setLastPlayedDifficulty(difficulty);
    }

    setIsLoadingWord(true);
    if (gameState?.gameStatus !== 'won' && gameState?.gameStatus !== 'lost') {
      setEndGameDataWithRef(null);
    }
    setGameCompleteProcessing(false);
    
    try {
      // 调用后台 API 开始游戏
      try {
        const response = await gameSessionAPI.startGame({
          difficulty,
          maxAttempts: 6
        });
        
        if (response.success && response.data) {
          const { sessionId: newSessionId, wordData, gameInfo } = response.data;
          const newGameState = createInitialGameStateWithDifficulty(wordData.maskedWord, difficulty);
          
          console.log('🎮 QuickStart API response received:', response.data);
          setSelectedDifficulty(difficulty);
          setGameState(newGameState);
          setSessionId(newSessionId);
          setGameMode('playing');
          
          // 保存 sessionId 到 localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sutom-session-id', newSessionId);
          }
        } else {
          throw new Error(response.message || 'API调用失败');
        }
      } catch (error) {
        console.warn('快速开始 API调用失败，使用本地模式:', error);
        // 使用本地模式作为 fallback
        const fallbackWord = difficulty === 'easy' ? 'chat' : 
                            difficulty === 'medium' ? 'ordinateur' : 'cacophonie';
        const newGameState = createInitialGameStateWithDifficulty(fallbackWord, difficulty);
        console.log('🎮 QuickStart using local mode with fallback word:', fallbackWord);
        setSelectedDifficulty(difficulty);
        setGameState(newGameState);
        setGameMode('playing');
        setSessionId(null);
      }
    } finally {
      setIsLoadingWord(false);
    }
  }, [lastPlayedDifficulty, createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef]);

  // 返回难度选择
  const returnToDifficultySelection = useCallback(() => {
    setGameMode('main-menu');
    setGameState(null);
    setSelectedDifficulty(null);
    setValidationResult(null);
    setEndGameDataWithRef(null);
    setGameCompleteProcessing(false);
  }, [setEndGameDataWithRef]);

  // 重新开始游戏
  const restartGame = useCallback(async () => {
    if (isDailyChallenge) {
      await startDailyChallenge();
    } else if (selectedDifficulty) {
      await startNewGame();
    }
  }, [isDailyChallenge, selectedDifficulty, startDailyChallenge, startNewGame]);

  // 处理游戏完成
  const handleGameComplete = useCallback(async (won: boolean, attempts: number, providedEndGameData?: EndGameData | null) => {
    if (providedEndGameData) {
      setEndGameDataWithRef(providedEndGameData);
    } else if (sessionId) {
      // API 模式下，调用 endGame 接口获取完整统计数据
      try {
        const endGameResponse = await gameSessionAPI.endGame(sessionId);
        if (endGameResponse.success && endGameResponse.data) {
          setEndGameDataWithRef(endGameResponse.data);
        } else {
          // 如果 endGame API 失败，生成基本的 endGameData
          const basicEndGameData: EndGameData = {
            sessionId,
            isWon: won,
            attempts,
            gameTime: attempts * 30,
            wordInfo: {
              word: gameState?.targetWord ?? 'unknown',
              difficulty: gameState?.difficulty ?? 'medium',
              length: gameState?.targetWord?.length ?? 4,
              definition: 'API模式下暂无定义信息',
              category: '在线游戏'
            },
            wordStats: {
              totalAttempts: attempts,
              totalSuccesses: won ? 1 : 0,
              successRate: won ? 100 : 0,
              averageAttempts: attempts,
              averageGameTime: attempts * 30,
              perceivedDifficulty: gameState?.difficulty === 'easy' ? 3 : gameState?.difficulty === 'medium' ? 5 : 7,
              sampleSize: 1,
              lastPlayedAt: new Date().toISOString()
            }
          };
          setEndGameDataWithRef(basicEndGameData);
        }
      } catch (error) {
        console.error('调用 endGame API 失败:', error);
        // 生成基本的 endGameData
        const basicEndGameData: EndGameData = {
          sessionId,
          isWon: won,
          attempts,
          gameTime: attempts * 30,
          wordInfo: {
            word: gameState?.targetWord ?? 'unknown',
            difficulty: gameState?.difficulty ?? 'medium',
            length: gameState?.targetWord?.length ?? 4,
            definition: 'API调用失败',
            category: '在线游戏'
          },
          wordStats: {
            totalAttempts: attempts,
            totalSuccesses: won ? 1 : 0,
            successRate: won ? 100 : 0,
            averageAttempts: attempts,
            averageGameTime: attempts * 30,
            perceivedDifficulty: gameState?.difficulty === 'easy' ? 3 : gameState?.difficulty === 'medium' ? 5 : 7,
            sampleSize: 1,
            lastPlayedAt: new Date().toISOString()
          }
        };
        setEndGameDataWithRef(basicEndGameData);
      }
    } else {
      // 本地模式下生成基本的endGameData
      const localEndGameData: EndGameData = {
        sessionId: 'local-session',
        isWon: won,
        attempts,
        gameTime: attempts * 30,
        wordInfo: {
          word: gameState?.targetWord ?? 'unknown',
          difficulty: gameState?.difficulty ?? 'medium',
          length: gameState?.targetWord?.length ?? 4,
          definition: '本地模式下暂无定义信息',
          category: '本地游戏'
        },
        wordStats: {
          totalAttempts: attempts,
          totalSuccesses: won ? 1 : 0,
          successRate: won ? 100 : 0,
          averageAttempts: attempts,
          averageGameTime: attempts * 30,
          perceivedDifficulty: gameState?.difficulty === 'easy' ? 3 : gameState?.difficulty === 'medium' ? 5 : 7,
          sampleSize: 1,
          lastPlayedAt: new Date().toISOString()
        }
      };
      
      setEndGameDataWithRef(localEndGameData);
    }

    // 更新每日挑战状态
    if (isDailyChallenge && gameState) {
      const guesses = gameState.rows
        .filter(row => row.isCompleted)
        .map(row => row.cells.map(cell => cell.letter).join(''));
      
      await dailyChallengeService.updateTodayChallenge({
        completed: true,
        won,
        attempts,
        guesses
      });
    }
  }, [isDailyChallenge, gameState, sessionId, setEndGameDataWithRef]);

  // 简化的键盘输入和游戏逻辑
  const handleKeyInput = useCallback((key: string) => {
    console.log('🎮 handleKeyInput 被调用:', key);
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    if (key === 'Enter') {
      console.log('🎮 Enter键被按下，调用 checkWord');
      void checkWord();
    } else if (key === 'Backspace') {
      removeLetter();
    } else if (isValidLetter(key)) {
      addLetter(key);
    }
  }, [gameState, isChecking]);

  const handleVirtualKeyboard = useCallback((action: string) => {
    console.log('🎮 handleVirtualKeyboard 被调用:', action);
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    if (action === 'enter') {
      console.log('🎮 虚拟键盘 Enter 被点击，调用 checkWord');
      void checkWord();
    } else if (action === 'backspace') {
      removeLetter();
    } else {
      addLetter(action);
    }
  }, [gameState, isChecking]);

  // 添加字母
  const addLetter = useCallback((letter: string) => {
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const normalizedLetter = normalizeKey(letter);
    const currentRow = gameState.rows[gameState.currentRow];
    
    if (!currentRow) return;

    const emptyCellIndex = currentRow.cells.findIndex(cell => cell.letter === '.');
    if (emptyCellIndex === -1) return;

    setGameState(prev => {
      if (!prev) return prev;
      
      const newRows = [...prev.rows];
      const newRow = { ...newRows[prev.currentRow]! };
      const newCells = [...newRow.cells];
      
      newCells[emptyCellIndex] = {
        ...newCells[emptyCellIndex]!,
        letter: normalizedLetter
      };
      
      newRow.cells = newCells;
      newRows[prev.currentRow] = newRow;
      
      return { ...prev, rows: newRows };
    });
  }, [gameState, isChecking]);

  // 删除字母
  const removeLetter = useCallback(() => {
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const currentRow = gameState.rows[gameState.currentRow];
    if (!currentRow) return;

    const cellsAfterFirst = currentRow.cells.slice(1);
    let lastFilledIndex = -1;
    
    for (let i = cellsAfterFirst.length - 1; i >= 0; i--) {
      if (cellsAfterFirst[i]?.letter !== '.') {
        lastFilledIndex = i;
        break;
      }
    }
    
    if (lastFilledIndex === -1) return;

    const actualIndex = lastFilledIndex + 1;

    setGameState(prev => {
      if (!prev) return prev;
      
      const newRows = [...prev.rows];
      const newRow = { ...newRows[prev.currentRow]! };
      const newCells = [...newRow.cells];
      
      newCells[actualIndex] = {
        ...newCells[actualIndex]!,
        letter: '.'
      };
      
      newRow.cells = newCells;
      newRows[prev.currentRow] = newRow;
      
      return { ...prev, rows: newRows };
    });
  }, [gameState, isChecking]);

  // 检查单词
  const checkWord = useCallback(async () => {
    console.log('🎮 checkWord 被调用');
    console.log('🎮 当前游戏状态:', { gameState: !!gameState, isChecking, gameStatus: gameState?.gameStatus });
    console.log('🎮 当前 sessionId:', sessionId);
    
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const currentRow = gameState.rows[gameState.currentRow];
    if (!currentRow || !isRowComplete(currentRow.cells)) return;

    setIsChecking(true);
    setGameCompleteProcessing(false);

    try {
      const currentWord = currentRow.cells.map(cell => cell.letter).join('');
      console.log('🎮 准备验证单词:', currentWord);
      
      const newCells = [...currentRow.cells];
      const newKeyboardStates = { ...gameState.keyboardStates };

      // 如果有 sessionId，使用 API 验证；否则进行词典验证
      if (sessionId) {
        console.log('🎮 有 sessionId，跳过词典验证，直接调用API');
        try {
          console.log('🎮 提交猜测到API:', { sessionId, guess: currentWord });
          const response = await gameSessionAPI.submitGuess({
            sessionId,
            guess: currentWord
          });
          
          console.log('🎮 API 响应:', response);
          
          if (response.success && response.data) {
            const { letterAnalysis, isCorrect, isCompleted, isWon: apiIsWon, wordStats } = response.data;
            
            // 使用 API 返回的字母分析结果
            for (let i = 0; i < letterAnalysis.length; i++) {
              await sleep(CHECK_DELAY);
              const analysis = letterAnalysis[i];
              if (analysis && newCells[i]) {
                const state = analysis.status === 'correct' ? 'found' : 
                            analysis.status === 'wrong-position' ? 'wrong' : 'not-found';
                newCells[i] = { ...newCells[i]!, state };
                newKeyboardStates[analysis.letter] = state;
                
                switch (state) {
                  case 'found': playAudio(AUDIO_FILES.found); break;
                  case 'wrong': playAudio(AUDIO_FILES.wrong); break;
                  case 'not-found': playAudio(AUDIO_FILES.notFound); break;
                }
              }
            }
            
            // 更新游戏状态
            setGameState(prev => {
              if (!prev) return prev;
              
              const newRows = [...prev.rows];
              newRows[prev.currentRow] = {
                ...newRows[prev.currentRow]!,
                cells: newCells,
                isCompleted: true
              };
              
              let newGameStatus = prev.gameStatus;
              let newCurrentRow = prev.currentRow;
              
              if (isCompleted) {
                newGameStatus = apiIsWon ? 'won' : 'lost';
                if (apiIsWon) {
                  playAudio(AUDIO_FILES.win);
                }
              } else {
                newCurrentRow = prev.currentRow + 1;
              }
              
              return {
                ...prev,
                rows: newRows,
                currentRow: newCurrentRow,
                gameStatus: newGameStatus,
                keyboardStates: newKeyboardStates
              };
            });
            
            // 如果游戏完成，调用 endGame API 获取完整统计数据
            if (isCompleted) {
              try {
                const endGameResponse = await gameSessionAPI.endGame(sessionId);
                if (endGameResponse.success && endGameResponse.data) {
                  void handleGameComplete(apiIsWon, response.data.attempts, endGameResponse.data);
                } else {
                  // 如果 endGame API 失败，使用从 guess API 获取的数据
                  if (response.data.correctAnswer && wordStats) {
                    const endGameData: EndGameData = {
                      sessionId,
                      isWon: apiIsWon,
                      attempts: response.data.attempts,
                      gameTime: response.data.gameTime ?? 0,
                      wordInfo: {
                        word: response.data.correctAnswer,
                        difficulty: gameState.difficulty ?? 'medium',
                        length: response.data.correctAnswer.length,
                        definition: '从API获取的单词',
                        category: '在线游戏'
                      },
                      wordStats: {
                        totalAttempts: wordStats.totalAttempts,
                        totalSuccesses: wordStats.totalSuccesses,
                        successRate: wordStats.successRate,
                        averageAttempts: wordStats.averageAttemptsToWin ?? wordStats.totalAttempts,
                        averageGameTime: wordStats.averageGameTime,
                        perceivedDifficulty: wordStats.perceivedDifficulty,
                        sampleSize: wordStats.sampleSize,
                        lastPlayedAt: wordStats.lastPlayed ?? new Date().toISOString()
                      }
                    };
                    void handleGameComplete(apiIsWon, response.data.attempts, endGameData);
                  } else {
                    void handleGameComplete(apiIsWon, response.data.attempts);
                  }
                }
              } catch (endGameError) {
                console.warn('调用 endGame API 失败:', endGameError);
                // 如果 endGame API 失败，使用从 guess API 获取的数据
                if (response.data.correctAnswer && wordStats) {
                  const endGameData: EndGameData = {
                    sessionId,
                    isWon: apiIsWon,
                    attempts: response.data.attempts,
                    gameTime: response.data.gameTime ?? 0,
                    wordInfo: {
                      word: response.data.correctAnswer,
                      difficulty: gameState.difficulty ?? 'medium',
                      length: response.data.correctAnswer.length,
                      definition: '从API获取的单词',
                      category: '在线游戏'
                    },
                    wordStats: {
                      totalAttempts: wordStats.totalAttempts,
                      totalSuccesses: wordStats.totalSuccesses,
                      successRate: wordStats.successRate,
                      averageAttempts: wordStats.averageAttemptsToWin ?? wordStats.totalAttempts,
                      averageGameTime: wordStats.averageGameTime,
                      perceivedDifficulty: wordStats.perceivedDifficulty,
                      sampleSize: wordStats.sampleSize,
                      lastPlayedAt: wordStats.lastPlayed ?? new Date().toISOString()
                    }
                  };
                  void handleGameComplete(apiIsWon, response.data.attempts, endGameData);
                } else {
                  void handleGameComplete(apiIsWon, response.data.attempts);
                }
              }
            }
          } else {
            throw new Error('API 返回失败');
          }
        } catch (error) {
          console.warn('API 提交猜测失败，使用本地验证:', error);
          // 如果 API 失败，降级到本地验证
          await performLocalValidation();
        }
      } else {
        // 没有 sessionId，使用本地验证，需要先进行词典验证
        console.log('🎮 本地模式，先进行词典验证');
        setIsValidating(true);
        const result = await dictionaryService.validateWord(currentWord);
        setIsValidating(false);
        
        console.log('🎮 词典验证结果:', result);
        
        if (!result.isValid) {
          console.log('🎮 词典验证失败，显示错误消息');
          setValidationResult(result);
          setIsChecking(false);
          return;
        }
        
        await performLocalValidation();
      }
      
             // 本地验证函数
       async function performLocalValidation() {
         if (!gameState) return;
         
         const states = computeLetterStates(newCells, gameState.targetWord);
         for (let i = 0; i < newCells.length; i++) {
           await sleep(CHECK_DELAY);
           const cell = newCells[i];
           if (cell) {
             newCells[i] = { ...cell, state: states[i] ?? 'not-found' };
             const cellLetter = cell.letter;
             const currentState = states[i];
             newKeyboardStates[cellLetter] = currentState ?? 'not-found';
             
             switch (currentState) {
               case 'found': playAudio(AUDIO_FILES.found); break;
               case 'wrong': playAudio(AUDIO_FILES.wrong); break;
               case 'not-found': playAudio(AUDIO_FILES.notFound); break;
             }
           }
         }

         // 检查是否获胜
         const isWon = isGameWon(newCells, gameState.targetWord);
         
         setGameState(prev => {
           if (!prev) return prev;
           
           const newRows = [...prev.rows];
           newRows[prev.currentRow] = {
             ...newRows[prev.currentRow]!,
             cells: newCells,
             isCompleted: true
           };
           
           let newGameStatus = prev.gameStatus;
           let newCurrentRow = prev.currentRow;
           
           if (isWon) {
             newGameStatus = 'won';
             playAudio(AUDIO_FILES.win);
             void handleGameComplete(true, prev.currentRow + 1);
           } else {
             newCurrentRow = prev.currentRow + 1;
             
             if (newCurrentRow >= 6) {
               newGameStatus = 'lost';
               void handleGameComplete(false, 6);
             }
           }
           
           return {
             ...prev,
             rows: newRows,
             currentRow: newCurrentRow,
             gameStatus: newGameStatus,
             keyboardStates: newKeyboardStates
           };
         });
       }
    } finally {
      setIsChecking(false);
    }
  }, [gameState, isChecking, handleGameComplete, sessionId]);

  // 从URL获取单词时的初始化
  useEffect(() => {
    const urlWord = getWordFromUrl();
    if (urlWord !== 'cacophonie') {
      setGameState(createInitialGameStateWithDifficulty(urlWord, null));
      setGameMode('playing');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeValidationResult = useCallback(() => {
    setValidationResult(null);
  }, []);

  const getGameStats = useCallback(async () => {
    try {
      type GetStatsAPIResponse = ApiResponse<GameStats>;
      const statsResponse = await gameSessionAPI.getStats() as GetStatsAPIResponse;
      
      if (statsResponse?.success && statsResponse?.data) {
        return statsResponse.data;
      } else {
        console.warn('获取游戏统计失败:', statsResponse?.message);
        return null;
      }
    } catch (error) {
      console.warn('调用getStats API失败:', error);
      return null;
    }
  }, []);

  const contextValue: GameContextType = {
    // 游戏状态
    gameState,
    sessionId,
    gameMode,
    selectedDifficulty,
    lastPlayedDifficulty,
    isChecking,
    isValidating,
    isLoadingWord,
    validationResult,
    isDailyChallenge,
    endGameData,
    
    // 游戏控制
    handleKeyInput,
    handleVirtualKeyboard,
    closeValidationResult,
    handleGameComplete,
    
    // 模式切换
    returnToMainMenu,
    
    // 难度和游戏管理
    handleDifficultySelect,
    startNewGame,
    startDailyChallenge,
    quickStart,
    restartGame,
    returnToDifficultySelection,
    getGameStats
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// 自定义 hook 来使用 GameContext
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 