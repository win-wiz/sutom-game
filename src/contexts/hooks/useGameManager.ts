'use client';

import { useState, useCallback, useEffect } from 'react';
import { type GameState, type Difficulty } from '@/types/game';
import { dailyChallengeService } from '@/lib/dailyChallenge';
import { gameSessionAPI } from '@/services/api';
import { getWordFromUrl } from '@/lib/gameUtils';
import type { ApiResponse, GameStats, EndGameData } from '@/types';

type GameMode = 'main-menu' | 'playing';

interface UseGameManagerProps {
  gameState: GameState | null;
  sessionId: string | null;
  selectedDifficulty: Difficulty | null;
  lastPlayedDifficulty: Difficulty | null;
  isDailyChallenge: boolean;
  gameMode: GameMode;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedDifficulty: React.Dispatch<React.SetStateAction<Difficulty | null>>;
  setLastPlayedDifficulty: React.Dispatch<React.SetStateAction<Difficulty | null>>;
  setIsDailyChallenge: React.Dispatch<React.SetStateAction<boolean>>;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
  setEndGameDataWithRef: (data: EndGameData | null) => void;
  setGameCompleteProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  createInitialGameStateWithDifficulty: (word: string, difficulty: Difficulty | null) => GameState;
  resetGameState: () => void;
}

/**
 * Hook de gestion du jeu
 * Responsable de la gestion des fonctions de démarrage, redémarrage, changement de mode, etc. du jeu
 */
