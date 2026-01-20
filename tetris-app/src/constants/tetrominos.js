// Tetromino shapes and colors
export const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f5ff', // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0066ff', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#ff9500', // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffff00', // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00ff00', // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#aa00ff', // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ff0055', // Red
  },
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 30;

// Level speed in milliseconds (lower = faster)
// More aggressive speed increase - noticeable jump each level
export const LEVEL_SPEEDS = [
  1000, // Level 1  - Starting speed
  850,  // Level 2  - 15% faster
  700,  // Level 3  - 18% faster
  550,  // Level 4  - 21% faster
  400,  // Level 5  - 27% faster
  300,  // Level 6  - 25% faster
  200,  // Level 7  - 33% faster
  150,  // Level 8  - 25% faster
  100,  // Level 9  - 33% faster
  80,   // Level 10 - 20% faster
  60,   // Level 11 - 25% faster
  50,   // Level 12 - 17% faster
  40,   // Level 13 - 20% faster
  30,   // Level 14 - 25% faster
  20,   // Level 15+ - Maximum speed
];

// Lines needed to advance to next level
export const LINES_PER_LEVEL = 10;

// Points for clearing lines
export const POINTS = {
  1: 100,   // Single
  2: 300,   // Double
  3: 500,   // Triple
  4: 800,   // Tetris
};

export const TETROMINO_TYPES = Object.keys(TETROMINOS);
