import { useMemo, useCallback } from 'react';
import { type VirtualKeyboardProps, type LetterState, FRENCH_KEYBOARD_LAYOUT } from '@/types/game';

// Mémoriser les classes CSS pour éviter les recalculs
const KEYBOARD_LETTER_CLASSES = {
  found: 'bg-red-600 text-white border-white', // #e7002a
  wrong: 'bg-yellow-500 text-white border-white', // #ffbd00
  'not-found': 'bg-gray-500 text-white border-white', // #707070
  default: 'bg-transparent text-white border-white hover:bg-white hover:text-gray-800'
} as const;

const getKeyboardLetterClasses = (state: LetterState): string => {
  return KEYBOARD_LETTER_CLASSES[state] || KEYBOARD_LETTER_CLASSES.default;
};

const KeyboardLetter = ({ 
  letter, 
  state, 
  onClick, 
  disabled 
}: { 
  letter: string; 
  state: LetterState; 
  onClick: () => void; 
  disabled?: boolean;
}) => {
  // Mémoriser les propriétés de la touche pour éviter les recalculs
  const keyProps = useMemo(() => {
    const isSpecialKey = letter === 'backspace' || letter === 'enter';
    const displayText = letter === 'backspace' ? '⌫' : letter === 'enter' ? '↲' : letter.toUpperCase();
    const sizeClass = isSpecialKey ? 'flex-1 min-w-[60px] max-w-[80px]' : 'flex-1 min-w-[32px] max-w-[44px]';
    
    return {
      displayText,
      sizeClass,
      className: `
        flex items-center justify-center
        border border-white rounded-md
        font-medium text-sm
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getKeyboardLetterClasses(state)}
        ${sizeClass}
      `
    };
  }, [letter, state]);

  // Optimiser le gestionnaire de clic avec useCallback
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={keyProps.className}
      style={{
        height: '40px',
        margin: '1px'
      }}
    >
      {keyProps.displayText}
    </button>
  );
};

export const VirtualKeyboard = ({ 
  onLetterClick, 
  onBackspace, 
  onEnter, 
  keyboardStates, 
  disabled = false 
}: VirtualKeyboardProps) => {
  // Optimiser le gestionnaire de clic avec useCallback
  const handleKeyClick = useCallback((key: string) => {
    if (disabled) return;
    
    if (key === 'enter') {
      onEnter();
    } else if (key === 'backspace') {
      onBackspace();
    } else {
      onLetterClick(key);
    }
  }, [disabled, onEnter, onBackspace, onLetterClick]);

  // Mémoriser les classes d'indentation pour chaque ligne
  const rowIndentClasses = useMemo(() => {
    return FRENCH_KEYBOARD_LAYOUT.map((_, rowIndex) => {
      // Première et deuxième lignes (10 touches) - pas d'indentation
      if (rowIndex === 0 || rowIndex === 1) return '';
      
      // Troisième ligne (6 touches) - ajouter une indentation
      if (rowIndex === 2) return 'pl-8 pr-8';
      
      // Quatrième ligne (10 touches, y compris les touches spéciales) - pas d'indentation
      if (rowIndex === 3) return '';
      
      // Cinquième ligne (6 touches) - ajouter une indentation
      if (rowIndex === 4) return 'pl-8 pr-8';
      
      return '';
    });
  }, []);

  // Mémoriser les données du clavier pour éviter les recalculs
  const keyboardData = useMemo(() => {
    return FRENCH_KEYBOARD_LAYOUT.map((row, rowIndex) => ({
      row,
      rowIndex,
      indentClass: rowIndentClasses[rowIndex]
    }));
  }, [rowIndentClasses]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 pb-4">
      <div className="flex flex-col space-y-1.5">
        {keyboardData.map(({ row, rowIndex, indentClass }) => (
          <div 
            key={rowIndex} 
            className={`flex justify-center space-x-1 ${indentClass}`}
          >
            {row.map((key) => (
              <KeyboardLetter
                key={key}
                letter={key}
                state={keyboardStates[key] ?? 'default'}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};