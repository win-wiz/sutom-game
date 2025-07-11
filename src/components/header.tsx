'use client';

import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';

const Header = () => {
  const { 
    gameState, 
    gameMode,
    isDailyChallenge,
    isLoadingWord,
    restartGame,
    returnToDifficultySelection
  } = useGame();

  // 调试输出
  console.log('Header render:', { gameMode, gameState: !!gameState });

  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-700/50 bg-gray-800">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Sutom</span>
          </Link>

          {/* 游戏信息 - 只在游戏模式下显示 */}
          {gameMode === 'playing' && gameState && (
            <div className="flex items-center space-x-4 ml-6">
              {isDailyChallenge ? (
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400">📅</span>
                  <span className="text-purple-400 font-medium">每日挑战</span>
                </div>
              ) : (
                <>
                  <div className={`px-2 py-1 rounded text-sm font-medium
                    ${gameState.difficulty === 'easy' 
                      ? 'bg-green-500/20 text-green-400'
                      : gameState.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'}`}
                  >
                    {gameState.difficulty === 'easy' ? '初级' : 
                     gameState.difficulty === 'medium' ? '中级' : '高级'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    长度: {gameState.targetWord.length}
                  </div>
                  <div className="text-gray-400 text-sm">
                    进度: {gameState.currentRow}/6
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 游戏控制按钮 - 只在游戏模式下显示 */}
        {gameMode === 'playing' && gameState && (
          <div className="flex items-center space-x-3">
            <button
              onClick={restartGame}
              disabled={isLoadingWord}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300
                ${isLoadingWord 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {isLoadingWord ? '加载中...' : '重新开始'}
            </button>
            
            <button
              onClick={returnToDifficultySelection}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-300"
            >
              {isDailyChallenge ? '返回挑战' : '返回主菜单'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 