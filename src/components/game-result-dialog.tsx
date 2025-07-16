'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

// Fonction de statistiques par défaut
const defaultGetGameStats = async (): Promise<FullGameStats | null> => {
  console.warn('Fonction getGameStats non fournie, utilisation de l\'implémentation par défaut');
  return null;
};

// Constantes pour les styles et textes
const DIFFICULTY_CONFIG = {
  easy: { label: 'Facile', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  medium: { label: 'Moyen', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  hard: { label: 'Difficile', color: 'bg-red-500/10 text-red-400 border border-red-500/20' }
} as const;

const LOADING_STATS_ITEMS = [
  'Total des parties',
  'Taux de victoire',
  'Tentatives moyennes',
  'Temps moyen'
] as const;

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

  // Mémorisation des états de jeu
  const gameStatus = useMemo(() => ({
    isWon: gameState.gameStatus === 'won',
    isLost: gameState.gameStatus === 'lost'
  }), [gameState.gameStatus]);

  // Mémorisation de la configuration de difficulté
  const difficultyConfig = useMemo(() => {
    const difficulty = gameState.difficulty as keyof typeof DIFFICULTY_CONFIG;
    return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  }, [gameState.difficulty]);

  // Mémorisation des statistiques de progression
  const progressStats = useMemo(() => ({
    attempts: gameState.currentRow + 1,
    maxAttempts: 6,
    successRate: gameStatus.isWon ? 100 : 0
  }), [gameState.currentRow, gameStatus.isWon]);

  // Récupération des statistiques lors de l'ouverture du dialogue
  useEffect(() => {
    if (isOpen && (gameStatus.isWon || gameStatus.isLost)) {
      if (typeof getGameStats !== 'function') {
        console.warn('getGameStats n\'est pas une fonction:', getGameStats);
        return;
      }
      setIsLoadingStats(true);
      getGameStats()
        .then((stats) => {
          if (stats?.overall) {
            setGameStats(stats.overall);
          } else {
            // Fallback pour structure inattendue
            setGameStats(null);
          }
        })
        .catch((error) => {
          console.warn('Échec de récupération des statistiques:', error);
          setGameStats(null);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    }
  }, [isOpen, gameStatus.isWon, gameStatus.isLost, getGameStats]);

  // Fonction utilitaire pour formater les nombres
  const formatNumber = useCallback((value: number | string | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined) return '0.0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  }, []);

  // Rendu conditionnel optimisé
  if (!gameStatus.isWon && !gameStatus.isLost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-none text-white p-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        {/* Zone de titre en haut */}
        <DialogHeader className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 pb-3 z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              <span className="text-2xl animate-bounce">{gameStatus.isWon ? '🎉' : '😞'}</span>
            </div>
            <DialogTitle className={`text-xl font-bold ${
              gameStatus.isWon ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
            } text-transparent bg-clip-text`}>
              {gameStatus.isWon ? 'Félicitations, vous avez gagné !' : 'Partie terminée'}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm">
              {gameStatus.isWon ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span>Mot trouvé avec succès :</span>
                  <span className="font-mono font-bold text-base px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                    {gameState.targetWord}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <span>La bonne réponse était :</span>
                  <span className="font-mono font-bold text-base px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                    {gameState.targetWord}
                  </span>
                </span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Zone des cartes de données de jeu */}
        <div className="space-y-3 py-3">
          {/* Carte d'informations sur le mot */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 text-lg">📝</span>
                  <h3 className="text-indigo-400 font-medium">Détails du mot</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
                  {difficultyConfig.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">Mot</div>
                  <div className="text-lg font-mono font-semibold text-white">{gameState.targetWord}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">Longueur</div>
                  <div className="text-lg font-mono font-semibold text-blue-400">{gameState.targetWord.length} lettres</div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte des statistiques de cette partie */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 text-lg">📊</span>
                <h3 className="text-emerald-400 font-medium">Statistiques de cette partie</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">Tentatives</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-mono font-semibold text-emerald-400">{progressStats.attempts}</span>
                    <span className="text-gray-500 text-sm">/</span>
                    <span className="text-gray-400 text-sm">{progressStats.maxAttempts}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: progressStats.maxAttempts }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full flex-1 ${
                          i < progressStats.attempts
                            ? 'bg-emerald-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-gray-400 text-sm mb-1">Taux de réussite</div>
                  <div className="text-lg font-mono font-semibold text-emerald-400">
                    {progressStats.successRate}%
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-1 bg-emerald-500 rounded-full"
                      style={{ width: `${progressStats.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte des statistiques globales */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-900/90 rounded-lg p-4 border border-purple-500/20 min-h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-400 text-lg">🏆</span>
                <h3 className="text-purple-400 font-medium">Statistiques globales</h3>
              </div>
              {isLoadingStats ? (
                <div className="grid grid-cols-2 gap-3">
                  {LOADING_STATS_ITEMS.map((label, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="text-gray-400 text-sm mb-1">
                        {label}
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
                    <div className="text-gray-400 text-sm mb-1">Total des parties</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {gameStats.totalSessions}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">Taux de victoire</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.winRate * 100, 1)}%
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">Tentatives moyennes</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.averageAttempts)} fois
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">Temps moyen</div>
                    <div className="text-lg font-mono font-semibold text-purple-400">
                      {formatNumber(gameStats.averageGameTime, 0)} sec
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {LOADING_STATS_ITEMS.map((label, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="text-gray-400 text-sm mb-1">
                        {label}
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

        {/* Zone des boutons en bas */}
        <DialogFooter className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-gray-900/95 pt-3 z-10 flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-3">
          <button
            onClick={onRestartGame}
            disabled={isLoadingWord}
            className={`w-full sm:w-1/2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${gameStatus.isWon 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/30' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoadingWord ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Chargement...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {gameStatus.isWon ? '🎮 Rejouer' : '🔄 Nouveau défi'}
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
              🏠 Retour au menu
            </span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};