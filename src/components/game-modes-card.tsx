'use client';

import { Calendar, Gamepad2 } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { wordService } from '@/lib/wordService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Difficulty } from '@/types/game';

interface GameModesCardProps {
  selectedDifficulty: Difficulty | null;
  isLoadingWord: boolean;
  onDifficultySelect: (difficulty: Difficulty) => void;
  onStartClassic: () => void;
  onStartChallenge: () => void;
}

export const GameModesCard = ({
  selectedDifficulty,
  isLoadingWord,
  onDifficultySelect,
  onStartClassic,
  onStartChallenge,
}: GameModesCardProps) => {
  // Cache difficulty levels to avoid repeated calls
  const difficultyLevels = useMemo(() => wordService.getDifficultyLevels(), []);

  // Cache button styles to avoid recalculation
  const buttonStyles = useMemo(() => ({
    enabled: 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 shadow-lg hover:shadow-green-600/40',
    disabled: 'bg-gray-700 text-gray-400 cursor-not-allowed'
  }), []);

  const DailyChallengeContent = useCallback(() => (
    <div className="text-center py-8">
      <div
        onClick={onStartChallenge}
        className="group relative cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-800/50 rounded-lg p-8 transition-all duration-300"
      >
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
            Commencer le défi du jour
          </h3>
          <p className="text-gray-400 mt-2">
            Défiez le mot aléatoire d'aujourd'hui, une seule chance !
          </p>
        </div>
      </div>
    </div>
  ), [onStartChallenge]);

  const ClassicModeContent = useCallback(() => (
    <div className="flex flex-col h-full p-1">
      <div className="mb-6 text-center">
        <p className="text-gray-400">
          Choisissez votre difficulté préférée pour commencer une nouvelle partie.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {difficultyLevels.map((level) => {
          const isSelected = selectedDifficulty === level.level;
          return (
            <div
              key={level.level}
              onClick={() => onDifficultySelect(level.level)}
              className={`relative cursor-pointer p-5 rounded-lg border-2 transition-all duration-200 h-full flex flex-col justify-between ${isSelected ? 'border-blue-500 bg-blue-900/50 shadow-lg scale-105' : 'border-gray-600 bg-gray-800 hover:border-blue-500/50 hover:bg-gray-700/50'}`}
            >
              {isSelected && (
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
              <div className="text-center">
                <h3 className={`text-xl font-bold mb-2 ${level.color}`}>{level.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{level.description}</p>
              </div>
              <div className="flex justify-center space-x-1.5 mt-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 mx-1 rounded-full ${i < (level.level === 'easy' ? 1 : level.level === 'medium' ? 2 : 3) ? level.color.replace('text-', 'bg-') : 'bg-gray-600'}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onStartClassic}
        disabled={!selectedDifficulty || isLoadingWord}
        className={`w-full py-3 mt-auto rounded-lg font-semibold text-xl transition-all duration-300 transform ${selectedDifficulty && !isLoadingWord ? buttonStyles.enabled : buttonStyles.disabled}`}
      >
        {isLoadingWord ? (<div className="flex items-center justify-center space-x-2"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Chargement...</span></div>) : ('Commencer le jeu')}
      </button>
    </div>
  ), [difficultyLevels, selectedDifficulty, isLoadingWord, onDifficultySelect, onStartClassic, buttonStyles]);

  return (
    <div className="bg-gray-800/70 rounded-xl p-6 sm:p-8 border border-gray-700 shadow-md h-full">
       <Tabs defaultValue="challenge" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenge">
            <Calendar className="w-5 h-5 mr-2" />
            Défi quotidien
          </TabsTrigger>
          <TabsTrigger value="classic">
            <Gamepad2 className="w-5 h-5 mr-2" />
            Mode classique
          </TabsTrigger>
        </TabsList>
        <TabsContent value="challenge">
          <DailyChallengeContent />
        </TabsContent>
        <TabsContent value="classic">
          <ClassicModeContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};