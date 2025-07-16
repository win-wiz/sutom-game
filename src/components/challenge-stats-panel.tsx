import React from 'react';
import type { ServerStats } from '@/types/game';

interface ChallengeStatsPanelProps {
  server?: ServerStats | null;
  isLoading?: boolean;
}

const StatItem: React.FC<{ label: string; value: React.ReactNode }> = React.memo(({ label, value }) => (
  <>
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-base font-semibold text-white text-right">{value}</div>
  </>
));
StatItem.displayName = 'StatItem';

const SkeletonLoader: React.FC = () => (
  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 animate-pulse">
    <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
    <div className="grid grid-cols-4 grid-rows-4 gap-x-6 gap-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-5 bg-gray-700 rounded"></div>
        </React.Fragment>
      ))}
    </div>
  </div>
);
SkeletonLoader.displayName = 'SkeletonLoader';


const ChallengeStatsPanel: React.FC<ChallengeStatsPanelProps> = React.memo(({ server, isLoading = false }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!server || Object.keys(server).length === 0) {
    return null; // Don't render anything if there's no server data
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <span className="mr-2 text-xl">🌐</span>
Statistiques du réseau
      </h3>
      
      <div className="grid grid-cols-[auto,1fr,auto,1fr] grid-rows-4 gap-x-6 gap-y-3">
        <StatItem label="Participants" value={server.totalParticipants?.toLocaleString() ?? '-'} />
        <StatItem label="Taux de victoire" value={`${(server.winRate ?? 0).toFixed(1)}%`} />
        
        <StatItem label="Défis terminés" value={server.totalCompleted?.toLocaleString() ?? '-'} />
        <StatItem label="Tentatives moy." value={`${(server.averageAttempts ?? 0).toFixed(1)} fois`} />
        
        <StatItem label="Victoires" value={server.totalWon?.toLocaleString() ?? '-'} />
        <StatItem label="Temps moyen" value={`${Math.round((server.averageGameTime ?? 0) / 1000)}s`} />

        <StatItem label="Taux de réussite" value={`${(server.completionRate ?? 0).toFixed(1)}%`} />
        <StatItem 
          label="État du service" 
          value={
            <span className="flex items-center justify-end gap-2">
              <div className={`w-3 h-3 rounded-full ${server.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {server.isActive ? 'Actif' : 'Maintenance'}
            </span>
          } 
        />
      </div>
    </div>
  );
});

ChallengeStatsPanel.displayName = 'ChallengeStatsPanel';

export default ChallengeStatsPanel;