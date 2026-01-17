import { useState, useCallback, useRef, useEffect } from 'react';
import { MELODY_TYPE_A, MELODY_TYPE_B, MELODY_TYPE_C } from '../constants/melodies';

// Music playback engine using Web Audio API
class MusicEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
    this.isPlaying = false;
    this.scheduledNodes = [];
    this.currentMelody = null;
    this.scheduleInterval = null;
    this.nextNoteIndex = 0;
    this.nextNoteTime = 0;
    this.lookahead = 0.1; // Schedule notes 100ms ahead
    this.scheduleAheadTime = 0.2; // How far ahead to schedule (seconds)
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.2; // Lower than SFX
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Play a single note with 8-bit square wave character
  playNote(frequency, duration, startTime) {
    if (!this.initialized || !this.audioContext) return null;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Square wave for authentic 8-bit sound
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Short envelope for crisp Gameboy feel
    const attack = 0.01;
    const decay = 0.05;
    const sustainLevel = 0.8;
    const release = 0.05;

    const durationSec = duration / 1000;
    const sustainTime = Math.max(0, durationSec - attack - decay - release);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(0.3 * sustainLevel, startTime + attack + decay);
    gainNode.gain.setValueAtTime(0.3 * sustainLevel, startTime + attack + decay + sustainTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + durationSec);

    return { osc, gainNode };
  }

  // Schedule notes in advance using lookahead pattern
  scheduleNotes() {
    if (!this.isPlaying || !this.currentMelody || !this.audioContext) return;

    const currentTime = this.audioContext.currentTime;

    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      const note = this.currentMelody[this.nextNoteIndex];

      // Schedule the note
      const nodes = this.playNote(note.note, note.duration, this.nextNoteTime);
      if (nodes) {
        this.scheduledNodes.push(nodes);
      }

      // Calculate next note time
      const noteDuration = note.duration / 1000; // Convert ms to seconds
      const restDuration = (note.rest || 0) / 1000;
      this.nextNoteTime += noteDuration + restDuration;

      // Move to next note, loop if at end
      this.nextNoteIndex = (this.nextNoteIndex + 1) % this.currentMelody.length;
    }

    // Clean up finished nodes to prevent memory buildup
    this.cleanupFinishedNodes();
  }

  cleanupFinishedNodes() {
    const currentTime = this.audioContext?.currentTime || 0;
    this.scheduledNodes = this.scheduledNodes.filter(node => {
      // Keep nodes that haven't finished yet (rough estimate)
      return node.osc && node.osc.context && currentTime < node.osc.context.currentTime + 2;
    });
  }

  getMelodyForTrack(track) {
    switch (track) {
      case 'A': return MELODY_TYPE_A;
      case 'B': return MELODY_TYPE_B;
      case 'C': return MELODY_TYPE_C;
      default: return null;
    }
  }

  play(track) {
    if (!this.initialized) {
      this.init();
    }
    this.resume();

    const melody = this.getMelodyForTrack(track);
    if (!melody) return;

    // If already playing this track, continue
    if (this.isPlaying && this.currentMelody === melody) {
      return;
    }

    // Stop any existing playback
    this.stop();

    this.currentMelody = melody;
    this.nextNoteIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    this.isPlaying = true;

    // Start scheduling loop
    this.scheduleInterval = setInterval(() => {
      this.scheduleNotes();
    }, this.lookahead * 1000);

    // Schedule initial batch
    this.scheduleNotes();
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    // Stop all scheduled notes
    this.cancelScheduledNotes();
  }

  stop() {
    this.isPlaying = false;

    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    // Stop all scheduled notes
    this.cancelScheduledNotes();

    // Reset position
    this.nextNoteIndex = 0;
    this.currentMelody = null;
  }

  cancelScheduledNotes() {
    const currentTime = this.audioContext?.currentTime || 0;

    this.scheduledNodes.forEach(node => {
      try {
        if (node.osc) {
          node.osc.stop(currentTime);
        }
        if (node.gainNode) {
          node.gainNode.gain.cancelScheduledValues(currentTime);
          node.gainNode.gain.setValueAtTime(0, currentTime);
        }
      } catch (e) {
        // Node may have already stopped
      }
    });

    this.scheduledNodes = [];
  }
}

// Singleton instance
const musicEngine = new MusicEngine();

export function useMusic() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.2);
  const initialized = useRef(false);

  // Initialize on first user interaction
  const init = useCallback(() => {
    if (!initialized.current) {
      musicEngine.init();
      initialized.current = true;
    }
    musicEngine.resume();
  }, []);

  // Auto-init on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      init();
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [init]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      musicEngine.stop();
    };
  }, []);

  const setTrack = useCallback((track) => {
    setCurrentTrack(track);
    if (track && isPlaying) {
      musicEngine.play(track);
    } else if (!track) {
      musicEngine.stop();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const play = useCallback(() => {
    if (currentTrack) {
      init();
      musicEngine.play(currentTrack);
      setIsPlaying(true);
    }
  }, [currentTrack, init]);

  const pause = useCallback(() => {
    musicEngine.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    musicEngine.stop();
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    musicEngine.setVolume(clampedVolume);
  }, []);

  return {
    currentTrack,
    isPlaying,
    volume,
    setTrack,
    play,
    pause,
    stop,
    setVolume,
    init,
  };
}
