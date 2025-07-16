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
    <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <span className="text-3xl">🎮</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Mode Classique</h3>
        <p className="text-gray-400 text-sm">
          Choisissez votre niveau et commencez à jouer !
        </p>
      </div>

      {/* Démarrage rapide */}
      {lastPlayedDifficulty && (
        <div className="text-center mb-8">
          <button
            onClick={onQuickStart}
            disabled={isLoadingWord}
            className={`px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
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