'use client';

import { useMemo } from 'react';
import type { GameState } from '@/types/game';
import { wordService } from '@/lib/wordService';

interface GameStatsProps {
  gameState: GameState;
}

const MAX_ATTEMPTS = 6; // Sutom permet généralement 6 tentatives

export const GameStats = ({ gameState }: GameStatsProps) => {
  const stats = useMemo(() => {
    if (!gameState) return null;

    const difficultyInfo = gameState.difficulty ? 
      wordService.getDifficultyLevels().find(d => d.level === gameState.difficulty) : null;

    if (!difficultyInfo) return null;

    const currentAttempt = gameState.currentRow + 1;
    const completedRows = gameState.rows.filter(row => row.isCompleted).length;
    const progressPercentage = (completedRows / MAX_ATTEMPTS) * 100;
    
    const difficultyLevel = gameState.difficulty === 'easy' ? 1 : 
                           gameState.difficulty === 'medium' ? 2 : 3;
    
    const progressColor = progressPercentage <= 50 ? 'bg-green-500' : 
                         progressPercentage <= 80 ? 'bg-yellow-500' : 'bg-red-500';

    return {
      difficultyInfo,
      currentAttempt,
      progressPercentage,
      difficultyLevel,
      progressColor,
      wordLength: gameState.targetWord.length
    };
  }, [gameState]);

  if (!stats) return null;

  const { difficultyInfo, currentAttempt, progressPercentage, difficultyLevel, progressColor, wordLength } = stats;

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-2 bg-gray-900/30 rounded-lg border border-gray-700/50">
      {/* Gauche: Difficulté et informations sur le mot */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyInfo.color} bg-gray-800/70 border border-gray-600`}>
            {difficultyInfo.name}
          </span>
          <div className="flex space-x-0.5">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < difficultyLevel
                    ? difficultyInfo.color.replace('text-', 'bg-')
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-300">
          Longueur: <span className="text-white font-medium">{wordLength}</span>
        </div>
      </div>

      {/* Droite: Informations de progression */}
      <div className="flex items-center space-x-3">
        <div className="text-xs text-gray-300">
          <span className="text-gray-400">Progrès:</span> <span className="text-white font-medium">{currentAttempt}/{MAX_ATTEMPTS}</span>
        </div>
        
        <div className="w-16 bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};