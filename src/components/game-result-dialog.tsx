'use client';

import { useState, useEffect } from 'react';
import { type GameState } from '@/types/game';
import { type GameStats as FullGameStats, type EndGameData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GameResultDialogProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onRestartGame: () => void;
  onReturnToDifficulty: () => void;
  isLoadingWord: boolean;
  getGameStats?: () => Promise<FullGameStats | null>;
  endGameData?: EndGameData | null;
}

// 默认的空统计函数
const defaultGetGameStats = async (): Promise<FullGameStats | null> => {
  console.warn('getGameStats 函数未提供，使用默认实现');
  return null;
};

export const GameResultDialog = ({
  gameState,
  isOpen,
  onClose,
  onRestartGame,
  onReturnToDifficulty,
  isLoadingWord,
  getGameStats = defaultGetGameStats,
  // endGameData,
}: GameResultDialogProps) => {
  const [gameStats, setGameStats] = useState<FullGameStats['overall'] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // const difficultyInfo = gameState.difficulty ? 
  //   wordService.getDifficultyLevels().find(d => d.level === gameState.difficulty) : null;

  const isWon = gameState.gameStatus === 'won';
  const isLost = gameState.gameStatus === 'lost';

  // 当弹窗打开时获取统计信息
  useEffect(() => {
    if (isOpen && (isWon || isLost)) {
      if (typeof getGameStats !== 'function') {
        console.warn('getGameStats 不是一个函数:', getGameStats);
        return;
      }
      setIsLoadingStats(true);
      getGameStats()
        .then((stats) => {
          if (stats?.overall) {
            setGameStats(stats.overall);
          } else {
            // Fallback for unexpected structure
            setGameStats(null);
          }
        })
        .catch((error) => {
          console.warn('获取游戏统计失败:', error);
          setGameStats(null);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    }
  }, [isOpen, isWon, isLost, getGameStats]);

  // 添加一个工具函数来处理数值转换
  const formatNumber = (value: number | string | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined) return '0.0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  };

  if (!isWon && !isLost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-none text-white p-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        {/* 顶部标题区 */}
        <DialogHeader className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 pb-3 z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              <span className="text-2xl animate-bounce">{isWon ? '🎉' : '😞'}</span>
            </div>
            <DialogTitle className={`text-xl font-bold ${
              isWon ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
            } text-transparent bg-clip-text`}>
              {isWon ? '恭喜您获胜！' : '游戏结束'}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm">
              {isWon ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span>成功猜出单词:</span>
                  <span className="font-mono font-bold text-base px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                    {gameState.targetWord}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <span>正确答案是:</span>
                  <span className="font-mono font-bold text-base px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                    {gameState.targetWord}
                  </span>
                </span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 游戏数据卡片区 */}
        <div className="space-y-3 py-3">
          {/* 单词信息卡片 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 text-lg">📝</span>
                  <h3 className="text-indigo-400 font-medium">单词详情</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gameState.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  gameState.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {gameState.difficulty === 'easy' ? '简单' :
                   gameState.difficulty === 'medium' ? '中等' : '困难'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">单词</div>
                  <div className="text-lg font-mono font-semibold text-white">{gameState.targetWord}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">长度</div>
                  <div className="text-lg font-mono font-semibold text-blue-400">{gameState.targetWord.length} 字母</div>
                </div>
              </div>
            </div>
          </div>

          {/* 本局统计卡片 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 text-lg">📊</span>
                <h3 className="text-emerald-400 font-medium">本局统计</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">尝试次数</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-mono font-semibold text-emerald-400">{gameState.currentRow + 1}</span>
                    <span className="text-gray-500 text-sm">/</span>
                    <span className="text-gray-400 text-sm">6</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full flex-1 ${
                          i < gameState.currentRow + 1
                            ? 'bg-emerald-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">成功率</div>
                  <div className="text-lg font-mono font-semibold text-emerald-400">
                    {isWon ? '100%' : '0%'}
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-1 bg-emerald-500 rounded-full"
                      style={{ width: isWon ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 全局统计卡片 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-purple-500/20 min-h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-400 text-lg">🏆</span>
                <h3 className="text-purple-400 font-medium">全局统计</h3>
              </div>
              {isLoadingStats ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="text-gray-400 text-sm mb-1">
                        {i === 1 ? '总游戏' : i === 2 ? '胜率' : i === 3 ? '平均尝试' : '平均用时'}
                      </div>
                      <div className="text-lg font-mono font-semibold text-purple-400/50">
                        -
                      </div>
                    </div>
                  ))}
                </div>
              ) : gameStats ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">总游戏</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {gameStats.totalSessions}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">胜率</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.winRate * 100, 1)}%
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">平均尝试</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.averageAttempts)} 次
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">平均用时</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.averageGameTime, 0)} 秒
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="text-gray-400 text-sm mb-1">
                        {i === 1 ? '总游戏' : i === 2 ? '胜率' : i === 3 ? '平均尝试' : '平均用时'}
                      </div>
                      <div className="text-lg font-mono font-semibold text-purple-400/50">
                        -
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮区 */}
        <DialogFooter className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-gray-900/95 pt-3 z-10 flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-3">
          <button
            onClick={onRestartGame}
            disabled={isLoadingWord}
            className={`w-full sm:w-1/2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isWon 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/30' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoadingWord ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                加载中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isWon ? '🎮 再来一局' : '🔄 重新挑战'}
              </span>
            )}
          </button>
          <button
            onClick={onReturnToDifficulty}
            className="w-full sm:w-1/2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500
              text-white shadow-lg shadow-gray-900/30"
          >
            <span className="flex items-center justify-center gap-2">
              🏠 返回主菜单
            </span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};