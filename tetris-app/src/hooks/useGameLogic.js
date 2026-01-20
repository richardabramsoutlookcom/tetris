import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TETROMINOS,
  TETROMINO_TYPES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LEVEL_SPEEDS,
  LINES_PER_LEVEL,
  POINTS,
} from '../constants/tetrominos';

// Create empty board
const createBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: null }))
  );

// Get random tetromino
const getRandomTetromino = () => {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return { type, ...TETROMINOS[type] };
};

// Rotate matrix 90 degrees clockwise
const rotateMatrixCW = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

// Rotate matrix 90 degrees counter-clockwise
const rotateMatrixCCW = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[cols - 1 - c][r] = matrix[r][c];
    }
  }
  return rotated;
};

// Check if position is valid
const isValidPosition = (board, shape, position) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newX = position.x + c;
        const newY = position.y + r;

        // Check bounds
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with placed pieces (only if on board)
        if (newY >= 0 && board[newY][newX].filled) {
          return false;
        }
      }
    }
  }
  return true;
};

// Merge piece into board - returns { board, isAboveBoard } to detect game over
const mergePieceToBoard = (board, piece, position) => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  let isAboveBoard = false;

  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const y = position.y + r;
        const x = position.x + c;
        if (y < 0) {
          // Part of the piece is above the visible board
          isAboveBoard = true;
        } else if (y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = { filled: true, color: piece.color };
        }
      }
    }
  }
  return { board: newBoard, isAboveBoard };
};

// Clear completed lines and return new board + cleared lines info
const clearLines = (board) => {
  const clearedRows = [];
  const newBoard = board.filter((row, index) => {
    const isFull = row.every((cell) => cell.filled);
    if (isFull) clearedRows.push(index);
    return !isFull;
  });

  const linesCleared = BOARD_HEIGHT - newBoard.length;

  // Add empty rows at top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(
      Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: null }))
    );
  }

  return { newBoard, linesCleared, clearedRows };
};

