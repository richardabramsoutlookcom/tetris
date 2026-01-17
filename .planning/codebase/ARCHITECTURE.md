# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Component-Based React Architecture with Custom Hooks for State Management

**Key Characteristics:**
- Single-page React application with no routing
- Game state centralized in `useGameLogic` custom hook
- Presentational components receive all data via props
- No external state management library (useState/useCallback only)
- Web Audio API for sound generation (no audio files)

## Layers

**Entry Layer:**
- Purpose: Bootstrap React application
- Location: `tetris-app/src/main.jsx`
- Contains: ReactDOM render call, StrictMode wrapper
- Depends on: React, App component
- Used by: Vite bundler

**Application Shell:**
- Purpose: Top-level component wrapper
- Location: `tetris-app/src/App.jsx`
- Contains: Single Game component render
- Depends on: Game component
- Used by: main.jsx

**Game Container:**
- Purpose: Orchestrate game UI, state, and input handling
- Location: `tetris-app/src/components/Game.jsx`
- Contains: Layout structure, keyboard event handling, game state consumption
- Depends on: All hooks (useGameLogic, useSound, useKeyBindings), all UI components
- Used by: App.jsx

**Custom Hooks (Business Logic):**
- Purpose: Encapsulate game mechanics, sound, and input configuration
- Location: `tetris-app/src/hooks/`
- Contains: useGameLogic.js, useSound.js, useKeyBindings.js
- Depends on: React hooks, constants
- Used by: Game.jsx

**Presentational Components:**
- Purpose: Render game visuals
- Location: `tetris-app/src/components/`
- Contains: GameBoard, NextPiece, HoldPiece, ScorePanel, Controls, KeyBindings, Starfield
- Depends on: Constants (for dimensions), CSS files
- Used by: Game.jsx

**Constants:**
- Purpose: Game configuration and data definitions
- Location: `tetris-app/src/constants/tetrominos.js`
- Contains: Tetromino shapes, board dimensions, level speeds, scoring
- Depends on: Nothing
- Used by: useGameLogic, GameBoard, NextPiece

## Data Flow

**Game State Flow:**

1. `useGameLogic` hook initializes and manages all game state (board, pieces, score, etc.)
2. Game.jsx calls hook, receives state and action functions
3. State passed down as props to presentational components
4. User input triggers action functions in Game.jsx keyboard handler
5. Actions modify state in useGameLogic, triggering re-render cascade

**Input Handling Flow:**

1. Window keydown event captured in Game.jsx useEffect
2. Key mapped to action via `useKeyBindings.getActionForKey()`
3. Corresponding action function called (movePiece, rotatePiece, etc.)
4. useGameLogic validates move and updates state
5. Sound effect triggered via useSound hook

**State Management:**
- All game state lives in `useGameLogic` hook
- Key bindings persisted to localStorage via `useKeyBindings`
- No global state or context providers
- Sound engine is a singleton class instance outside React

## Key Abstractions

**Tetromino:**
- Purpose: Represents a game piece with shape and color
- Examples: `tetris-app/src/constants/tetrominos.js` (TETROMINOS object)
- Pattern: Object with `shape` (2D matrix) and `color` (hex string)

**Board:**
- Purpose: 2D grid representing the game field
- Examples: `tetris-app/src/hooks/useGameLogic.js` (createBoard function)
- Pattern: Array of rows, each row is array of cells `{ filled: boolean, color: string | null }`

**Position:**
- Purpose: Track piece location on board
- Examples: `tetris-app/src/hooks/useGameLogic.js` (position state)
- Pattern: Object with `{ x: number, y: number }` for grid coordinates

**Key Bindings:**
- Purpose: Map keyboard keys to game actions
- Examples: `tetris-app/src/hooks/useKeyBindings.js` (DEFAULT_BINDINGS)
- Pattern: Object mapping action names to arrays of key strings

## Entry Points

**Application Entry:**
- Location: `tetris-app/src/main.jsx`
- Triggers: Vite dev server or build output
- Responsibilities: Mount React app to DOM #root element

**HTML Entry:**
- Location: `tetris-app/index.html`
- Triggers: Browser navigation
- Responsibilities: Load Vite module, provide root mount point

**Game Initialization:**
- Location: `tetris-app/src/components/Game.jsx` (startGame function from useGameLogic)
- Triggers: User clicks Start button or presses Enter
- Responsibilities: Reset board, initialize pieces, start game loop

## Error Handling

**Strategy:** Minimal error handling with graceful degradation

**Patterns:**
- Web Audio API initialization wrapped in try/catch (`useSound.js`)
- localStorage operations wrapped in try/catch (`useKeyBindings.js`)
- Collision detection prevents invalid game states (`isValidPosition` function)
- No error boundaries implemented

## Cross-Cutting Concerns

**Logging:** Console warnings only for non-critical failures (Web Audio, localStorage)

**Validation:** Inline collision detection in `useGameLogic.js` via `isValidPosition()` function

**Authentication:** Not applicable - single-player local game

**Persistence:** Key bindings saved to localStorage; game state not persisted between sessions

**Performance Optimization:**
- `React.memo` on GameBoard, Starfield, GridCell components
- `useMemo` for computed display board in GameBoard
- `useCallback` for all action handlers
- Starfield animation throttled to 30fps
- Particle system throttled to ~30fps

---

*Architecture analysis: 2026-01-17*
