# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- Components: PascalCase with `.jsx` extension (e.g., `GameBoard.jsx`, `NextPiece.jsx`)
- Hooks: camelCase with `use` prefix and `.js` extension (e.g., `useGameLogic.js`, `useSound.js`)
- Constants: camelCase with `.js` extension (e.g., `tetrominos.js`)
- CSS: PascalCase matching component name (e.g., `GameBoard.css` for `GameBoard.jsx`)
- Co-located: CSS files live alongside their component files

**Functions:**
- Components: PascalCase function declarations (e.g., `function Game()`, `function Controls()`)
- Hooks: camelCase with `use` prefix (e.g., `useGameLogic`, `useKeyBindings`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleKeyDown`, `handleConfirmConflict`)
- Helper functions: camelCase (e.g., `createBoard`, `rotateMatrixCW`, `clearLines`)

**Variables:**
- State: camelCase (e.g., `currentPiece`, `gameOver`, `isPaused`, `isPlaying`)
- Boolean state: `is` or `can` prefix (e.g., `isPaused`, `isPlaying`, `canHold`)
- Constants: SCREAMING_SNAKE_CASE for module-level (e.g., `BOARD_WIDTH`, `TETROMINO_TYPES`)
- Object constants: SCREAMING_SNAKE_CASE keys (e.g., `DEFAULT_BINDINGS`, `ACTION_LABELS`)

**Types:**
- No TypeScript used - this is a JavaScript/JSX codebase
- Props are destructured in function parameters without type annotations

## Code Style

**Formatting:**
- No Prettier configuration detected
- Default Vite/ESLint formatting applies
- 2-space indentation observed
- Single quotes for strings
- Trailing commas in arrays and objects
- No semicolons required (mix observed)

**Linting:**
- ESLint 9.x with flat config format
- Config file: `tetris-app/eslint.config.js`
- Key rules:
  - `no-unused-vars`: Error, ignores vars starting with uppercase or underscore
  - React Hooks rules from `eslint-plugin-react-hooks`
  - React Refresh rules from `eslint-plugin-react-refresh`
  - Browser globals enabled

## Import Organization

**Order:**
1. React core imports (`react`, `react-dom`)
2. Custom hooks (from `../hooks/`)
3. Components (from `./` or `../components/`)
4. Constants (from `../constants/`)
5. CSS imports (from `./`)

**Pattern examples from `tetris-app/src/components/Game.jsx`:**
```javascript
import { useEffect, useCallback, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { useGameLogic } from '../hooks/useGameLogic';
import { useKeyBindings } from '../hooks/useKeyBindings';
import { Starfield } from './Starfield';
import { GameBoard } from './GameBoard';
import './Game.css';
```

**Path Aliases:**
- None configured - relative paths used throughout

## Error Handling

**Patterns:**
- Try-catch for localStorage operations in `tetris-app/src/hooks/useKeyBindings.js`:
```javascript
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
} catch (e) {
  console.warn('Failed to load key bindings from storage');
}
```
- `console.warn` for non-critical errors (graceful degradation)
- Web Audio API initialization wrapped in try-catch in `tetris-app/src/hooks/useSound.js`
- No centralized error boundary

## Logging

**Framework:** Browser console

**Patterns:**
- `console.warn` for recoverable errors
- No structured logging
- No production logging strategy

## Comments

**When to Comment:**
- Explanatory comments for complex algorithms (e.g., ghost piece calculation, wall kicks)
- Section markers for grouping related logic (e.g., `// Sound effects`)
- No JSDoc/TSDoc annotations

**Examples from `tetris-app/src/hooks/useGameLogic.js`:**
```javascript
// Create empty board
const createBoard = () => ...

// Rotate matrix 90 degrees clockwise
const rotateMatrixCW = (matrix) => ...

// Wall kick - try shifting left or right
const kicks = [...]
```

## Function Design

**Size:**
- Functions vary from small utilities (5-10 lines) to larger hook implementations (50+ lines)
- Complex functions broken into named sub-functions

**Parameters:**
- Destructured props in components: `function Controls({ bindings })`
- Multiple parameters in hooks: `useGameLogic(sound)`
- Object parameters when many options needed

**Return Values:**
- Components return JSX
- Hooks return objects with state and callbacks:
```javascript
return {
  board,
  currentPiece,
  movePiece,
  rotatePiece,
  startGame,
  togglePause,
};
```
- Helper functions return computed values

## Module Design

**Exports:**
- Named exports for components: `export function Game() { ... }`
- Named exports for hooks: `export function useSound() { ... }`
- Named exports for constants: `export const TETROMINOS = { ... }`
- Single utility exported alongside hook: `export const getKeyDisplayName = ...` in `useKeyBindings.js`
- Default export only for `App.jsx`: `export default App`

**Barrel Files:**
- Not used - direct imports from each file

## Component Patterns

**React Hooks Usage:**
- `useState` for local state
- `useCallback` wrapping all handlers to prevent re-renders
- `useEffect` for side effects (keyboard listeners, intervals, animations)
- `useRef` for mutable values that don't trigger re-renders
- `useMemo` for expensive calculations (board rendering)
- `memo` HOC for pure components (`Starfield`, `GameBoard`, `GridCell`)

**State Management:**
- Local state with hooks - no global state library
- State lifted to parent components when needed
- Props passed down through component tree

**Performance Patterns from `tetris-app/src/components/GameBoard.jsx`:**
```javascript
const GridCell = memo(function GridCell() { ... });
const GridBackground = memo(function GridBackground() { ... });
export const GameBoard = memo(function GameBoard({ ... }) { ... });
```

## CSS Patterns

**Organization:**
- Component-scoped CSS files (one CSS file per component)
- BEM-like class naming: `.game-container`, `.game-content`, `.overlay-content`
- CSS custom properties not used (inline colors and values)

**Responsive Design:**
- Media queries at end of CSS files
- Breakpoint at 700px for mobile in `tetris-app/src/components/Game.css`

---

*Convention analysis: 2026-01-17*
