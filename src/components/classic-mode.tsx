'use client';

import { memo } from 'react';
import { InlineDifficultySelector } from './inline-difficulty-selector';
import type { Difficulty } from '@/types/game';

interface ClassicModeProps {
  selectedDifficulty: Difficulty | null;
  lastPlayedDifficulty: Difficulty | null;
  isLoadingWord: boolean;
  onDifficultySelect: (difficulty: Difficulty) => void;
  onStartNewGame: () => void;
  onQuickStart: () => void;
}

const ClassicModeComponent = ({
  selectedDifficulty,
  lastPlayedDifficulty,
  isLoadingWord,
  onDifficultySelect,
  onStartNewGame,
  onQuickStart
}: ClassicModeProps) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-8 border border-gray-700/50 backdrop-blur-sm">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-2xl mb-3 sm:mb-4">
          <span className="text-2xl sm:text-3xl">🎮</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Mode Classique</h3>
        <p className="text-gray-400 text-xs sm:text-sm px-2">
          Choisissez votre niveau et commencez à jouer !
        </p>
      </div>

      {/* Démarrage rapide */}
      {lastPlayedDifficulty && (
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={onQuickStart}
            disabled={isLoadingWord}
            className={`px-4 sm:px-8 py-2 sm:py-3 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 ${
              isLoadingWord 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-105'
            }`}
          >
            {isLoadingWord ? 'Chargement...' : 'Démarrage Rapide'}
          </button>
        </div>
      )}

      {/* Sélecteur de difficulté */}
      <InlineDifficultySelector
        selectedDifficulty={selectedDifficulty}
        isLoadingWord={isLoadingWord}
        onDifficultySelect={onDifficultySelect}
        onStartNewGame={onStartNewGame}
      />
    </div>
  );
};

export const ClassicMode = memo(ClassicModeComponent);