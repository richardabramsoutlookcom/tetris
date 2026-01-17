# Roadmap: Tetris Game

## Overview

Building on an existing React 19 Tetris game with core mechanics already in place. Adding retro Gameboy features: persistent high scores, authentic synthesized music, green-tinted DMG visual mode, and mobile touch controls. Four focused phases deliver a polished retro experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: High Scores** - Top 10 leaderboard with localStorage persistence
- [ ] **Phase 2: Gameboy Music** - Synthesized Type A/B/C soundtracks with selection
- [ ] **Phase 3: Gameboy Theme** - Green DMG visual mode with toggle
- [ ] **Phase 4: Mobile Controls** - Touch-based virtual buttons for mobile play

## Phase Details

### Phase 1: High Scores
**Goal**: Users can see and save high scores that persist across sessions
**Depends on**: Nothing (first phase)
**Requirements**: SCORE-01, SCORE-02, SCORE-03
**Success Criteria** (what must be TRUE):
  1. User can see top 10 scores on a leaderboard screen
  2. User can enter initials when game ends with a qualifying score
  3. High scores persist after closing and reopening the browser
**Research**: Unlikely (localStorage pattern already exists in codebase)
**Plans**: TBD

Plans:
- [ ] 01-01: TBD during planning

### Phase 2: Gameboy Music
**Goal**: Authentic Gameboy soundtrack with music selection
**Depends on**: Phase 1
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04
**Success Criteria** (what must be TRUE):
  1. User hears Type A (Korobeiniki) melody during gameplay
  2. User hears Type B melody during gameplay
  3. User hears Type C melody during gameplay
  4. User can switch between music tracks or disable music
**Research**: Likely (Web Audio synthesis for melodic content)
**Research topics**: Web Audio melody synthesis, 8-bit sound recreation, Korobeiniki notes/timing
**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning

### Phase 3: Gameboy Theme
**Goal**: Visual toggle between modern and retro Gameboy aesthetics
**Depends on**: Phase 2
**Requirements**: THEME-01, THEME-02
**Success Criteria** (what must be TRUE):
  1. User can play with green-tinted DMG Gameboy visuals
  2. User can toggle between modern and Gameboy modes from settings
**Research**: Unlikely (CSS-based theming, established patterns)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Mobile Controls
**Goal**: Touch controls for mobile gameplay
**Depends on**: Phase 3
**Requirements**: MOBIL-01, MOBIL-02
**Success Criteria** (what must be TRUE):
  1. User can play using on-screen touch buttons on mobile
  2. Touch controls include D-pad (left/right/down) and action buttons (rotate, hold, hard drop)
**Research**: Likely (touch event handling for games)
**Research topics**: Touch event handling, virtual D-pad patterns, preventing scroll/zoom during play
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. High Scores | 0/? | Not started | - |
| 2. Gameboy Music | 0/? | Not started | - |
| 3. Gameboy Theme | 0/? | Not started | - |
| 4. Mobile Controls | 0/? | Not started | - |
