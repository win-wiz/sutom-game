'use client';

import { useState, useCallback } from 'react';
import { type GameState, type GameRow, AUDIO_FILES } from '@/types/game';
import {
  playAudio,
  sleep,
  isValidLetter,
  normalizeKey,
  isRowComplete,
  isGameWon
} from '@/lib/gameUtils';
import { dictionaryService, type DictionaryValidationResult } from '@/lib/dictionaryService';
import { gameSessionAPI } from '@/services/api';
import type { EndGameData } from '@/types';

const CHECK_DELAY = 270;

// === Wordle双色分配算法 ===
function computeLetterStates(cells: { letter: string }[], targetWord: string): ('found' | 'wrong' | 'not-found')[] {
  const resultStates = Array<'found' | 'wrong' | 'not-found'>(cells.length).fill('not-found');
  const targetArr = targetWord.split('');
  const used = Array(targetArr.length).fill(false);
  
  // Pass 1: marquer found
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const targetChar = targetArr[i];
    if (cell && targetChar && cell.letter === targetChar) {
      resultStates[i] = 'found';
      used[i] = true;
    }
  }
  
  // Pass 2: marquer wrong
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (resultStates[i] === 'found' || !cell) continue;
    const idx = targetArr.findIndex((ch, j) => ch === cell.letter && !used[j]);
    if (idx !== -1) {
      resultStates[i] = 'wrong';
      used[idx] = true;
    }
  }
  
  return resultStates;
}

interface UseGameActionsProps {
  gameState: GameState | null;
  sessionId: string | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  handleGameComplete: (won: boolean, attempts: number, providedEndGameData?: EndGameData | null) => Promise<void>;
}

/**
 * Hook de gestion des opérations de jeu
 * Responsable de la gestion des opérations principales du jeu : ajouter des lettres, supprimer des lettres, vérifier les mots, etc.
 */
