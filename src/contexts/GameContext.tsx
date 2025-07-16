'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { type GameState, type Difficulty } from '@/types/game';
import { type DictionaryValidationResult } from '@/lib/dictionaryService';
import type { GameStats, EndGameData } from '@/types';
import {
  useGameState,
  useGameActions,
  useGameManager,
  useGameCompletion
} from './hooks';

type GameMode = 'main-menu' | 'playing';

// Définir le type de GameContext
interface GameContextType {
  // État du jeu
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
  
  // Contrôle du jeu
  handleKeyInput: (key: string) => void;
  handleVirtualKeyboard: (action: string) => void;
  closeValidationResult: () => void;
  handleGameComplete: (won: boolean, attempts: number, providedEndGameData?: EndGameData | null) => Promise<void>;
  
  // Changement de mode
  returnToMainMenu: () => void;
  
  // Gestion de la difficulté et du jeu
  handleDifficultySelect: (difficulty: Difficulty) => void;
  startNewGame: () => Promise<void>;
  startDailyChallenge: () => Promise<void>;
  quickStart: () => Promise<void>;
  restartGame: () => Promise<void>;
  returnToDifficultySelection: () => void;
  getGameStats: () => Promise<GameStats | null>;
}

// Créer le Context
const GameContext = createContext<GameContextType | null>(null);

// Composant GameProvider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Utiliser le Hook de gestion de l'état du jeu
  const gameStateHook = useGameState();
  
  // Utiliser le Hook de gestion de la completion du jeu
  const { handleGameComplete } = useGameCompletion({
    gameState: gameStateHook.gameState,
    sessionId: gameStateHook.sessionId,
    isDailyChallenge: gameStateHook.isDailyChallenge,
    setEndGameDataWithRef: gameStateHook.setEndGameDataWithRef
  });
  
  // Utiliser le Hook des opérations de jeu
  const gameActionsHook = useGameActions({
    gameState: gameStateHook.gameState,
    sessionId: gameStateHook.sessionId,
    setGameState: gameStateHook.setGameState,
    handleGameComplete
  });
  
  // Utiliser le Hook de gestion du jeu
  const gameManagerHook = useGameManager({
    gameState: gameStateHook.gameState,
    sessionId: gameStateHook.sessionId,
    selectedDifficulty: gameStateHook.selectedDifficulty,
    lastPlayedDifficulty: gameStateHook.lastPlayedDifficulty,
    isDailyChallenge: gameStateHook.isDailyChallenge,
    gameMode: gameStateHook.gameMode,
    setGameState: gameStateHook.setGameState,
    setSessionId: gameStateHook.setSessionId,
    setSelectedDifficulty: gameStateHook.setSelectedDifficulty,
    setLastPlayedDifficulty: gameStateHook.setLastPlayedDifficulty,
    setIsDailyChallenge: gameStateHook.setIsDailyChallenge,
    setGameMode: gameStateHook.setGameMode,
    setEndGameDataWithRef: gameStateHook.setEndGameDataWithRef,
    setGameCompleteProcessing: gameStateHook.setGameCompleteProcessing,
    createInitialGameStateWithDifficulty: gameStateHook.createInitialGameStateWithDifficulty,
    resetGameState: gameStateHook.resetGameState
  });

  // Utiliser useMemo pour mettre en cache contextValue, éviter les re-rendus inutiles
  const contextValue: GameContextType = useMemo(() => ({
    // État du jeu
    gameState: gameStateHook.gameState,
    sessionId: gameStateHook.sessionId,
    gameMode: gameStateHook.gameMode,
    selectedDifficulty: gameStateHook.selectedDifficulty,
    lastPlayedDifficulty: gameStateHook.lastPlayedDifficulty,
    isChecking: gameActionsHook.isChecking,
    isValidating: gameActionsHook.isValidating,
    isLoadingWord: gameManagerHook.isLoadingWord,
    validationResult: gameActionsHook.validationResult,
    isDailyChallenge: gameStateHook.isDailyChallenge,
    endGameData: gameStateHook.endGameData,
    
    // Contrôle du jeu
    handleKeyInput: gameActionsHook.handleKeyInput,
    handleVirtualKeyboard: gameActionsHook.handleVirtualKeyboard,
    closeValidationResult: gameActionsHook.closeValidationResult,
    handleGameComplete,
    
    // Changement de mode
    returnToMainMenu: gameManagerHook.returnToMainMenu,
    
    // Gestion de la difficulté et du jeu
    handleDifficultySelect: gameManagerHook.handleDifficultySelect,
    startNewGame: gameManagerHook.startNewGame,
    startDailyChallenge: gameManagerHook.startDailyChallenge,
    quickStart: gameManagerHook.quickStart,
    restartGame: gameManagerHook.restartGame,
    returnToDifficultySelection: gameManagerHook.returnToDifficultySelection,
    getGameStats: gameManagerHook.getGameStats
  }), [
    gameStateHook.gameState,
    gameStateHook.sessionId,
    gameStateHook.gameMode,
    gameStateHook.selectedDifficulty,
    gameStateHook.lastPlayedDifficulty,
    gameActionsHook.isChecking,
    gameActionsHook.isValidating,
    gameManagerHook.isLoadingWord,
    gameActionsHook.validationResult,
    gameStateHook.isDailyChallenge,
    gameStateHook.endGameData,
    gameActionsHook.handleKeyInput,
    gameActionsHook.handleVirtualKeyboard,
    gameActionsHook.closeValidationResult,
    handleGameComplete,
    gameManagerHook.returnToMainMenu,
    gameManagerHook.handleDifficultySelect,
    gameManagerHook.startNewGame,
    gameManagerHook.startDailyChallenge,
    gameManagerHook.quickStart,
    gameManagerHook.restartGame,
    gameManagerHook.returnToDifficultySelection,
    gameManagerHook.getGameStats
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Hook personnalisé pour utiliser GameContext
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};