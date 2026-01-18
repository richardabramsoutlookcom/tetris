---
created: 2026-01-17T23:15
title: Improve music quality with multi-layered synthesis
area: audio
files:
  - tetris-app/src/hooks/useMusic.js
---

## Problem

Current Gameboy music implementation (Phase 2) uses basic single-voice synthesis. Sounds thin and lacks the richness of the original Gameboy audio which used multiple channels (pulse waves, wave channel, noise).

The original Gameboy had 4 audio channels:
- 2 pulse wave channels (melody, harmony)
- 1 programmable wave channel (bass)
- 1 noise channel (percussion/rhythm)

Current implementation likely uses single oscillator per note, missing the layered depth.

## Solution

- Add multiple oscillator layers per voice (detuned for thickness)
- Implement proper Gameboy-style 4-channel architecture
- Add bass line on separate channel
- Consider adding simple percussion/rhythm patterns
- May need envelope shaping improvements for more authentic sound
- Reference original Gameboy Tetris audio for accuracy
