'use client';

import type { GameState } from '@/types/game';
import { wordService } from '@/lib/wordService';

interface GameStatsProps {
  gameState: GameState;
}

export const GameStats = ({ gameState }: GameStatsProps) => {
  if (!gameState) return null;

  const difficultyInfo = gameState.difficulty ? 
    wordService.getDifficultyLevels().find(d => d.level === gameState.difficulty) : null;

  if (!difficultyInfo) return null;

  const currentAttempt = gameState.currentRow + 1;
  const maxAttempts = 6; // Sutom 通常允许6次尝试
  const completedRows = gameState.rows.filter(row => row.isCompleted).length;
  const progressPercentage = (completedRows / maxAttempts) * 100;

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-2 bg-gray-900/30 rounded-lg border border-gray-700/50">
      {/* 左侧：难度和单词信息 */}
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
                  i < (gameState.difficulty === 'easy' ? 1 : gameState.difficulty === 'medium' ? 2 : 3)
                    ? difficultyInfo.color.replace('text-', 'bg-')
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-300">
          长度: <span className="text-white font-medium">{gameState.targetWord.length}</span>
        </div>
      </div>

      {/* 右侧：进度信息 */}
      <div className="flex items-center space-x-3">
        <div className="text-xs text-gray-300">
          <span className="text-gray-400">进度:</span> <span className="text-white font-medium">{currentAttempt}/6</span>
        </div>
        
        <div className="w-16 bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              progressPercentage <= 50 ? 'bg-green-500' : 
              progressPercentage <= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}; 