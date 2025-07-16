import { type GameGridProps, type LetterState } from '@/types/game';

const getLetterStateClasses = (state: LetterState): string => {
  switch (state) {
    case 'found':
      return 'bg-red-600'; // #e7002a
    case 'wrong':
      return 'bg-yellow-500'; // #ffbd00
    case 'not-found':
      return 'bg-gray-500'; // #707070
    default:
      return 'bg-blue-600'; // #0077c7
  }
};

const GameCell = ({ letter, state }: { letter: string; state: LetterState }) => {
  return (
    <div
      className={`
        flex items-center justify-center
        border border-white
        text-white text-lg font-bold uppercase
        transition-colors duration-300
        w-[6vw] h-[6vw] md:w-16 md:h-16
        ${getLetterStateClasses(state)}
      `}
      // style={{
      //   width: '5vw', 
      //   height: '5vw',
      //   minWidth: '42px',
      //   minHeight: '42px',
      //   maxWidth: '68px',
      //   maxHeight: '68px',
      //   fontSize: 'calc(5vw - 1.2vw)'
      // }}
    >
      {letter === '.' ? '' : letter}
    </div>
  );
};

export const GameGrid = ({ rows }: GameGridProps) => {
  return (
    <div className="flex flex-col items-center space-y-0.5">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-0.5">
          {row.cells.map((cell, cellIndex) => (
            <GameCell
              key={`${rowIndex}-${cellIndex}`}
              letter={cell.letter}
              state={cell.state}
            />
          ))}
        </div>
      ))}
    </div>
  );
};