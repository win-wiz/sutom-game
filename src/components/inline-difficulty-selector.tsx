'use client';

import { memo } from 'react';
import { wordService } from '@/lib/wordService';
import type { Difficulty } from '@/types/game';

interface InlineDifficultySelectorProps {
  selectedDifficulty: Difficulty | null;
  isLoadingWord: boolean;
  onDifficultySelect: (difficulty: Difficulty) => void;
  onStartNewGame: () => void;
}

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

const InlineDifficultySelectorComponent = ({
  selectedDifficulty,
  isLoadingWord,
  onDifficultySelect,
  onStartNewGame
}: InlineDifficultySelectorProps) => {
  return (
    <div className="space-y-4">
      {DIFFICULTY_LEVELS.map((level) => {
        const difficultyLevel = wordService.getDifficultyLevels().find(d => d.level === level);
        if (!difficultyLevel) return null;
        
        const isSelected = selectedDifficulty === level;
        
        return (
          <div
            key={level}
            className={`relative rounded-xl transition-all duration-300 ${
              isSelected ? `bg-${difficultyLevel.color.split('-')[1]}-500/10` : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
          >
            <div
              onClick={() => onDifficultySelect(level as Difficulty)}
              className={`w-full min-h-16 flex items-center px-4 sm:px-6 cursor-pointer ${
                isLoadingWord ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <div className="flex-1">
                <div className={`font-bold text-base sm:text-lg ${difficultyLevel.color} mb-1`}>
                  {difficultyLevel.name}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm leading-tight">
                  {difficultyLevel.description}
                </div>
              </div>
              {isSelected && (
                <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartNewGame();
                    }}
                    disabled={isLoadingWord}
                    className={`px-3 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 ${
                      isLoadingWord 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                  >
                    Commencer
                  </button>
                </div>
              )}
            </div>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors duration-300 ${
              isSelected ? difficultyLevel.color.replace('text', 'bg') : 'bg-transparent'
            }`}
            />
          </div>
        );
      })}
    </div>
  );
};

export const InlineDifficultySelector = memo(InlineDifficultySelectorComponent);