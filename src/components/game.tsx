'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { LoadingSpinner } from './loading-spinner';
import { MainMenu } from './main-menu';
import { GamePlay } from './game-play';
import { Footer } from './footer';
import { useCountdown } from '@/hooks/useCountdown';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useGameEnd } from '@/hooks/useGameEnd';
import { useKeyboardHandler } from '@/hooks/useKeyboardHandler';


const GameComponent = () => {
  const { 
    gameState, 
    gameMode,
    selectedDifficulty,
    lastPlayedDifficulty,
    isChecking, 
    isValidating, 
    isLoadingWord,
    validationResult, 
    isDailyChallenge,
    endGameData,
    handleKeyInput, 
    handleVirtualKeyboard,
    closeValidationResult,
    returnToMainMenu,
    handleDifficultySelect,
    startNewGame,
    startDailyChallenge,
    quickStart,
    restartGame,
    returnToDifficultySelection,
    getGameStats,
    sessionId
  } = useGame();

  const [isClient, setIsClient] = useState(false);
  
  // 倒计时 - 计算到明天的时间
  const nextChallengeTime = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);
  const countdown = useCountdown(nextChallengeTime);

  // 使用自定义hooks
  const {
    dailyChallengeCompleted,
    dailyChallengeResult,
    canPlayDaily,
    serverStats,
    isLoadingStats,
    fetchStats,
    resetDailyChallengeStatus,
    updateDailyChallengeResult
  } = useDailyChallenge(isClient);

  const { showResultDialog, handleCloseResultDialog } = useGameEnd({
    gameState,
    endGameData,
    sessionId,
    isDailyChallenge,
    dailyChallengeCompleted,
    onUpdateDailyChallengeResult: updateDailyChallengeResult
  });

  useKeyboardHandler({ gameMode, handleKeyInput });

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 监听倒计时，在新的一天开始时重置状态
  useEffect(() => {
    if (countdown.total <= 0 && dailyChallengeCompleted && !canPlayDaily) {
      resetDailyChallengeStatus();
    }
  }, [countdown.total, dailyChallengeCompleted, canPlayDaily, resetDailyChallengeStatus]);

  // 在主菜单时获取统计数据
  useEffect(() => {
    if (isClient && gameMode === 'main-menu') {
      void fetchStats();
    }
  }, [isClient, gameMode, fetchStats]);

  // 根据游戏模式控制页面滚动
  useEffect(() => {
    if (!isClient) return;
    
    const body = document.body;
    const main = document.querySelector('main');
    
    if (gameMode === 'main-menu') {
      // 主菜单模式：允许滚动
      body.style.overflow = 'auto';
      if (main) {
        main.style.overflow = 'auto';
        main.style.height = 'auto';
      }
    } else {
      // 游戏模式：禁止滚动，固定高度
      body.style.overflow = 'hidden';
      if (main) {
        main.style.overflow = 'hidden';
        main.style.height = '100vh';
      }
    }
    
    // 清理函数：组件卸载时恢复默认状态
    return () => {
      body.style.overflow = 'auto';
      if (main) {
        main.style.overflow = 'auto';
        main.style.height = 'auto';
      }
    };
  }, [isClient, gameMode]);

  // 结果对话框回调函数
  const handleRestartFromDialog = useCallback(() => {
    handleCloseResultDialog();
    void restartGame();
  }, [handleCloseResultDialog, restartGame]);

  const handleReturnToDifficultyFromDialog = useCallback(() => {
    handleCloseResultDialog();
    returnToDifficultySelection();
  }, [handleCloseResultDialog, returnToDifficultySelection]);

  // 客户端渲染检查
  if (!isClient) {
    return <LoadingSpinner />;
  }

  // 主菜单模式
  if (gameMode === 'main-menu') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <MainMenu
            // Daily Challenge props
            dailyChallengeCompleted={dailyChallengeCompleted}
            dailyChallengeResult={dailyChallengeResult}
            canPlayDaily={canPlayDaily}
            countdown={countdown}
            serverStats={serverStats}
            isLoadingStats={isLoadingStats}
            onStartDailyChallenge={startDailyChallenge}
            
            // Classic Mode props
            selectedDifficulty={selectedDifficulty}
            lastPlayedDifficulty={lastPlayedDifficulty}
            isLoadingWord={isLoadingWord}
            onDifficultySelect={handleDifficultySelect}
            onStartNewGame={startNewGame}
            onQuickStart={quickStart}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // 游戏进行中但未加载完成
  if (gameMode === 'playing' && !gameState) {
    return <LoadingSpinner />;
  }

  // 异常状态处理
  if (gameMode !== 'playing' && !gameState) {
    console.warn('异常状态，返回主菜单');
    returnToMainMenu();
    return null;
  }

  // gameState仍为null的情况
  if (!gameState) {
    return <LoadingSpinner />;
  }

  // 游戏进行模式
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <GamePlay
          gameState={gameState}
          isChecking={isChecking}
          isValidating={isValidating}
          validationResult={validationResult}
          showResultDialog={showResultDialog}
          isLoadingWord={isLoadingWord}
          endGameData={endGameData}
          onVirtualKeyboard={handleVirtualKeyboard}
          onCloseValidationResult={closeValidationResult}
          onCloseResultDialog={handleCloseResultDialog}
          onRestartFromDialog={handleRestartFromDialog}
          onReturnToDifficultyFromDialog={handleReturnToDifficultyFromDialog}
          getGameStats={getGameStats}
        />
      </div>
      <Footer />
    </div>
  );
};

// Utilise memo pour optimiser les re-rendus du composant
export const Game = memo(GameComponent);