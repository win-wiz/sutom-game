'use client';

import { memo } from 'react';
import type { ServerStats } from '@/types/game';

interface ServerStatsProps {
  serverStats: ServerStats | null;
  isLoadingStats: boolean;
}

const ServerStatsComponent = ({ serverStats, isLoadingStats }: ServerStatsProps) => {
  const stats = [
    {
      label: 'Participants',
      value: isLoadingStats ? '...' : (serverStats?.totalParticipants ?? 0)
    },
    {
      label: 'Essais Moyens',
      value: isLoadingStats ? '...' : (serverStats?.averageAttempts?.toFixed(1) ?? '0.0')
    },
    {
      label: 'Taux de Réussite',
      value: isLoadingStats ? '...' : `${serverStats?.winRate?.toFixed(1) ?? '0.0'}%`
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ServerStatsDisplay = memo(ServerStatsComponent);