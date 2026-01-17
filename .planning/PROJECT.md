# Tetris Game

## What This Is

A browser-based Tetris game built with React 19 and Vite. Features classic gameplay with modern visuals, procedural sound effects, customizable controls, and an animated starfield background. Adding retro Gameboy mode, authentic soundtrack, persistent high scores, and mobile support.

## Core Value

Classic Tetris gameplay that feels good to play — responsive controls, satisfying feedback, and the option to experience it in authentic Gameboy style.

## Requirements

### Validated

- ✓ Core Tetris mechanics (piece movement, rotation, line clearing) — existing
- ✓ Ghost piece preview showing where piece will land — existing
- ✓ Hold piece functionality — existing
- ✓ Next piece preview — existing
- ✓ Score, lines, and level tracking — existing
- ✓ Progressive speed increase by level — existing
- ✓ Procedural sound effects via Web Audio API — existing
- ✓ Customizable keyboard controls with persistence — existing
- ✓ Animated starfield background — existing
- ✓ Pause functionality — existing

### Active

- [ ] Top 10 high score leaderboard with localStorage persistence
- [ ] Gameboy soundtrack (Type A/Korobeiniki, Type B, Type C) via Web Audio synthesis
- [ ] Gameboy visual mode with green-tinted DMG aesthetic
- [ ] Toggle between modern and retro visual modes
- [ ] Mobile touch controls (virtual buttons for touch devices)

### Out of Scope

- Online multiplayer — complexity exceeds project goals
- Cloud sync/online leaderboards — keeping it local-only for simplicity
- Other retro console themes (NES, SNES) — focusing on Gameboy only

## Context

**Existing Codebase:**
- React 19 with functional components and custom hooks
- Game logic centralized in `useGameLogic` hook (481 lines)
- Sound engine using Web Audio API oscillators (`useSound` hook)
- Key bindings with localStorage persistence (`useKeyBindings` hook)
- No external dependencies beyond React — all features built from scratch

**Technical Foundation:**
- Web Audio API already in use — can extend for music
- localStorage pattern established — can extend for high scores
- CSS-based styling — can create alternate theme styles
- Responsive layout exists but no touch input handling

**Codebase Analysis:**
- See `.planning/codebase/` for detailed architecture, conventions, and concerns
- Main concern: `useGameLogic.js` is large (481 lines) with complex state

## Constraints

- **Tech stack**: React 19 + Vite, no new dependencies unless necessary
- **Audio**: Web Audio API synthesis only, no external audio files
- **Storage**: localStorage only, no backend
- **Browser support**: Modern browsers with Web Audio and Canvas support

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Synthesize Gameboy music with Web Audio | Consistent with existing sound approach, no audio files needed | — Pending |
| localStorage for high scores | Simple, matches existing key bindings pattern | — Pending |
| CSS-based theme switching | Simpler than canvas re-rendering, leverages existing styles | — Pending |

---
*Last updated: 2026-01-17 after initialization*
