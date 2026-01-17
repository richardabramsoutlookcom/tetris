// Gameboy Tetris Melodies
// Note frequencies in Hz (standard tuning A4=440Hz)

// Note frequency reference
const NOTES = {
  // Octave 4
  C4: 262,
  D4: 294,
  E4: 330,
  F4: 349,
  G4: 392,
  A4: 440,
  B4: 494,
  // Octave 5
  C5: 523,
  D5: 587,
  E5: 659,
  F5: 698,
  G5: 784,
  A5: 880,
  B5: 988,
  // Octave 6
  C6: 1047,
};

// Tempo: ~120 BPM = 500ms per beat
const BEAT = 500;
const HALF = BEAT / 2;     // eighth note = 250ms
const QUARTER = BEAT;      // quarter note = 500ms
const DOTTED_Q = BEAT * 1.5; // dotted quarter = 750ms

// Type A: Korobeiniki (the famous Tetris theme)
// Main melody in E minor, recognizable motif
export const MELODY_TYPE_A = [
  // Bar 1: E-B-C-D
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.B4, duration: HALF },
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.D5, duration: QUARTER },
  // Bar 2: C-B-A
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.B4, duration: HALF },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.A4, duration: HALF },
  // Bar 3: C-E-D-C
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.D5, duration: HALF },
  { note: NOTES.C5, duration: HALF },
  // Bar 4: B-C-D-E
  { note: NOTES.B4, duration: QUARTER },
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.E5, duration: QUARTER },
  // Bar 5: C-A-A
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER, rest: HALF },
  // Bar 6: D-F-A-G-F
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.F5, duration: HALF },
  { note: NOTES.A5, duration: QUARTER },
  { note: NOTES.G5, duration: HALF },
  { note: NOTES.F5, duration: HALF },
  // Bar 7: E-C-E-D-C
  { note: NOTES.E5, duration: DOTTED_Q },
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.D5, duration: HALF },
  { note: NOTES.C5, duration: HALF },
  // Bar 8: B-B-C-D-E-C-A-A (ending phrase)
  { note: NOTES.B4, duration: QUARTER },
  { note: NOTES.B4, duration: HALF },
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER, rest: QUARTER },
];

// Type B: March-like melody in C major
// Simpler pattern, more staccato feel
export const MELODY_TYPE_B = [
  // Bar 1: Staccato march pattern
  { note: NOTES.C5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.G4, duration: HALF, rest: HALF / 2 },
  { note: NOTES.C5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.E5, duration: HALF, rest: HALF / 2 },
  // Bar 2
  { note: NOTES.D5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.B4, duration: HALF, rest: HALF / 2 },
  { note: NOTES.D5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.G5, duration: HALF, rest: HALF / 2 },
  // Bar 3: Descending run
  { note: NOTES.E5, duration: HALF },
  { note: NOTES.D5, duration: HALF },
  { note: NOTES.C5, duration: HALF },
  { note: NOTES.B4, duration: HALF },
  // Bar 4: Resolution
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.G4, duration: QUARTER, rest: QUARTER },
  // Bar 5: Second phrase
  { note: NOTES.E5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.C5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.E5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.G5, duration: HALF, rest: HALF / 2 },
  // Bar 6
  { note: NOTES.F5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.D5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.F5, duration: HALF, rest: HALF / 2 },
  { note: NOTES.A5, duration: HALF, rest: HALF / 2 },
  // Bar 7: Descending
  { note: NOTES.G5, duration: HALF },
  { note: NOTES.F5, duration: HALF },
  { note: NOTES.E5, duration: HALF },
  { note: NOTES.D5, duration: HALF },
  // Bar 8: Final cadence
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER, rest: QUARTER },
];

// Type C: Gentle/flowing melody in F major
// Legato quarter notes, scalar passages
export const MELODY_TYPE_C = [
  // Bar 1: Rising F major scale fragment
  { note: NOTES.F4, duration: QUARTER },
  { note: NOTES.G4, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  // Bar 2: Gentle descent
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.G4, duration: QUARTER },
  // Bar 3: Melodic phrase
  { note: NOTES.F4, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.F5, duration: QUARTER },
  // Bar 4: Resolution
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.C5, duration: HALF },
  // Bar 5: Second phrase - higher register
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.F5, duration: QUARTER },
  { note: NOTES.E5, duration: QUARTER },
  // Bar 6: Flowing
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.E5, duration: QUARTER },
  { note: NOTES.F5, duration: QUARTER },
  { note: NOTES.G5, duration: QUARTER },
  // Bar 7: Gentle descent
  { note: NOTES.A5, duration: QUARTER },
  { note: NOTES.G5, duration: QUARTER },
  { note: NOTES.F5, duration: QUARTER },
  { note: NOTES.E5, duration: QUARTER },
  // Bar 8: Final cadence to tonic
  { note: NOTES.D5, duration: QUARTER },
  { note: NOTES.C5, duration: QUARTER },
  { note: NOTES.A4, duration: QUARTER },
  { note: NOTES.F4, duration: QUARTER, rest: QUARTER },
];

// Track display names for UI
export const TRACK_NAMES = {
  A: 'Type A',
  B: 'Type B',
  C: 'Type C',
};
