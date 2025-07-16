'use client';

import { useCallback } from 'react';
import { type GameState } from '@/types/game';
import { dailyChallengeService } from '@/lib/dailyChallenge';
import { gameSessionAPI } from '@/services/api';
import type { EndGameData } from '@/types';

interface UseGameCompletionProps {
  gameState: GameState | null;
  sessionId: string | null;
  isDailyChallenge: boolean;
  setEndGameDataWithRef: (data: EndGameData | null) => void;
}

/**
 * Hook de gestion de la completion du jeu
 * Responsable de la gestion de la logique et du traitement des données à la fin du jeu
 */
export const useGameCompletion = ({
  gameState,
  sessionId,
  isDailyChallenge,
  setEndGameDataWithRef
}: UseGameCompletionProps) => {

  // Gérer la completion du jeu
  const handleGameComplete = useCallback(async (won: boolean, attempts: number, providedEndGameData?: EndGameData | null) => {
    if (providedEndGameData) {
      setEndGameDataWithRef(providedEndGameData);
    } else if (sessionId) {
      // En mode API, appeler l'interface endGame pour obtenir les statistiques complètes
      try {
        const endGameResponse = await gameSessionAPI.endGame(sessionId);
        if (endGameResponse.success && endGameResponse.data) {
          setEndGameDataWithRef(endGameResponse.data);
        } else {
          // Si l'API endGame échoue, générer des endGameData de base
          const basicEndGameData: EndGameData = {
            sessionId,
            isWon: won,
            attempts,
            gameTime: attempts * 30,
            wordInfo: {
              word: gameState?.targetWord ?? 'unknown',
              difficulty: gameState?.difficulty ?? 'medium',
              length: gameState?.targetWord?.length ?? 4,
              definition: 'Aucune information de définition disponible en mode API',
              category: 'Jeu en ligne'
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
        console.error('Échec de l\'appel à l\'API endGame:', error);
        // Générer des endGameData de base
        const basicEndGameData: EndGameData = {
          sessionId,
          isWon: won,
          attempts,
          gameTime: attempts * 30,
          wordInfo: {
            word: gameState?.targetWord ?? 'unknown',
            difficulty: gameState?.difficulty ?? 'medium',
            length: gameState?.targetWord?.length ?? 4,
            definition: 'Échec de l\'appel API',
            category: 'Jeu en ligne'
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
      // Générer des endGameData de base en mode local
      const localEndGameData: EndGameData = {
        sessionId: 'local-session',
        isWon: won,
        attempts,
        gameTime: attempts * 30,
        wordInfo: {
          word: gameState?.targetWord ?? 'unknown',
          difficulty: gameState?.difficulty ?? 'medium',
          length: gameState?.targetWord?.length ?? 4,
          definition: 'Aucune information de définition disponible en mode local',
          category: 'Jeu local'
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

    // Mettre à jour l'état du défi quotidien
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

  return {
    handleGameComplete
  };
};