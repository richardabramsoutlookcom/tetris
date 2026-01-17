# Codebase Concerns

**Analysis Date:** 2026-01-17

## Tech Debt

**Unused Default CSS from Vite Template:**
- Issue: `tetris-app/src/App.css` contains Vite template boilerplate (logo animations, card styles) that is never used
- Files: `tetris-app/src/App.css`
- Impact: Minor file bloat (43 lines of dead code), potential confusion for new developers
- Fix approach: Delete unused CSS or remove the import from `App.jsx`

**Duplicated Hard Drop Logic:**
- Issue: The `hardDrop` function in `useGameLogic.js` duplicates line-clearing logic that also exists in `lockPiece`
- Files: `tetris-app/src/hooks/useGameLogic.js` (lines 274-315, 184-213)
- Impact: Maintenance burden, risk of behavior divergence between soft/hard drop line clearing
- Fix approach: Extract shared line-clearing/scoring logic into a single helper function

**No Type Definitions:**
- Issue: Project uses React 19 with TypeScript types installed (`@types/react`, `@types/react-dom`) but all source files are `.jsx`/`.js` instead of `.tsx`/`.ts`
- Files: All files in `tetris-app/src/`
- Impact: No compile-time type checking despite having types available, potential runtime bugs
- Fix approach: Either convert to TypeScript or remove unused type dependencies

**Global Sound Engine Singleton:**
- Issue: `SoundEngine` is instantiated as a module-level singleton rather than being properly managed in React lifecycle
- Files: `tetris-app/src/hooks/useSound.js` (line 102)
- Impact: Cannot have multiple game instances, difficult to test in isolation
- Fix approach: Move AudioContext creation into a React context provider

## Known Bugs

**Potential Race Condition in Hard Drop:**
- Symptoms: Hard drop uses `setTimeout` with 50ms delay before locking, during which state could change
- Files: `tetris-app/src/hooks/useGameLogic.js` (lines 291-314)
- Trigger: Rapid key presses or simultaneous actions during hard drop
- Workaround: None currently implemented

**Stale Closure in Particle Animation Effect:**
- Symptoms: Effect dependency `[particles.length > 0]` is a boolean, not the actual dependency
- Files: `tetris-app/src/hooks/useGameLogic.js` (line 456)
- Trigger: Particle state updates may not properly trigger effect re-runs
- Workaround: Works in practice but technically incorrect React patterns

## Security Considerations

**LocalStorage Key Bindings:**
- Risk: Key bindings are stored in localStorage without validation on load
- Files: `tetris-app/src/hooks/useKeyBindings.js` (lines 47-57)
- Current mitigation: Try-catch wrapper, falls back to defaults on parse error
- Recommendations: Add schema validation for loaded bindings to prevent malformed data issues

**No Content Security Policy:**
- Risk: Single-page app has no CSP headers configured
- Files: `tetris-app/index.html`
- Current mitigation: None (static app with no external resources)
- Recommendations: Add CSP meta tag for defense in depth, especially if adding analytics or external assets later

## Performance Bottlenecks

**Continuous Canvas Animation:**
- Problem: Starfield background runs continuously at 30fps even when game is paused/idle
- Files: `tetris-app/src/components/Starfield.jsx`
- Cause: Animation loop runs unconditionally via requestAnimationFrame
- Improvement path: Pause animation when game is not actively playing or tab is not visible

**Particle System Creates New Objects Every Frame:**
- Problem: Particle update creates new object references for every particle every frame
- Files: `tetris-app/src/hooks/useGameLogic.js` (lines 433-449)
- Cause: Spread operator creates new particle objects in animation loop
- Improvement path: Consider object pooling or mutable updates for particle state

**Board Display Recalculates Ghost Position Every Render:**
- Problem: Ghost piece position calculated inline in render via nested loops with labeled break
- Files: `tetris-app/src/components/GameBoard.jsx` (lines 36-51)
- Cause: Ghost calculation happens inside useMemo but could be optimized
- Improvement path: Memoize ghost position separately, calculate only when piece/position changes

## Fragile Areas

**Game State Hook (`useGameLogic`):**
- Files: `tetris-app/src/hooks/useGameLogic.js` (481 lines)
- Why fragile: Largest file, manages 14+ state variables with complex interdependencies
- Safe modification: Test all game mechanics after any change, especially timing/intervals
- Test coverage: No automated tests exist

**Key Binding System:**
- Files: `tetris-app/src/hooks/useKeyBindings.js`, `tetris-app/src/components/KeyBindings.jsx`
- Why fragile: Circular dependency between capture, validation, and storage; complex state machine for editing
- Safe modification: Manually test all key reassignment flows including conflicts
- Test coverage: None

## Scaling Limits

**Particle Count:**
- Current capacity: Creates ~10 particles per line clear (reduced from ~25)
- Limit: UI may lag with many simultaneous line clears (Tetris + cascading clears)
- Scaling path: Already optimized; further reduction would remove visual effect

**Board Size (Hardcoded):**
- Current capacity: Fixed 10x20 board
- Limit: Cannot create alternative game modes (smaller/larger boards)
- Scaling path: Move BOARD_WIDTH/BOARD_HEIGHT from constants to game config

## Dependencies at Risk

**None Identified:**
- React 19.2.0 and Vite 7.2.4 are current stable versions
- No deprecated or unmaintained dependencies detected
- All devDependencies are actively maintained (ESLint 9.x, etc.)

## Missing Critical Features

**No High Score Persistence:**
- Problem: Scores are lost on page refresh
- Blocks: No leaderboard or personal best tracking

**No Mobile/Touch Support:**
- Problem: Game only responds to keyboard input
- Blocks: Unusable on mobile devices despite responsive CSS layout

**No Accessibility Features:**
- Problem: No ARIA labels, keyboard focus indicators, or screen reader support
- Blocks: Game is inaccessible to users with disabilities

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested: Entire codebase (0% coverage)
- Files: All files in `tetris-app/src/`
- Risk: All game logic changes require manual verification; regression bugs undetectable
- Priority: High - core game mechanics in `useGameLogic.js` are complex and critical

**Specific Areas Needing Tests:**
- Collision detection logic in `isValidPosition`
- Wall kick behavior in `rotatePiece`
- Line clearing and scoring calculations
- Level speed progression
- Hold piece swap mechanics

---

*Concerns audit: 2026-01-17*
