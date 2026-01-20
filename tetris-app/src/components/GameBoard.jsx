import { useMemo, memo } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } from '../constants/tetrominos';
import './GameBoard.css';

// Memoized grid cell to prevent re-renders
const GridCell = memo(function GridCell() {
  return (
    <div
      className="grid-cell"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    />
  );
});

// Pre-generate grid rows
const GridBackground = memo(function GridBackground() {
  return (
    <div className="grid-background">
      {Array.from({ length: BOARD_HEIGHT }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {Array.from({ length: BOARD_WIDTH }).map((_, colIndex) => (
            <GridCell key={colIndex} />
          ))}
        </div>
      ))}
    </div>
  );
});

export const GameBoard = memo(function GameBoard({ board, currentPiece, position, clearedRows, particles }) {
  // Merge current piece with board for display
  const displayBoard = useMemo(() => {
    const display = board.map((row) => row.map((cell) => ({ ...cell })));

    if (currentPiece) {
      // Calculate ghost piece position
      let ghostY = position.y;
      outer: while (true) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
          for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
              const newX = position.x + c;
              const newY = ghostY + 1 + r;
              if (newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX].filled)) {
                break outer;
              }
            }
          }
        }
        ghostY++;
      }

      // Draw ghost piece
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const y = ghostY + r;
            const x = position.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !display[y][x].filled) {
              display[y][x] = { ghost: true, color: currentPiece.color };
            }
          }
        }
      }

      // Draw current piece
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const y = position.y + r;
            const x = position.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              display[y][x] = { filled: true, color: currentPiece.color, current: true };
            }
          }
        }
      }
    }

    return display;
  }, [board, currentPiece, position]);

  // Flatten cells for rendering
  const cells = useMemo(() => {
    const result = [];
    for (let rowIndex = 0; rowIndex < BOARD_HEIGHT; rowIndex++) {
      const isClearing = clearedRows.includes(rowIndex);
      for (let colIndex = 0; colIndex < BOARD_WIDTH; colIndex++) {
        const cell = displayBoard[rowIndex][colIndex];
        if (cell.filled || cell.ghost) {
          result.push({
            key: `${rowIndex}-${colIndex}`,
            rowIndex,
            colIndex,
            cell,
            isClearing,
          });
        }
      }
    }
    return result;
  }, [displayBoard, clearedRows]);

  return (
    <div className="game-board-container">
      <div
        className="game-board"
        style={{
          width: BOARD_WIDTH * CELL_SIZE,
          height: BOARD_HEIGHT * CELL_SIZE,
        }}
      >
        <GridBackground />

        {/* Filled cells - no box-shadow for performance */}
        {cells.map(({ key, rowIndex, colIndex, cell, isClearing }) => (
          <div
            key={key}
            className={`cell ${cell.filled ? 'filled' : ''} ${cell.ghost ? 'ghost' : ''} ${
              cell.current ? 'current' : ''
            } ${isClearing ? 'clearing' : ''}`}
            style={{
              left: colIndex * CELL_SIZE,
              top: rowIndex * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: cell.ghost ? 'transparent' : cell.color,
              borderColor: cell.color,
            }}
          />
        ))}

        {/* Particles - simplified, no box-shadow */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
            }}
          />
        ))}
      </div>
    </div>
  );
});
