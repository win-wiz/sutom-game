'use client';

import { useState, useCallback, useRef } from 'react';
import { type GameState, type Difficulty } from '@/types/game';
import { createEmptyCell } from '@/lib/gameUtils';
import type { EndGameData } from '@/types';

type GameMode = 'main-menu' | 'playing';

/**
 * Hook de gestion de l'état du jeu
 * Responsable de la gestion de l'état de base du jeu : mode de jeu, sélection de difficulté, ID de session, etc.
 */
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('main-menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [lastPlayedDifficulty, setLastPlayedDifficulty] = useState<Difficulty | null>(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [endGameData, setEndGameData] = useState<EndGameData | null>(null);
  const [gameCompleteProcessing, setGameCompleteProcessing] = useState(false);
  const endGameDataRef = useRef<EndGameData | null>(null);

  // Créer une fonction auxiliaire pour définir endGameData
  const setEndGameDataWithRef = useCallback((data: EndGameData | null) => {
    endGameDataRef.current = data;
    setEndGameData(data);
  }, []);

  // Créer l'état initial du jeu avec difficulté
  const createInitialGameStateWithDifficulty = useCallback((word: string, difficulty: Difficulty | null): GameState => {
    const lettersCount: Record<string, number> = {};
    
    // Compter le nombre d'occurrences de chaque lettre dans le mot cible
    for (const letter of word) {
      lettersCount[letter] = (lettersCount[letter] ?? 0) + 1;
    }
    
    // Créer toutes les 6 lignes, première ligne avec première lettre affichée, autres lignes vides
    const maxAttempts = 6;
    const rows = Array.from({ length: maxAttempts }, (_, index) => {
      if (index === 0) {
        // Première ligne : première lettre affichée
        return {
          cells: word.split('').map((letter, cellIndex) => 
            createEmptyCell(cellIndex === 0 ? letter : '.')
          ),
          isCompleted: false
        };
      } else {
        // Autres lignes : première lettre affichée, autres vides
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

  // Réinitialiser l'état du jeu
  const resetGameState = useCallback(() => {
    setGameState(null);
    setSessionId(null);
    setSelectedDifficulty(null);
    setIsDailyChallenge(false);
    setEndGameDataWithRef(null);
    setGameCompleteProcessing(false);
  }, [setEndGameDataWithRef]);

  return {
    // États
    gameState,
    sessionId,
    gameMode,
    selectedDifficulty,
    lastPlayedDifficulty,
    isDailyChallenge,
    endGameData,
    gameCompleteProcessing,
    endGameDataRef,
    
    // Fonctions de définition d'état
    setGameState,
    setSessionId,
    setGameMode,
    setSelectedDifficulty,
    setLastPlayedDifficulty,
    setIsDailyChallenge,
    setEndGameDataWithRef,
    setGameCompleteProcessing,
    
    // Fonctions auxiliaires
    createInitialGameStateWithDifficulty,
    resetGameState
  };
};