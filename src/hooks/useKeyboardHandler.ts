'use client';

import { useEffect, useCallback } from 'react';

interface UseKeyboardHandlerProps {
  gameMode: string;
  handleKeyInput: (key: string) => void;
}

export const useKeyboardHandler = ({ gameMode, handleKeyInput }: UseKeyboardHandlerProps) => {
  // Gérer les événements de pression de touches
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

  return { handleKeyDown };
};