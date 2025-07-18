'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import Image from "next/image";
import logo from "@/../public/favicon.png";

const Header = () => {
  const { 
    gameState, 
    gameMode,
    isDailyChallenge,
    isLoadingWord,
    restartGame,
    returnToDifficultySelection
  } = useGame();

  // Mémoriser les informations de difficulté pour éviter les recalculs
  const difficultyInfo = useMemo(() => {
    if (!gameState || isDailyChallenge || !gameState.difficulty) return null;
    
    const difficultyMap = {
      easy: { label: 'Débutant', className: 'bg-green-500/20 text-green-400' },
      medium: { label: 'Intermédiaire', className: 'bg-yellow-500/20 text-yellow-400' },
      hard: { label: 'Avancé', className: 'bg-red-500/20 text-red-400' }
    } as const;
    
    return difficultyMap[gameState.difficulty] || null;
  }, [gameState?.difficulty, isDailyChallenge]);

  // Mémoriser les textes des boutons
  const buttonTexts = useMemo(() => ({
    restart: isLoadingWord ? 'Chargement...' : 'Recommencer',
    return: isDailyChallenge ? 'Retour au défi' : 'Menu principal'
  }), [isLoadingWord, isDailyChallenge]);

  // Optimiser les gestionnaires d'événements avec useCallback
  const handleRestart = useCallback(() => {
    if (!isLoadingWord) {
      restartGame();
    }
  }, [isLoadingWord, restartGame]);

  const handleReturn = useCallback(() => {
    returnToDifficultySelection();
  }, [returnToDifficultySelection]);

  // 滚动到帮助中心的函数
  const scrollToHelpCenter = useCallback(() => {
    const helpElement = document.querySelector('[data-help-center]');
    if (helpElement) {
      helpElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  return (
    <header className={`sticky top-0 z-10 w-full border-b border-gray-700/50 bg-gray-800 h-16`}>
      <div className={`container mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16`}>
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src={logo} 
              alt="logo" 
              width={32} 
              height={32} 
              className="opacity-90" 
            />
            <span className={`font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-2xl`}>Sutom</span>
          </Link>

          {/* Informations du jeu - affiché uniquement en mode jeu avec layout optimisé */}
          {gameMode === 'playing' && gameState && (
            <div className="flex items-center space-x-2 ml-3">
              {isDailyChallenge ? (
                <div className="flex items-center space-x-1">
                  <span className="text-purple-400 text-sm">📅</span>
                  <span className="text-purple-400 font-medium text-sm hidden sm:inline">Défi quotidien</span>
                  <span className="text-purple-400 font-medium text-sm sm:hidden">Défi</span>
                </div>
              ) : (
                <>
                  {difficultyInfo && (
                    <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${difficultyInfo.className} hidden sm:block`}>
                      {difficultyInfo.label}
                    </div>
                  )}
                  <div className="text-gray-400 text-xs">
                    {gameState.currentRow}/6
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Boutons de contrôle - différents selon le mode */}
        <div className={`flex items-center ${
          gameMode === 'playing' ? 'space-x-1.5' : 'space-x-3'
        }`}>
          {/* Icône d'aide - affiché uniquement en mode main-menu */}
          {gameMode === 'main-menu' && (
            <button
              onClick={scrollToHelpCenter}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-300"
              aria-label="Aller au centre d'aide"
              title="Centre d'aide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
          
          {/* Boutons de contrôle du jeu - affiché uniquement en mode jeu avec layout optimisé */}
          {gameMode === 'playing' && gameState && (
            <>
              <button
                onClick={handleRestart}
                disabled={isLoadingWord}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-300
                  ${isLoadingWord 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                title={buttonTexts.restart}
              >
                <span className="hidden sm:inline">{buttonTexts.restart}</span>
                <span className="sm:hidden">🔄</span>
              </button>
              
              <button
                onClick={handleReturn}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs font-medium transition-colors duration-300"
                title={buttonTexts.return}
              >
                <span className="hidden sm:inline">{buttonTexts.return}</span>
                <span className="sm:hidden">🏠</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;