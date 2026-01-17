# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
tetris game/
├── .claude/              # Claude configuration
├── .git/                 # Git repository
├── .planning/            # GSD planning documents
│   └── codebase/         # Codebase analysis (this file)
└── tetris-app/           # Main application directory
    ├── node_modules/     # Dependencies (not committed)
    ├── public/           # Static assets
    │   └── vite.svg      # Favicon
    ├── src/              # Source code
    │   ├── assets/       # Static assets bundled by Vite
    │   │   └── react.svg # React logo (unused)
    │   ├── components/   # React components
    │   ├── constants/    # Game configuration
    │   └── hooks/        # Custom React hooks
    ├── .gitignore        # Git ignore rules
    ├── eslint.config.js  # ESLint configuration
    ├── index.html        # HTML entry point
    ├── package.json      # Dependencies and scripts
    ├── README.md         # Project readme (Vite default)
    └── vite.config.js    # Vite bundler configuration
```

## Directory Purposes

**tetris-app/src/components/:**
- Purpose: React UI components
- Contains: JSX components with co-located CSS
- Key files:
  - `Game.jsx`: Main game orchestrator (199 lines)
  - `GameBoard.jsx`: Board rendering with piece display
  - `NextPiece.jsx`: Next piece preview
  - `HoldPiece.jsx`: Held piece display
  - `ScorePanel.jsx`: Score/lines/level display
  - `Controls.jsx`: Control hints panel
  - `KeyBindings.jsx`: Settings modal for key configuration
  - `Starfield.jsx`: Animated background canvas

**tetris-app/src/hooks/:**
- Purpose: Custom React hooks for business logic
- Contains: Game state, sound, and input management
- Key files:
  - `useGameLogic.js`: Core game mechanics (481 lines) - board state, piece movement, scoring
  - `useSound.js`: Web Audio API sound effects (143 lines)
  - `useKeyBindings.js`: Customizable keyboard controls (111 lines)

**tetris-app/src/constants/:**
- Purpose: Game configuration and static data
- Contains: Tetromino definitions, board settings, scoring rules
- Key files:
  - `tetrominos.js`: All game constants (96 lines)

**tetris-app/public/:**
- Purpose: Static files served as-is
- Contains: Favicon
- Key files: `vite.svg`

**tetris-app/src/assets/:**
- Purpose: Assets processed by Vite bundler
- Contains: Currently unused React logo
- Key files: `react.svg` (unused)

## Key File Locations

**Entry Points:**
- `tetris-app/index.html`: HTML shell, loads main.jsx
- `tetris-app/src/main.jsx`: React app bootstrap

**Configuration:**
- `tetris-app/package.json`: Dependencies and npm scripts
- `tetris-app/vite.config.js`: Vite bundler settings
- `tetris-app/eslint.config.js`: Linting rules

**Core Logic:**
- `tetris-app/src/hooks/useGameLogic.js`: All game mechanics
- `tetris-app/src/constants/tetrominos.js`: Game configuration

**Main UI:**
- `tetris-app/src/components/Game.jsx`: Game container and layout
- `tetris-app/src/components/GameBoard.jsx`: Board rendering

**Styling:**
- `tetris-app/src/index.css`: Global styles
- `tetris-app/src/App.css`: App-level styles (minimal)
- `tetris-app/src/components/*.css`: Component-specific styles (co-located)

## Naming Conventions

**Files:**
- Components: PascalCase.jsx (e.g., `GameBoard.jsx`, `NextPiece.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useGameLogic.js`, `useSound.js`)
- Constants: camelCase (e.g., `tetrominos.js`)
- Styles: Match component name (e.g., `GameBoard.css` for `GameBoard.jsx`)

**Directories:**
- All lowercase, plural for collections (e.g., `components/`, `hooks/`, `constants/`)

**Exports:**
- Components: Named exports matching filename (e.g., `export function GameBoard`)
- Hooks: Named exports with `use` prefix (e.g., `export function useGameLogic`)
- Constants: Named exports for each constant (e.g., `export const TETROMINOS`)

## Where to Add New Code

**New Feature:**
- Primary code: Add hook in `tetris-app/src/hooks/` for logic, component in `tetris-app/src/components/` for UI
- Tests: No test directory exists; would create `tetris-app/src/__tests__/` or co-locate as `*.test.js`

**New Component:**
- Implementation: `tetris-app/src/components/NewComponent.jsx`
- Styles: `tetris-app/src/components/NewComponent.css` (co-located)
- Import in: `tetris-app/src/components/Game.jsx`

**New Hook:**
- Implementation: `tetris-app/src/hooks/useNewHook.js`
- Import in: Component that needs the functionality

**New Game Constants:**
- Add to: `tetris-app/src/constants/tetrominos.js`
- Or create new file: `tetris-app/src/constants/newConstants.js`

**Utilities:**
- Shared helpers: Would create `tetris-app/src/utils/` directory
- Currently no utils directory exists

## Special Directories

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static files copied to build output as-is
- Generated: No
- Committed: Yes

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: By GSD commands
- Committed: Depends on project preference

---

*Structure analysis: 2026-01-17*