export function useGameLogic(sound) {
  const [board, setBoard] = useState(createBoard);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clearedRows, setClearedRows] = useState([]);
  const [particles, setParticles] = useState([]);
  const [heldPiece, setHeldPiece] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const dropInterval = useRef(null);
  const lastLevel = useRef(1);

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const piece = nextPiece || getRandomTetromino();
    const next = getRandomTetromino();

    const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
    const startY = -1; // Start above the visible board

    // Check if spawn position has immediate collision at y=0 (top of visible board)
    // This only triggers if the board is completely full at the spawn point
    if (!isValidPosition(board, piece.shape, { x: startX, y: 0 })) {
      setGameOver(true);
      setIsPlaying(false);
      sound.gameOver();
      return;
    }

    setCurrentPiece(piece);
    setNextPiece(next);
    setPosition({ x: startX, y: startY });
    setCanHold(true); // Allow holding again when new piece spawns
  }, [board, nextPiece, sound]);

  // Create particles for line clear effect (optimized - fewer particles)
  const createParticles = useCallback((rows, boardState) => {
    const newParticles = [];
    const timestamp = Date.now();
    rows.forEach((rowIndex) => {
      // Only create particles for every other cell to reduce count
      for (let x = 0; x < BOARD_WIDTH; x += 2) {
        const cell = boardState[rowIndex][x];
        if (cell.filled) {
          // Reduced from 5 to 2 particles per cell
          for (let i = 0; i < 2; i++) {
            newParticles.push({
              id: `${rowIndex}-${x}-${i}-${timestamp}`,
              x: x * 30 + 15,
              y: rowIndex * 30 + 15,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.8) * 8,
              color: cell.color,
              size: Math.random() * 6 + 3,
              life: 1,
            });
          }
        }
      }
    });
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Lock piece and check for line clears
  const lockPiece = useCallback(() => {
    const { board: mergedBoard, isAboveBoard } = mergePieceToBoard(board, currentPiece, position);

    // Game over if piece locked with any part above the visible board
    if (isAboveBoard) {
      setBoard(mergedBoard);
      setCurrentPiece(null);
      setGameOver(true);
      setIsPlaying(false);
      sound.gameOver();
      return;
    }

    const { newBoard, linesCleared, clearedRows: rows } = clearLines(mergedBoard);

    if (linesCleared > 0) {
      // Create particles before clearing
      createParticles(rows, mergedBoard);
      setClearedRows(rows);

      // Calculate points (multiply by level)
      const pointsEarned = POINTS[linesCleared] * level;
      setScore((prev) => prev + pointsEarned);
      setLines((prev) => {
        const newLines = prev + linesCleared;
        const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
        }
        return newLines;
      });

      sound.lineClear(linesCleared);

      // Clear the rows animation after a short delay
      setTimeout(() => setClearedRows([]), 200);
    }

    setBoard(newBoard);
    setCurrentPiece(null);
  }, [board, currentPiece, position, level, sound, createParticles]);

  // Move piece
  const movePiece = useCallback(
    (dx, dy) => {
      if (!currentPiece || gameOver || isPaused) return false;

      const newPos = { x: position.x + dx, y: position.y + dy };

      if (isValidPosition(board, currentPiece.shape, newPos)) {
        setPosition(newPos);
        if (dx !== 0) sound.move();
        return true;
      }

      // If moving down and can't, lock the piece
      if (dy > 0) {
        lockPiece();
      }

      return false;
    },
    [currentPiece, gameOver, isPaused, position, board, lockPiece, sound]
  );

  // Rotate piece (direction: 1 for CW, -1 for CCW)
  const rotatePiece = useCallback((direction = 1) => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = direction === 1
      ? rotateMatrixCW(currentPiece.shape)
      : rotateMatrixCCW(currentPiece.shape);

    // Try normal rotation
    if (isValidPosition(board, rotated, position)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
      sound.rotate();
      return;
    }

    // Wall kick - try shifting left or right
    const kicks = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -1 },
    ];

    for (const kick of kicks) {
      const kickedPos = { x: position.x + kick.x, y: position.y + kick.y };
      if (isValidPosition(board, rotated, kickedPos)) {
        setCurrentPiece({ ...currentPiece, shape: rotated });
        setPosition(kickedPos);
        sound.rotate();
        return;
      }
    }
  }, [currentPiece, gameOver, isPaused, board, position, sound]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    let newY = position.y;

    while (isValidPosition(board, currentPiece.shape, { x: position.x, y: newY + 1 })) {
      newY++;
      dropDistance++;
    }

    // Add bonus points for hard drop
    setScore((prev) => prev + dropDistance * 2);
    setPosition({ x: position.x, y: newY });
    sound.hardDrop();

    // Lock immediately after hard drop
    setTimeout(() => {
      const { board: mergedBoard, isAboveBoard } = mergePieceToBoard(board, currentPiece, { x: position.x, y: newY });

      // Game over if piece locked with any part above the visible board
      if (isAboveBoard) {
        setBoard(mergedBoard);
        setCurrentPiece(null);
        setGameOver(true);
        setIsPlaying(false);
        sound.gameOver();
        return;
      }

      const { newBoard, linesCleared, clearedRows: rows } = clearLines(mergedBoard);

      if (linesCleared > 0) {
        createParticles(rows, mergedBoard);
        setClearedRows(rows);
        const pointsEarned = POINTS[linesCleared] * level;
        setScore((prev) => prev + pointsEarned);
        setLines((prev) => {
          const newLines = prev + linesCleared;
          const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
          }
          return newLines;
        });
        sound.lineClear(linesCleared);
        setTimeout(() => setClearedRows([]), 200);
      }

      setBoard(newBoard);
      setCurrentPiece(null);
    }, 50);
  }, [currentPiece, gameOver, isPaused, board, position, level, sound, createParticles]);

  // Soft drop
  const softDrop = useCallback(() => {
    if (movePiece(0, 1)) {
      setScore((prev) => prev + 1);
      sound.drop();
    }
  }, [movePiece, sound]);

  // Hold piece
  const holdPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !canHold) return;

    const currentType = currentPiece.type;

    if (heldPiece) {
      // Swap with held piece
      const swapPiece = { type: heldPiece.type, ...TETROMINOS[heldPiece.type] };
      const startX = Math.floor((BOARD_WIDTH - swapPiece.shape[0].length) / 2);
      const startY = -1;

      if (isValidPosition(board, swapPiece.shape, { x: startX, y: startY + 1 })) {
        setHeldPiece({ type: currentType, ...TETROMINOS[currentType] });
        setCurrentPiece(swapPiece);
        setPosition({ x: startX, y: startY });
        setCanHold(false);
        sound.rotate();
      }
    } else {
      // Hold current piece, spawn next
      setHeldPiece({ type: currentType, ...TETROMINOS[currentType] });
      setCurrentPiece(null);
      setCanHold(false);
      sound.rotate();
    }
  }, [currentPiece, gameOver, isPaused, canHold, heldPiece, board, sound]);

  // Start game
  const startGame = useCallback(() => {
    setBoard(createBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setCurrentPiece(null);
    setNextPiece(getRandomTetromino());
    setHeldPiece(null);
    setCanHold(true);
    setParticles([]);
    lastLevel.current = 1;
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!isPlaying || gameOver) return;
    setIsPaused((prev) => !prev);
    sound.pause();
  }, [isPlaying, gameOver, sound]);

  // Game loop - spawn pieces
  useEffect(() => {
    if (isPlaying && !currentPiece && !gameOver && !isPaused) {
      spawnPiece();
    }
  }, [isPlaying, currentPiece, gameOver, isPaused, spawnPiece]);

  // Game loop - auto drop (level determines speed)
  useEffect(() => {
    if (!isPlaying || gameOver || isPaused || !currentPiece) {
      if (dropInterval.current) {
        clearInterval(dropInterval.current);
        dropInterval.current = null;
      }
      return;
    }

    // Calculate speed directly from level
    const speedIndex = Math.min(level - 1, LEVEL_SPEEDS.length - 1);
    const speed = LEVEL_SPEEDS[speedIndex];

    // Clear any existing interval before creating new one
    if (dropInterval.current) {
      clearInterval(dropInterval.current);
    }

    dropInterval.current = setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => {
      if (dropInterval.current) {
        clearInterval(dropInterval.current);
        dropInterval.current = null;
      }
    };
  }, [isPlaying, gameOver, isPaused, currentPiece, level, movePiece]);

  // Level up sound
  useEffect(() => {
    if (level > lastLevel.current) {
      sound.levelUp();
      lastLevel.current = level;
    }
  }, [level, sound]);

  // Update particles with requestAnimationFrame
  useEffect(() => {
    if (particles.length === 0) return;

    let animationId;
    let lastTime = 0;

    const updateParticles = (currentTime) => {
      if (currentTime - lastTime >= 32) { // ~30fps for particles
        lastTime = currentTime;
        setParticles((prev) => {
          const updated = [];
          for (let i = 0; i < prev.length; i++) {
            const p = prev[i];
            const newLife = p.life - 0.03;
            if (newLife > 0) {
              updated.push({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.5,
                life: newLife,
              });
            }
          }
          return updated;
        });
      }
      animationId = requestAnimationFrame(updateParticles);
    };

    animationId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationId);
  }, [particles.length > 0]);

  return {
    board,
    currentPiece,
    nextPiece,
    heldPiece,
    canHold,
    position,
    score,
    lines,
    level,
    gameOver,
    isPaused,
    isPlaying,
    clearedRows,
    particles,
    movePiece,
    rotatePiece,
    hardDrop,
    softDrop,
    holdPiece,
    startGame,
    togglePause,
  };
}
