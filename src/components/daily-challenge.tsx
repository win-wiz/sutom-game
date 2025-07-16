'use client';

import { memo } from 'react';
import { formatCountdown } from '@/hooks/useCountdown';
import { ServerStatsDisplay } from './server-stats';
import type { ServerStats as ServerStatsType } from '@/types/game';

interface DailyChallengeProps {
  dailyChallengeCompleted: boolean;
  dailyChallengeResult: { won: boolean; attempts: number } | null;
  canPlayDaily: boolean;
  isLoadingWord: boolean;
  countdown: { total: number; days: number; hours: number; minutes: number; seconds: number };
  serverStats: ServerStatsType | null;
  isLoadingStats: boolean;
  onStartDailyChallenge: () => void;
}

const DailyChallengeComponent = ({
  dailyChallengeCompleted,
  dailyChallengeResult,
  canPlayDaily,
  isLoadingWord,
  countdown,
  serverStats,
  isLoadingStats,
  onStartDailyChallenge
}: DailyChallengeProps) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4">
          <span className="text-3xl">🗓️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Défi Quotidien</h3>
        <p className="text-gray-400 text-sm">
          {dailyChallengeCompleted 
            ? 'Vous avez terminé le défi du jour ! Revenez demain.' 
            : 'Un mot sélectionné chaque jour, jouez avec le monde entier !'
          }
        </p>
      </div>
      
      {/* État du défi ou bouton de démarrage */}
      <div className="text-center mb-6">
        {dailyChallengeCompleted ? (
          <div className="space-y-4">
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl ${
              dailyChallengeResult?.won ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <span className="text-2xl">
                {dailyChallengeResult?.won ? '🎉' : '💔'}
              </span>
              <span className="font-bold text-lg">
                {dailyChallengeResult?.won 
                  ? `${dailyChallengeResult.attempts}/6 Terminé` 
                  : 'Échec'
                }
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-sm">Prochain défi dans</span>
              <div className="text-xl font-mono font-bold mt-1">
                {formatCountdown(countdown)}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onStartDailyChallenge}
            disabled={isLoadingWord || !canPlayDaily}
            className={`px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
              isLoadingWord || !canPlayDaily
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transform hover:scale-105'
            }`}
          >
            {isLoadingWord ? 'Chargement...' : 'Commencer le Défi'}
          </button>
        )}
      </div>
      
      {/* Statistiques */}
      <ServerStatsDisplay serverStats={serverStats} isLoadingStats={isLoadingStats} />
    </div>
  );
};

export const DailyChallenge = memo(DailyChallengeComponent);