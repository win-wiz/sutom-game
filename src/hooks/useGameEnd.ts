'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '@/types/game';
import type { EndGameData } from '@/types/index';

interface UseGameEndProps {
  gameState: GameState | null;
  endGameData: EndGameData | null;
  sessionId: string | null;
  isDailyChallenge: boolean;
  dailyChallengeCompleted: boolean;
  onUpdateDailyChallengeResult: (won: boolean, attempts: number) => void;
}

export const useGameEnd = ({
  gameState,
  endGameData,
  sessionId,
  isDailyChallenge,
  dailyChallengeCompleted,
  onUpdateDailyChallengeResult
}: UseGameEndProps) => {
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Gérer la logique de fin de jeu
  const handleGameEnd = useCallback(() => {
    if (!gameState || (gameState.gameStatus !== 'won' && gameState.gameStatus !== 'lost')) {
      return;
    }

    // Si c'est un défi quotidien et qu'il n'est pas encore terminé, mettre à jour le statut
    if (isDailyChallenge && !dailyChallengeCompleted) {
      const won = gameState.gameStatus === 'won';
      const attempts = gameState.currentRow + (won ? 1 : 0);
      onUpdateDailyChallengeResult(won, attempts);
    }
    
    if (sessionId) {
      const showDialog = () => setShowResultDialog(true);
      
      if (endGameData) {
        showDialog();
      } else {
        const timer = setTimeout(showDialog, 500);
        return () => clearTimeout(timer);
      }
    } else {
      setShowResultDialog(true);
    }
  }, [gameState, endGameData, sessionId, isDailyChallenge, dailyChallengeCompleted, onUpdateDailyChallengeResult]);

  // Fermer la boîte de dialogue des résultats
  const handleCloseResultDialog = useCallback(() => {
    setShowResultDialog(false);
  }, []);

  useEffect(() => {
    handleGameEnd();
  }, [handleGameEnd]);

  return {
    showResultDialog,
    handleCloseResultDialog,
    setShowResultDialog
  };
};