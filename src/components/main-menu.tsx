'use client';

import { memo } from 'react';
import { DailyChallenge } from './daily-challenge';
import { ClassicMode } from './classic-mode';
import { HelpCenter } from './help-center';
import { FAQ } from './faq';
import type { Difficulty, ServerStats } from '@/types/game';

interface MainMenuProps {
  // Daily Challenge props
  dailyChallengeCompleted: boolean;
  dailyChallengeResult: { won: boolean; attempts: number } | null;
  canPlayDaily: boolean;
  countdown: { total: number; days: number; hours: number; minutes: number; seconds: number };
  serverStats: ServerStats | null;
  isLoadingStats: boolean;
  onStartDailyChallenge: () => void;
  
  // Classic Mode props
  selectedDifficulty: Difficulty | null;
  lastPlayedDifficulty: Difficulty | null;
  isLoadingWord: boolean;
  onDifficultySelect: (difficulty: Difficulty) => void;
  onStartNewGame: () => void;
  onQuickStart: () => void;
}

const MainMenuComponent = ({
  // Daily Challenge props
  dailyChallengeCompleted,
  dailyChallengeResult,
  canPlayDaily,
  countdown,
  serverStats,
  isLoadingStats,
  onStartDailyChallenge,
  
  // Classic Mode props
  selectedDifficulty,
  lastPlayedDifficulty,
  isLoadingWord,
  onDifficultySelect,
  onStartNewGame,
  onQuickStart
}: MainMenuProps) => {
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Jeu de Mots</h2>
          <p className="text-gray-400">Bienvenue sur Sutom</p>
        </div>
        
        {/* Modes de jeu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Défi quotidien */}
          <DailyChallenge
            dailyChallengeCompleted={dailyChallengeCompleted}
            dailyChallengeResult={dailyChallengeResult}
            canPlayDaily={canPlayDaily}
            isLoadingWord={isLoadingWord}
            countdown={countdown}
            serverStats={serverStats}
            isLoadingStats={isLoadingStats}
            onStartDailyChallenge={onStartDailyChallenge}
          />

          {/* Mode Classique */}
          <ClassicMode
            selectedDifficulty={selectedDifficulty}
            lastPlayedDifficulty={lastPlayedDifficulty}
            isLoadingWord={isLoadingWord}
            onDifficultySelect={onDifficultySelect}
            onStartNewGame={onStartNewGame}
            onQuickStart={onQuickStart}
          />
        </div>

        {/* Section d'aide et FAQ */}
        <div className="space-y-8">
          {/* Centre d'aide */}
          <HelpCenter />
          
          {/* FAQ */}
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export const MainMenu = memo(MainMenuComponent);