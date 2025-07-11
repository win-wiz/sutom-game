'use client';

import { type DifficultyInfo, type Difficulty } from '@/types/game';
import { wordService } from '@/lib/wordService';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty | null;
  onDifficultySelect: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  isLoading?: boolean;
}

export const DifficultySelector = ({
  selectedDifficulty,
  onDifficultySelect,
  onStartGame,
  isLoading = false
}: DifficultySelectorProps) => {
  const difficultyLevels = wordService.getDifficultyLevels();
  const stats = wordService.getDifficultyStats();

  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">选择游戏难度</h2>
        <p className="text-gray-300 mb-8">
          选择适合您的难度级别开始游戏
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {difficultyLevels.map((level) => {
          const isSelected = selectedDifficulty === level.level;
          const stat = stats[level.level];
          
          return (
            <div
              key={level.level}
              onClick={() => onDifficultySelect(level.level)}
              className={`
                relative cursor-pointer p-6 rounded-lg border-2 transition-all duration-200 transform
                ${isSelected 
                  ? 'border-blue-400 bg-blue-900/30 scale-105 shadow-lg shadow-blue-400/20' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50 hover:scale-102'
                }
              `}
            >
              {/* 选中指示器 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-2 ${level.color}`}>
                  {level.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {level.description}
                </p>
                
                {/* 统计信息 */}
                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">词汇数量:</span>
                    <span className="text-white font-medium">{stat.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">平均长度:</span>
                    <span className="text-white font-medium">{stat.avgLength} 字母</span>
                  </div>
                </div>

                {/* 难度图标 */}
                <div className="flex justify-center mt-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 mx-1 rounded-full ${
                        i < (level.level === 'easy' ? 1 : level.level === 'medium' ? 2 : 3)
                          ? level.color.replace('text-', 'bg-')
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 开始游戏按钮 */}
      <div className="flex flex-col items-center space-y-4">
        {/* {selectedDifficulty && (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              已选择: <span className={`font-bold ${difficultyLevels.find(l => l.level === selectedDifficulty)?.color}`}>
                {difficultyLevels.find(l => l.level === selectedDifficulty)?.name}
              </span>
            </p>
          </div>
        )} */}
        
        <button
          onClick={onStartGame}
          disabled={!selectedDifficulty || isLoading}
          className={`
            px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform
            ${selectedDifficulty && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>加载中...</span>
            </div>
          ) : (
            '开始游戏'
          )}
        </button>
      </div>

      {/* 帮助信息 */}
      <div className="text-center text-sm text-gray-400 max-w-lg">
        <p>💡 提示: 您可以随时返回更改难度级别</p>
      </div>
    </div>
  );
}; 