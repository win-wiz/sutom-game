'use client';

import { memo, useMemo } from 'react';
import { GameGrid } from './game-grid';
import { VirtualKeyboard } from './virtual-keyboard';
import { ValidationStatus } from './validation-status';
import { GameResultDialog } from './game-result-dialog';
import CheckingStatus from './checking-status';
import type { GameState } from '@/types/game';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  source?: string;
  suggestion?: string;
  message?: string;
  [key: string]: unknown;
}

interface EndGameData {
  sessionId: string;
  isWon: boolean;
  attempts: number;
  gameTime: number;
  wordInfo: {
    id?: number;
    word: string;
    difficulty: string;
    length: number;
    definition?: string;
    origin?: string;
    category?: string;
    pronunciation?: string;
    [key: string]: unknown;
  } & Record<string, unknown>;
  wordStats: {
    totalAttempts: number;
    totalSuccesses: number;
    successRate: number;
    averageAttempts: number;
    averageGameTime: number;
    perceivedDifficulty: number;
    [key: string]: unknown;
  };
}

interface GameStats {
  overall: {
    totalSessions: number;
    completedSessions: number;
    wonSessions: number;
    winRate: number;
    averageAttempts: number;
    averageGameTime: number;
  };
  dailyChallenge: {
    totalSessions: number;
  };
}

interface GamePlayProps {
  gameState: GameState;
  isChecking: boolean;
  isValidating: boolean;
  validationResult: ValidationResult | null;
  showResultDialog: boolean;
  isLoadingWord: boolean;
  endGameData: EndGameData | null;
  onVirtualKeyboard: (key: string) => void;
  onCloseValidationResult: () => void;
  onCloseResultDialog: () => void;
  onRestartFromDialog: () => void;
  onReturnToDifficultyFromDialog: () => void;
  getGameStats: () => Promise<GameStats | null>;
}

const GamePlayComponent = ({
  gameState,
  isChecking,
  isValidating,
  validationResult,
  showResultDialog,
  isLoadingWord,
  endGameData,
  onVirtualKeyboard,
  onCloseValidationResult,
  onCloseResultDialog,
  onRestartFromDialog,
  onReturnToDifficultyFromDialog,
  getGameStats
}: GamePlayProps) => {
  // Utiliser useMemo pour mettre en cache l'état de fin de jeu
  const isGameOver = useMemo(() => 
    gameState?.gameStatus === 'won' || gameState?.gameStatus === 'lost', 
    [gameState?.gameStatus]
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-800 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className="flex flex-1 items-center justify-center relative min-h-0">
          <GameGrid
            rows={gameState.rows}
          />
          <CheckingStatus isChecking={isChecking} />
        </div>
      
        <div className="flex-shrink-0 bg-gray-800 border-gray-700 pb-6">
          <VirtualKeyboard
            onLetterClick={onVirtualKeyboard}
            onBackspace={() => onVirtualKeyboard('backspace')}
            onEnter={() => onVirtualKeyboard('enter')}
            keyboardStates={gameState.keyboardStates}
            disabled={isChecking || isGameOver}
          />
        </div>
      </div>
      
      <GameResultDialog
        gameState={gameState}
        isOpen={showResultDialog}
        onClose={onCloseResultDialog}
        onRestartGame={onRestartFromDialog}
        onReturnToDifficulty={onReturnToDifficultyFromDialog}
        isLoadingWord={isLoadingWord}
        getGameStats={getGameStats}
        endGameData={endGameData}
      />
      
      <ValidationStatus
        isValidating={isValidating}
        validationResult={validationResult}
        onClose={onCloseValidationResult}
      />
    </div>
  );
};

export const GamePlay = memo(GamePlayComponent);