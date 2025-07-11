'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GameGrid } from './game-grid';
import { VirtualKeyboard } from './virtual-keyboard';
import { ValidationStatus } from './validation-status';
import { GameResultDialog } from './game-result-dialog';
import { wordService } from '@/lib/wordService';
import CheckingStatus from './checking-status';
import { dailyChallengeService } from '@/lib/dailyChallenge';
import { useCountdown, formatCountdown } from '@/hooks/useCountdown';
import type { ServerStats, GameState, Difficulty } from '@/types/game';

  // Constantes pour l'optimisation des performances
const KEYBOARD_DISABLED_STATES = ['checking', 'won', 'lost'] as const;
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
const WEEKDAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

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

  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // État du défi quotidien
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [dailyChallengeResult, setDailyChallengeResult] = useState<{ won: boolean; attempts: number } | null>(null);
  const [canPlayDaily, setCanPlayDaily] = useState(true);
  
  // Compte à rebours - utilise useMemo pour éviter les recalculs à chaque rendu
  const nextChallengeTime = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);
  const countdown = useCountdown(nextChallengeTime);

  // Optimisation du formatage de date - utilise useMemo pour la mise en cache
  const formattedDate = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const weekday = WEEKDAYS_FR[now.getDay()];
    return `${day}/${month}/${year} ${weekday}`;
  }, []);

  // S'assurer que le rendu se fait uniquement côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Récupération du statut du défi quotidien - optimisé avec useCallback
  const checkDailyChallengeStatus = useCallback(async () => {
    try {
      const canPlay = await dailyChallengeService.canPlayToday();
      setCanPlayDaily(canPlay);
      
              if (!canPlay) {
          // Si on ne peut pas jouer, récupérer le résultat du défi d'aujourd'hui
          const todayChallenge = await dailyChallengeService.getTodayChallenge();
        setDailyChallengeCompleted(true);
        setDailyChallengeResult({
          won: todayChallenge.won,
          attempts: todayChallenge.attempts
        });
      } else {
        setDailyChallengeCompleted(false);
        setDailyChallengeResult(null);
      }
    } catch (error) {
      console.error('Échec de récupération du statut du défi quotidien:', error);
              setCanPlayDaily(true); // Par défaut, autoriser les tentatives
      setDailyChallengeCompleted(false);
      setDailyChallengeResult(null);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let mounted = true;
    
    const safeCheckStatus = async () => {
      if (mounted) {
        await checkDailyChallengeStatus();
      }
    };

    void safeCheckStatus();
    
    return () => {
      mounted = false;
    };
  }, [isClient, checkDailyChallengeStatus]);

  // Écoute du compte à rebours, réinitialise l'état au début d'une nouvelle journée - optimisé avec useCallback
  const resetDailyChallengeStatus = useCallback(() => {
    console.log('Compte à rebours terminé, réinitialisation du statut du défi quotidien');
    setDailyChallengeCompleted(false);
    setDailyChallengeResult(null);
    setCanPlayDaily(true);
  }, []);

  useEffect(() => {
    // Ne réinitialise que si le compte à rebours est terminé et que le défi est effectivement terminé
    if (countdown.total <= 0 && dailyChallengeCompleted && !canPlayDaily) {
      resetDailyChallengeStatus();
    }
  }, [countdown.total, dailyChallengeCompleted, canPlayDaily, resetDailyChallengeStatus]);

  // Récupération des statistiques dans le menu principal - optimisé avec useCallback
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats = await dailyChallengeService.getDailyStats();
      if (stats) {
        setServerStats(stats.server);
      } else {
        setServerStats(null);
      }
    } catch (error) {
      console.error("Échec de récupération des statistiques globales:", error);
      setServerStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isClient && gameMode === 'main-menu') {
      void fetchStats();
    }
  }, [isClient, gameMode, fetchStats]);

  // Écoute des événements clavier - optimisé avec useCallback
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameMode === 'playing') {
      handleKeyInput(event.key);
    }
  }, [gameMode, handleKeyInput]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Écoute des changements d'état du jeu, affiche la boîte de dialogue des résultats - optimisé avec useCallback
  const handleGameEnd = useCallback(() => {
    if (!gameState || (gameState.gameStatus !== 'won' && gameState.gameStatus !== 'lost')) {
      return;
    }

    // Si le défi quotidien est terminé, mise à jour du statut (uniquement lors d'un changement d'état)
    if (isDailyChallenge && !dailyChallengeCompleted) {
      setDailyChallengeCompleted(true);
      setDailyChallengeResult({
        won: gameState.gameStatus === 'won',
        attempts: gameState.currentRow + (gameState.gameStatus === 'won' ? 1 : 0)
      });
      setCanPlayDaily(false);
    }
    
    if (sessionId) {
      const showDialog = () => setShowResultDialog(true);
      
      if (endGameData) {
        showDialog();
      } else {
        const timer = setTimeout(showDialog, 500);
        return () => clearTimeout(timer);
      }
    } else {
      setShowResultDialog(true);
    }
  }, [gameState, endGameData, sessionId, isDailyChallenge, dailyChallengeCompleted]);

  useEffect(() => {
    handleGameEnd();
  }, [handleGameEnd]);

  // Fonctions de rappel pour la boîte de dialogue des résultats
  const handleCloseResultDialog = useCallback(() => {
    setShowResultDialog(false);
  }, []);

  const handleRestartFromDialog = useCallback(() => {
    setShowResultDialog(false);
    void restartGame();
  }, [restartGame]);

  const handleReturnToDifficultyFromDialog = useCallback(() => {
    setShowResultDialog(false);
    returnToDifficultySelection();
  }, [returnToDifficultySelection]);

  // Utilise useMemo pour optimiser les calculs complexes ou les gros objets
  const loadingSpinner = useMemo(() => (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-xl">Chargement en cours...</div>
      </div>
    </div>
  ), []);

  // Utilise useMemo pour optimiser le rendu du sélecteur de difficulté
  const difficultySelectors = useMemo(() => (
    DIFFICULTY_LEVELS.map((level) => {
      const difficultyLevel = wordService.getDifficultyLevels().find(d => d.level === level);
      if (!difficultyLevel) return null;
      
      const isSelected = selectedDifficulty === level;
      
      return (
        <div
          key={level}
          className={`relative rounded-xl transition-all duration-300 ${
            isSelected ? `bg-${difficultyLevel.color.split('-')[1]}-500/10` : 'bg-gray-800/50 hover:bg-gray-700/50'
          }`}
        >
          <div
            onClick={() => handleDifficultySelect(level as Difficulty)}
            className={`w-full h-16 flex items-center px-6 cursor-pointer ${isLoadingWord ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex-1 flex items-center space-x-4">
              <span className={`font-bold text-lg ${difficultyLevel.color}`}>
                {difficultyLevel.name}
              </span>
              <span className="text-gray-400 text-sm">
                {difficultyLevel.description}
              </span>
            </div>
            {isSelected && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void startNewGame();
                  }}
                  disabled={isLoadingWord}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isLoadingWord 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                  }`}
                >
                  Commencer
                </button>
              </div>
            )}
          </div>
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors duration-300 ${
            isSelected ? difficultyLevel.color.replace('text', 'bg') : 'bg-transparent'
          }`}
          />
        </div>
      );
    })
  ), [selectedDifficulty, isLoadingWord, handleDifficultySelect, startNewGame]);

  // Utilise useMemo pour mettre en cache l'état de fin de jeu
  const isGameOver = useMemo(() => 
    gameState?.gameStatus === 'won' || gameState?.gameStatus === 'lost', 
    [gameState?.gameStatus]
  );

  if (!isClient) {
    return loadingSpinner;
  }

  // Mode menu principal
  if (gameMode === 'main-menu') {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Jeu de Mots</h1>
            <p className="text-gray-400">Bienvenue sur Sutom</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Défi quotidien */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4">
                  <span className="text-3xl">🗓️</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Défi Quotidien</h2>
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
                    onClick={startDailyChallenge}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">
                      {isLoadingStats ? '...' : (serverStats?.totalParticipants ?? 0)}
                    </div>
                    <div className="text-xs text-gray-400">Participants</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">
                      {isLoadingStats ? '...' : (serverStats?.averageAttempts?.toFixed(1) ?? '0.0')}
                    </div>
                    <div className="text-xs text-gray-400">Essais Moyens</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">
                      {isLoadingStats ? '...' : (serverStats?.winRate?.toFixed(1) ?? '0.0')}%
                    </div>
                    <div className="text-xs text-gray-400">Taux de Réussite</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Classique */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
                  <span className="text-3xl">🎮</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Mode Classique</h2>
                <p className="text-gray-400 text-sm">
                  Choisissez votre niveau et commencez à jouer !
                </p>
              </div>

              {/* Démarrage rapide */}
              {lastPlayedDifficulty && (
                <div className="text-center mb-8">
                  <button
                    onClick={quickStart}
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
              <div className="space-y-4">
                {difficultySelectors}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jeu en cours mais pas encore chargé
  if (gameMode === 'playing' && !gameState) {
    return loadingSpinner;
  }

  // Si ce n'est pas le mode playing mais qu'il n'y a pas de gameState, état anormal, retour au menu principal
  if (gameMode !== 'playing' && !gameState) {
    console.warn('État anormal, retour au menu principal');
    returnToMainMenu();
    return null;
  }

  // Si gameState est encore null ici, il y a un problème
  if (!gameState) {
    return loadingSpinner;
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-800 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className="flex flex-1 items-center justify-center relative min-h-0">
          <GameGrid
            rows={gameState.rows}
            currentRow={gameState.currentRow}
            wordLength={gameState.targetWord.length}
          />
          <CheckingStatus isChecking={isChecking} />
        </div>
      
        <div className="flex-shrink-0 bg-gray-800 border-gray-700 pb-6">
          <VirtualKeyboard
            onLetterClick={handleVirtualKeyboard}
            onBackspace={() => handleVirtualKeyboard('backspace')}
            onEnter={() => handleVirtualKeyboard('enter')}
            keyboardStates={gameState.keyboardStates}
            disabled={isChecking || isGameOver}
          />
        </div>
      </div>
      
      {gameState && (
        <GameResultDialog
          gameState={gameState}
          isOpen={showResultDialog}
          onClose={handleCloseResultDialog}
          onRestartGame={handleRestartFromDialog}
          onReturnToDifficulty={handleReturnToDifficultyFromDialog}
          isLoadingWord={isLoadingWord}
          getGameStats={getGameStats}
          endGameData={endGameData}
        />
      )}
      
      <ValidationStatus
        isValidating={isValidating}
        validationResult={validationResult}
        onClose={closeValidationResult}
      />
    </div>
  );
};

// Utilise memo pour optimiser les re-rendus du composant
export const Game = memo(GameComponent); 