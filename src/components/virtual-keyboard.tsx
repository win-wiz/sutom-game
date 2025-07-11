import { type VirtualKeyboardProps, type LetterState, FRENCH_KEYBOARD_LAYOUT } from '@/types/game';

const getKeyboardLetterClasses = (state: LetterState): string => {
  switch (state) {
    case 'found':
      return 'bg-red-600 text-white border-white'; // #e7002a
    case 'wrong':
      return 'bg-yellow-500 text-white border-white'; // #ffbd00
    case 'not-found':
      return 'bg-gray-500 text-white border-white'; // #707070
    default:
      return 'bg-transparent text-white border-white hover:bg-white hover:text-gray-800';
  }
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
  const isSpecialKey = letter === 'backspace' || letter === 'enter';
  const displayText = letter === 'backspace' ? '⌫' : letter === 'enter' ? '↲' : letter.toUpperCase();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        border border-white rounded-md
        font-medium text-sm
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getKeyboardLetterClasses(state)}
        ${isSpecialKey ? 'flex-1 min-w-[60px] max-w-[80px]' : 'flex-1 min-w-[32px] max-w-[44px]'}
      `}
      style={{
        height: '40px',
        margin: '1px'
      }}
    >
      {displayText}
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
  const handleKeyClick = (key: string) => {
    if (disabled) return;
    
    if (key === 'enter') {
      onEnter();
    } else if (key === 'backspace') {
      onBackspace();
    } else {
      onLetterClick(key);
    }
  };

  // 获取每行的缩进样式
  const getRowIndentClass = (rowIndex: number, rowLength: number) => {
    // 第一行和第二行（10个按键）- 无缩进
    if (rowIndex === 0 || rowIndex === 1) return '';
    
    // 第三行（6个按键）- 增加缩进
    if (rowIndex === 2) return 'pl-8 pr-8';
    
    // 第四行（10个按键，包含特殊键）- 无缩进
    if (rowIndex === 3) return '';
    
    // 第五行（6个按键）- 增加缩进
    if (rowIndex === 4) return 'pl-8 pr-8';
    
    return '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 pb-4">
      <div className="flex flex-col space-y-1.5">
        {FRENCH_KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex justify-center space-x-1 ${getRowIndentClass(rowIndex, row.length)}`}
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