export const useGameActions = ({
  gameState,
  sessionId,
  setGameState,
  handleGameComplete
}: UseGameActionsProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DictionaryValidationResult | null>(null);

  // Ajouter une lettre
  const addLetter = useCallback((letter: string) => {
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const normalizedLetter = normalizeKey(letter);
    const currentRow = gameState.rows[gameState.currentRow];
    
    if (!currentRow?.cells) return;

    const emptyCellIndex = currentRow.cells.findIndex(cell => cell.letter === '.');
    if (emptyCellIndex === -1) return;

    setGameState(prev => {
      if (!prev) return prev;
      
      const newRows = [...prev.rows];
      const currentRowData = newRows[prev.currentRow];
      if (!currentRowData?.cells) return prev;
      
      const newCells = [...currentRowData.cells];
      const targetCell = newCells[emptyCellIndex];
      if (!targetCell) return prev;
      
      newCells[emptyCellIndex] = {
        ...targetCell,
        letter: normalizedLetter
      };
      
      const newRow: GameRow = {
        cells: newCells,
        isCompleted: currentRowData.isCompleted
      };
      
      newRows[prev.currentRow] = newRow;
      
      return { ...prev, rows: newRows };
    });
  }, [gameState, isChecking, setGameState]);

  // Supprimer une lettre
  const removeLetter = useCallback(() => {
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const currentRow = gameState.rows[gameState.currentRow];
    if (!currentRow?.cells) return;

    const cellsAfterFirst = currentRow.cells.slice(1);
    let lastFilledIndex = -1;
    
    for (let i = cellsAfterFirst.length - 1; i >= 0; i--) {
      const cell = cellsAfterFirst[i];
      if (cell?.letter !== '.') {
        lastFilledIndex = i;
        break;
      }
    }
    
    if (lastFilledIndex === -1) return;

    const actualIndex = lastFilledIndex + 1;

    setGameState(prev => {
      if (!prev) return prev;
      
      const newRows = [...prev.rows];
      const currentRowData = newRows[prev.currentRow];
      if (!currentRowData?.cells) return prev;
      
      const newCells = [...currentRowData.cells];
      const targetCell = newCells[actualIndex];
      if (!targetCell) return prev;
      
      newCells[actualIndex] = {
        ...targetCell,
        letter: '.'
      };
      
      const newRow: GameRow = {
        cells: newCells,
        isCompleted: currentRowData.isCompleted
      };
      
      newRows[prev.currentRow] = newRow;
      
      return { ...prev, rows: newRows };
    });
  }, [gameState, isChecking, setGameState]);

  // Vérifier le mot
  const checkWord = useCallback(async () => {
    console.log('🎮 checkWord appelé');
    console.log('🎮 État actuel du jeu:', { gameState: !!gameState, isChecking, gameStatus: gameState?.gameStatus });
    console.log('🎮 sessionId actuel:', sessionId);
    
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    const currentRow = gameState.rows[gameState.currentRow];
    if (!currentRow || !isRowComplete(currentRow.cells)) return;

    setIsChecking(true);

    try {
      const currentWord = currentRow.cells.map(cell => cell.letter).join('');
      console.log('🎮 Prêt à vérifier le mot:', currentWord);
      
      const newCells = [...currentRow.cells];
      const newKeyboardStates = { ...gameState.keyboardStates };

      // Si sessionId existe, utiliser la validation API ; sinon effectuer la validation du dictionnaire
      if (sessionId) {
        console.log('🎮 sessionId présent, ignorer la validation du dictionnaire, appeler directement l\'API');
        try {
          console.log('🎮 Soumettre la supposition à l\'API:', { sessionId, guess: currentWord });
          const response = await gameSessionAPI.submitGuess({
            sessionId,
            guess: currentWord
          });
          
          console.log('🎮 Réponse de l\'API:', response);
          
          if (response.success && response.data) {
            const { letterAnalysis, isCompleted, isWon: apiIsWon, wordStats } = response.data;
            
            // Utiliser les résultats d'analyse des lettres retournés par l'API
            for (let i = 0; i < letterAnalysis.length; i++) {
              await sleep(CHECK_DELAY);
              const analysis = letterAnalysis[i];
              const cell = newCells[i];
              if (analysis && cell) {
                const state = analysis.status === 'correct' ? 'found' : 
                            analysis.status === 'wrong-position' ? 'wrong' : 'not-found';
                newCells[i] = { ...cell, state };
                newKeyboardStates[analysis.letter] = state;
                
                switch (state) {
                  case 'found': playAudio(AUDIO_FILES.found); break;
                  case 'wrong': playAudio(AUDIO_FILES.wrong); break;
                  case 'not-found': playAudio(AUDIO_FILES.notFound); break;
                }
              }
            }
            
            // 更新游戏状态
            setGameState(prev => {
              if (!prev) return prev;
              
              const newRows = [...prev.rows];
              const targetRow = newRows[prev.currentRow];
              if (!targetRow) return prev;
              
              newRows[prev.currentRow] = {
                cells: newCells,
                isCompleted: true
              };
              
              let newGameStatus = prev.gameStatus;
              let newCurrentRow = prev.currentRow;
              
              if (isCompleted) {
                newGameStatus = apiIsWon ? 'won' : 'lost';
                if (apiIsWon) {
                  playAudio(AUDIO_FILES.win);
                }
                // 游戏结束时不需要更新currentRow
              } else {
                newCurrentRow = prev.currentRow + 1;
                // 检查是否已达到最大尝试次数（6次）
                if (newCurrentRow >= 6) {
                  newGameStatus = 'lost';
                  // 注意：这里不设置isCompleted为true，因为API会在下一次调用时返回isCompleted
                }
              }
              
              return {
                ...prev,
                rows: newRows,
                currentRow: newCurrentRow,
                gameStatus: newGameStatus,
                keyboardStates: newKeyboardStates
              };
            });
            
            // Si le jeu est terminé, appeler l'API endGame pour obtenir les statistiques complètes
            if (isCompleted) {
              try {
                const endGameResponse = await gameSessionAPI.endGame(sessionId);
                if (endGameResponse.success && endGameResponse.data) {
                  void handleGameComplete(apiIsWon, response.data.attempts, endGameResponse.data);
                } else {
                  // Si l'API endGame échoue, utiliser les données obtenues de l'API guess
                  if (response.data.correctAnswer && wordStats) {
                    const endGameData: EndGameData = {
                      sessionId,
                      isWon: apiIsWon,
                      attempts: response.data.attempts,
                      gameTime: response.data.gameTime ?? 0,
                      wordInfo: {
                        word: response.data.correctAnswer,
                        difficulty: gameState.difficulty ?? 'medium',
                        length: response.data.correctAnswer.length,
                        definition: 'Mot obtenu de l\'API',
                        category: 'Jeu en ligne'
                      },
                      wordStats: {
                        totalAttempts: wordStats.totalAttempts,
                        totalSuccesses: wordStats.totalSuccesses,
                        successRate: wordStats.successRate,
                        averageAttempts: wordStats.averageAttemptsToWin ?? wordStats.totalAttempts,
                        averageGameTime: wordStats.averageGameTime,
                        perceivedDifficulty: wordStats.perceivedDifficulty,
                        sampleSize: wordStats.sampleSize,
                        lastPlayedAt: wordStats.lastPlayed ?? new Date().toISOString()
                      }
                    };
                    void handleGameComplete(apiIsWon, response.data.attempts, endGameData);
                  } else {
                    void handleGameComplete(apiIsWon, response.data.attempts);
                  }
                }
              } catch (endGameError) {
                console.warn('Échec de l\'appel à l\'API endGame:', endGameError);
                // Si l'API endGame échoue, utiliser les données obtenues de l'API guess
                if (response.data.correctAnswer && wordStats) {
                  const endGameData: EndGameData = {
                    sessionId,
                    isWon: apiIsWon,
                    attempts: response.data.attempts,
                    gameTime: response.data.gameTime ?? 0,
                    wordInfo: {
                      word: response.data.correctAnswer,
                      difficulty: gameState.difficulty ?? 'medium',
                      length: response.data.correctAnswer.length,
                      definition: 'Mot obtenu de l\'API',
                      category: 'Jeu en ligne'
                    },
                    wordStats: {
                      totalAttempts: wordStats.totalAttempts,
                      totalSuccesses: wordStats.totalSuccesses,
                      successRate: wordStats.successRate,
                      averageAttempts: wordStats.averageAttemptsToWin ?? wordStats.totalAttempts,
                      averageGameTime: wordStats.averageGameTime,
                      perceivedDifficulty: wordStats.perceivedDifficulty,
                      sampleSize: wordStats.sampleSize,
                      lastPlayedAt: wordStats.lastPlayed ?? new Date().toISOString()
                    }
                  };
                  void handleGameComplete(apiIsWon, response.data.attempts, endGameData);
                } else {
                  void handleGameComplete(apiIsWon, response.data.attempts);
                }
              }
            } else {
              // 检查是否在非API完成状态下达到了最大尝试次数
              const currentAttempt = gameState.currentRow + 1;
              if (currentAttempt >= 6) {
                // 达到最大尝试次数，游戏失败
                console.log('🎮 达到最大尝试次数，游戏失败');
                void handleGameComplete(false, 6);
              }
            }
          } else {
            throw new Error('Échec de retour de l\'API');
          }
        } catch (error) {
          console.warn('Échec de soumission de la supposition à l\'API, utilisation de la validation locale:', error);
          // Si l'API échoue, revenir à la validation locale
          await performLocalValidation();
        }
      } else {
        // Pas de sessionId, utiliser la validation locale, nécessite d'abord la validation du dictionnaire
        console.log('🎮 本地模式，先进行词典验证');
        setIsValidating(true);
        const result = await dictionaryService.validateWord(currentWord);
        setIsValidating(false);
        
        console.log('🎮 词典验证结果:', result);
        
        if (!result.isValid) {
          console.log('🎮 词典验证失败，显示错误消息');
          setValidationResult(result);
          setIsChecking(false);
          return;
        }
        
        await performLocalValidation();
      }
      
      // Fonction de validation locale
      async function performLocalValidation() {
        if (!gameState) return;
        
        const states = computeLetterStates(newCells, gameState.targetWord);
        for (let i = 0; i < newCells.length; i++) {
          await sleep(CHECK_DELAY);
          const cell = newCells[i];
          const state = states[i];
          if (cell && state) {
            newCells[i] = { ...cell, state };
            const cellLetter = cell.letter;
            newKeyboardStates[cellLetter] = state;
            
            switch (state) {
              case 'found': playAudio(AUDIO_FILES.found); break;
              case 'wrong': playAudio(AUDIO_FILES.wrong); break;
              case 'not-found': playAudio(AUDIO_FILES.notFound); break;
            }
          }
        }

        // Vérifier si c'est gagné
        const isWon = isGameWon(newCells, gameState.targetWord);
        
        setGameState(prev => {
          if (!prev) return prev;
          
          const newRows = [...prev.rows];
          const targetRow = newRows[prev.currentRow];
          if (!targetRow) return prev;
          
          newRows[prev.currentRow] = {
            cells: newCells,
            isCompleted: true
          };
          
          let newGameStatus = prev.gameStatus;
          let newCurrentRow = prev.currentRow;
          
          if (isWon) {
            newGameStatus = 'won';
            playAudio(AUDIO_FILES.win);
            void handleGameComplete(true, prev.currentRow + 1);
          } else {
            newCurrentRow = prev.currentRow + 1;
            
            if (newCurrentRow >= 6) {
              newGameStatus = 'lost';
              void handleGameComplete(false, 6);
            }
          }
          
          return {
            ...prev,
            rows: newRows,
            currentRow: newCurrentRow,
            gameStatus: newGameStatus,
            keyboardStates: newKeyboardStates
          };
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, [gameState, isChecking, handleGameComplete, sessionId, setGameState]);

  // Logique simplifiée de saisie clavier et de jeu
  const handleKeyInput = useCallback((key: string) => {
    console.log('🎮 handleKeyInput 被调用:', key);
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    if (key === 'Enter') {
      console.log('🎮 Enter键被按下，调用 checkWord');
      void checkWord();
    } else if (key === 'Backspace') {
      removeLetter();
    } else if (isValidLetter(key)) {
      addLetter(key);
    }
  }, [gameState, isChecking, checkWord, removeLetter, addLetter]);

  const handleVirtualKeyboard = useCallback((action: string) => {
    console.log('🎮 handleVirtualKeyboard 被调用:', action);
    if (!gameState || isChecking || gameState.gameStatus !== 'playing') return;

    if (action === 'enter') {
      console.log('🎮 虚拟键盘 Enter 被点击，调用 checkWord');
      void checkWord();
    } else if (action === 'backspace') {
      removeLetter();
    } else {
      addLetter(action);
    }
  }, [gameState, isChecking, checkWord, removeLetter, addLetter]);

  const closeValidationResult = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    // États
    isChecking,
    isValidating,
    validationResult,
    
    // Fonctions d'opération
    addLetter,
    removeLetter,
    checkWord,
    handleKeyInput,
    handleVirtualKeyboard,
    closeValidationResult
  };
};