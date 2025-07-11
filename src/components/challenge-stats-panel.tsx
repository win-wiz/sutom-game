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
        全网统计
      </h3>
      
      <div className="grid grid-cols-[auto,1fr,auto,1fr] grid-rows-4 gap-x-6 gap-y-3">
        <StatItem label="参与人数" value={server.totalParticipants?.toLocaleString() ?? '-'} />
        <StatItem label="全网胜率" value={`${(server.winRate ?? 0).toFixed(1)}%`} />
        
        <StatItem label="完成挑战" value={server.totalCompleted?.toLocaleString() ?? '-'} />
        <StatItem label="平均尝试" value={`${(server.averageAttempts ?? 0).toFixed(1)}次`} />
        
        <StatItem label="胜利次数" value={server.totalWon?.toLocaleString() ?? '-'} />
        <StatItem label="平均用时" value={`${Math.round((server.averageGameTime ?? 0) / 1000)}s`} />

        <StatItem label="完成率" value={`${(server.completionRate ?? 0).toFixed(1)}%`} />
        <StatItem 
          label="服务状态" 
          value={
            <span className="flex items-center justify-end gap-2">
              <div className={`w-3 h-3 rounded-full ${server.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {server.isActive ? '活跃' : '维护'}
            </span>
          } 
        />
      </div>
    </div>
  );
});

ChallengeStatsPanel.displayName = 'ChallengeStatsPanel';

export default ChallengeStatsPanel; 