export const useGameManager = ({
  gameState,
  sessionId: _sessionId,
  selectedDifficulty,
  lastPlayedDifficulty,
  isDailyChallenge,
  gameMode: _gameMode,
  setGameState,
  setSessionId,
  setSelectedDifficulty,
  setLastPlayedDifficulty,
  setIsDailyChallenge,
  setGameMode,
  setEndGameDataWithRef,
  setGameCompleteProcessing,
  createInitialGameStateWithDifficulty,
  resetGameState
}: UseGameManagerProps) => {
  const [isLoadingWord, setIsLoadingWord] = useState(false);

  // Charger la dernière difficulté sélectionnée depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDifficulty = localStorage.getItem('sutom-last-difficulty');
      if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
        setLastPlayedDifficulty(savedDifficulty as Difficulty);
      }
    }
  }, [setLastPlayedDifficulty]);

  // Initialisation lors de l'obtention du mot depuis l'URL
  useEffect(() => {
    const urlWord = getWordFromUrl();
    if (urlWord !== 'cacophonie') {
      setGameState(createInitialGameStateWithDifficulty(urlWord, null));
      setGameMode('playing');
    }
  }, [createInitialGameStateWithDifficulty, setGameState, setGameMode]);

  // Retourner au menu principal
  const returnToMainMenu = useCallback(() => {
    setGameMode('main-menu');
    resetGameState();
  }, [setGameMode, resetGameState]);

  // Sélectionner la difficulté
  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  }, [setSelectedDifficulty]);

  // Commencer une nouvelle partie
  const startNewGame = useCallback(async () => {
    if (!selectedDifficulty) return;
    
    console.log('🎮 startNewGame called with difficulty:', selectedDifficulty);
    
    setIsLoadingWord(true);
    if (gameState?.gameStatus !== 'won' && gameState?.gameStatus !== 'lost') {
      setEndGameDataWithRef(null);
    }
    setGameCompleteProcessing(false);
    
    try {
      // Sauvegarder la difficulté choisie par l'utilisateur
      if (typeof window !== 'undefined') {
        localStorage.setItem('sutom-last-difficulty', selectedDifficulty);
        setLastPlayedDifficulty(selectedDifficulty);
      }
      
      // Appeler l'API backend pour commencer le jeu
      try {
        const response = await gameSessionAPI.startGame({
          difficulty: selectedDifficulty,
          maxAttempts: 6
        });
        
        if (response.success && response.data) {
          const { sessionId: newSessionId, wordData } = response.data;
          const newGameState = createInitialGameStateWithDifficulty(wordData.maskedWord, selectedDifficulty);
          
          console.log('🎮 API response received:', response.data);
          setGameState(newGameState);
          setSessionId(newSessionId);
          setGameMode('playing');
          
          // Sauvegarder sessionId dans localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sutom-session-id', newSessionId);
          }
        } else {
          throw new Error(response.message || 'Échec de l\'appel API');
        }
      } catch (error) {
        console.warn('Échec de l\'appel API, utilisation du mode local:', error);
        // Utiliser le mode local comme solution de repli
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
  }, [selectedDifficulty, createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef, setGameCompleteProcessing, setLastPlayedDifficulty, setGameState, setSessionId, setGameMode]);

  // Commencer le défi quotidien
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
      console.error('Échec de l\'obtention du défi quotidien:', error);
    } finally {
      setIsLoadingWord(false);
    }
  }, [createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef, setGameCompleteProcessing, setGameState, setGameMode, setIsDailyChallenge, setSessionId]);

  // Démarrage rapide
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
      // Appeler l'API backend pour commencer le jeu
      try {
        const response = await gameSessionAPI.startGame({
          difficulty,
          maxAttempts: 6
        });
        
        if (response.success && response.data) {
          const { sessionId: newSessionId, wordData } = response.data;
          const newGameState = createInitialGameStateWithDifficulty(wordData.maskedWord, difficulty);
          
          console.log('🎮 QuickStart API response received:', response.data);
          setSelectedDifficulty(difficulty);
          setGameState(newGameState);
          setSessionId(newSessionId);
          setGameMode('playing');
          
          // Sauvegarder sessionId dans localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sutom-session-id', newSessionId);
          }
        } else {
          throw new Error(response.message || 'Échec de l\'appel API');
        }
      } catch (error) {
        console.warn('Échec de l\'appel API de démarrage rapide, utilisation du mode local:', error);
        // Utiliser le mode local comme solution de repli
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
  }, [lastPlayedDifficulty, createInitialGameStateWithDifficulty, gameState, setEndGameDataWithRef, setGameCompleteProcessing, setLastPlayedDifficulty, setSelectedDifficulty, setGameState, setSessionId, setGameMode]);

  // Retourner à la sélection de difficulté
  const returnToDifficultySelection = useCallback(() => {
    setGameMode('main-menu');
    setGameState(null);
    setSelectedDifficulty(null);
    setEndGameDataWithRef(null);
    setGameCompleteProcessing(false);
  }, [setGameMode, setGameState, setSelectedDifficulty, setEndGameDataWithRef, setGameCompleteProcessing]);

  // Redémarrer le jeu
  const restartGame = useCallback(async () => {
    if (isDailyChallenge) {
      await startDailyChallenge();
    } else if (selectedDifficulty) {
      await startNewGame();
    }
  }, [isDailyChallenge, selectedDifficulty, startDailyChallenge, startNewGame]);

  // Obtenir les statistiques du jeu
  const getGameStats = useCallback(async () => {
    try {
      type GetStatsAPIResponse = ApiResponse<GameStats>;
      const statsResponse = await gameSessionAPI.getStats() as GetStatsAPIResponse;
      
      if (statsResponse?.success && statsResponse?.data) {
        return statsResponse.data;
      } else {
        console.warn('Échec de l\'obtention des statistiques du jeu:', statsResponse?.message);
        return null;
      }
    } catch (error) {
      console.warn('Échec de l\'appel à l\'API getStats:', error);
      return null;
    }
  }, []);

  return {
    // États
    isLoadingWord,
    
    // Fonctions de gestion
    returnToMainMenu,
    handleDifficultySelect,
    startNewGame,
    startDailyChallenge,
    quickStart,
    returnToDifficultySelection,
    restartGame,
    getGameStats
  };
};