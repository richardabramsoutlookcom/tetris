# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- No test framework configured
- No test dependencies in `tetris-app/package.json`

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test scripts defined in package.json
```

## Test File Organization

**Location:**
- No test files exist in the source code

**Naming:**
- Not established

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- Not established - no tests exist

**Patterns:**
- Not established

## Mocking

**Framework:** Not configured

**Patterns:**
- Not established

**What to Mock:**
- If tests were added, consider mocking:
  - `localStorage` (used in `tetris-app/src/hooks/useKeyBindings.js`)
  - `window.AudioContext` / `window.webkitAudioContext` (used in `tetris-app/src/hooks/useSound.js`)
  - `requestAnimationFrame` (used in `tetris-app/src/hooks/useGameLogic.js` and `tetris-app/src/components/Starfield.jsx`)
  - `setInterval` / `setTimeout` (used throughout game logic)

**What NOT to Mock:**
- Pure functions like `createBoard`, `rotateMatrixCW`, `clearLines` in `tetris-app/src/hooks/useGameLogic.js`
- Constants from `tetris-app/src/constants/tetrominos.js`

## Fixtures and Factories

**Test Data:**
- Not established

**Location:**
- Not established

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not implemented
- Good candidates for unit testing:
  - Board manipulation functions in `tetris-app/src/hooks/useGameLogic.js`:
    - `createBoard()`
    - `rotateMatrixCW(matrix)`
    - `rotateMatrixCCW(matrix)`
    - `isValidPosition(board, shape, position)`
    - `mergePieceToBoard(board, piece, position)`
    - `clearLines(board)`
  - Key binding logic in `tetris-app/src/hooks/useKeyBindings.js`:
    - `getKeyDisplayName(key)`
    - `getActionForKey(key)`
  - Scoring calculations (POINTS constant usage)

**Integration Tests:**
- Not implemented
- Candidates:
  - Game flow (start, piece spawn, line clear, game over)
  - Key binding persistence to localStorage
  - Sound engine initialization and playback

**E2E Tests:**
- Not configured
- No Playwright, Cypress, or similar detected

## Recommendations for Adding Tests

**Suggested Framework:**
- Vitest (already using Vite) would be the natural choice
- Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

**Suggested Configuration:**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

**Priority Test Targets:**

1. **Pure game logic functions** (`tetris-app/src/hooks/useGameLogic.js`):
   - These are pure functions that can be tested without React
   - Extract to separate utilities file for easier testing

2. **Constants validation** (`tetris-app/src/constants/tetrominos.js`):
   - Verify tetromino shapes are valid (correct dimensions, cells)
   - Verify point values and level speeds

3. **Key bindings hook** (`tetris-app/src/hooks/useKeyBindings.js`):
   - Test key mapping logic
   - Test conflict detection
   - Test localStorage persistence

**Example Test Structure:**
```javascript
// src/hooks/__tests__/useGameLogic.test.js
import { describe, it, expect } from 'vitest';
import { createBoard, rotateMatrixCW, isValidPosition } from '../gameUtils';

describe('createBoard', () => {
  it('creates a 20x10 empty board', () => {
    const board = createBoard();
    expect(board).toHaveLength(20);
    expect(board[0]).toHaveLength(10);
    expect(board[0][0]).toEqual({ filled: false, color: null });
  });
});

describe('rotateMatrixCW', () => {
  it('rotates a 3x3 matrix clockwise', () => {
    const input = [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
    const expected = [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ];
    expect(rotateMatrixCW(input)).toEqual(expected);
  });
});
```

## Common Patterns

**Async Testing:**
- Not established (no tests)
- For game logic, would need to handle:
  - `setTimeout` for piece locking
  - `setInterval` for auto-drop
  - `requestAnimationFrame` for particles

**Error Testing:**
- Not established
- For sound/localStorage, would test graceful degradation

---

*Testing analysis: 2026-01-17*
