import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getTrackByType,
  INTENSITY_LAYERS,
  INTENSITY_FILTER
} from '../constants/melodies';

// ==========================================
// Voice Channel - Base class for synth voices
// ==========================================
class VoiceChannel {
  constructor(audioContext, destination, type, config) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.type = type;
    this.config = config;
    this.isActive = false;
    this.gainNode = null;
    this.filterNode = null;
    this.scheduledNodes = [];
    this.noteIndex = 0;
    this.nextNoteTime = 0;
    this.volume = 1;
  }

  init() {
    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0;

    // Create filter for this voice
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = this.config.filterType || 'lowpass';
    this.filterNode.frequency.value = this.config.filterFreq || 2000;
    this.filterNode.Q.value = this.config.filterQ || 1;

    // Connect: filter -> gain -> destination
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.destination);
  }

  setVolume(volume, time) {
    this.volume = volume;
    if (this.gainNode) {
      const currentTime = time || this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setTargetAtTime(volume, currentTime, 0.3);
    }
  }

  setFilterCutoff(freq, time) {
    if (this.filterNode) {
      const currentTime = time || this.audioContext.currentTime;
      this.filterNode.frequency.setTargetAtTime(freq, currentTime, 0.3);
    }
  }

  playNote(frequency, duration, startTime) {
    if (!this.audioContext || !frequency) return null;

    const osc = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    osc.type = this.config.oscType || 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Apply detuning for richness (optional)
    if (this.config.detune) {
      osc.detune.setValueAtTime(this.config.detune, startTime);
    }

    // Envelope
    const attack = this.config.attack || 0.01;
    const decay = this.config.decay || 0.1;
    const sustain = this.config.sustain || 0.7;
    const release = this.config.release || 0.1;
    const durationSec = duration / 1000;
    const sustainTime = Math.max(0.01, durationSec - attack - decay - release);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(this.config.noteVolume || 0.3, startTime + attack);
    noteGain.gain.linearRampToValueAtTime((this.config.noteVolume || 0.3) * sustain, startTime + attack + decay);
    noteGain.gain.setValueAtTime((this.config.noteVolume || 0.3) * sustain, startTime + attack + decay + sustainTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

    osc.connect(noteGain);
    noteGain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.1);

    return { osc, noteGain };
  }

  scheduleNotes(melody, currentTime, scheduleAhead, loopDuration) {
    if (!this.isActive || !melody || melody.length === 0) return;

    while (this.nextNoteTime < currentTime + scheduleAhead) {
      const note = melody[this.noteIndex];

      if (note && note.note !== null && note.note !== undefined) {
        const nodes = this.playNote(note.note, note.duration, this.nextNoteTime);
        if (nodes) {
          this.scheduledNodes.push({ ...nodes, stopTime: this.nextNoteTime + note.duration / 1000 });
        }
      }

      // Move to next note
      this.nextNoteTime += note.duration / 1000;
      this.noteIndex = (this.noteIndex + 1) % melody.length;
    }

    // Cleanup old nodes
    this.cleanupNodes(currentTime);
  }

  cleanupNodes(currentTime) {
    this.scheduledNodes = this.scheduledNodes.filter(node => {
      return node.stopTime > currentTime - 1;
    });
  }

  reset(startTime) {
    this.noteIndex = 0;
    this.nextNoteTime = startTime;
  }

  stop() {
    const currentTime = this.audioContext?.currentTime || 0;
    this.scheduledNodes.forEach(node => {
      try {
        if (node.osc) node.osc.stop(currentTime);
        if (node.noteGain) {
          node.noteGain.gain.cancelScheduledValues(currentTime);
          node.noteGain.gain.setValueAtTime(0, currentTime);
        }
      } catch {
        // Node already stopped
      }
    });
    this.scheduledNodes = [];
    this.isActive = false;
  }
}

// ==========================================
// Drum Voice - Specialized for percussion
// ==========================================
class DrumVoice {
  constructor(audioContext, destination) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.gainNode = null;
    this.isActive = false;
    this.noteIndex = 0;
    this.nextNoteTime = 0;
    this.scheduledNodes = [];
    this.volume = 1;
  }

  init() {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(this.destination);
  }

  setVolume(volume, time) {
    this.volume = volume;
    if (this.gainNode) {
      const currentTime = time || this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setTargetAtTime(volume, currentTime, 0.3);
    }
  }

  playKick(startTime) {
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'sine';
    // Pitch envelope: 150Hz -> 50Hz
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.1);

    oscGain.gain.setValueAtTime(0.8, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.gainNode);

    osc.start(startTime);
    osc.stop(startTime + 0.35);

    return { osc, oscGain, stopTime: startTime + 0.35 };
  }

  playSnare(startTime) {
    // Noise component
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 200;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.5, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    // Tonal component (triangle)
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, startTime);
    osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.05);

    const oscGain = this.audioContext.createGain();
    oscGain.gain.setValueAtTime(0.4, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    osc.connect(oscGain);
    oscGain.connect(this.gainNode);

    noise.start(startTime);
    noise.stop(startTime + 0.2);
    osc.start(startTime);
    osc.stop(startTime + 0.15);

    return { noise, osc, noiseGain, oscGain, stopTime: startTime + 0.2 };
  }

  playHihat(startTime) {
    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(startTime);
    noise.stop(startTime + 0.06);

    return { noise, gain, stopTime: startTime + 0.06 };
  }

  scheduleNotes(pattern, currentTime, scheduleAhead) {
    if (!this.isActive || !pattern || pattern.length === 0) return;

    while (this.nextNoteTime < currentTime + scheduleAhead) {
      const hit = pattern[this.noteIndex];

      let nodes = null;
      switch (hit.type) {
        case 'kick':
          nodes = this.playKick(this.nextNoteTime);
          break;
        case 'snare':
          nodes = this.playSnare(this.nextNoteTime);
          break;
        case 'hihat':
          nodes = this.playHihat(this.nextNoteTime);
          break;
      }

      if (nodes) {
        this.scheduledNodes.push(nodes);
      }

      this.nextNoteTime += hit.duration / 1000;
      this.noteIndex = (this.noteIndex + 1) % pattern.length;
    }

    // Cleanup
    this.scheduledNodes = this.scheduledNodes.filter(n => n.stopTime > currentTime - 1);
  }

  reset(startTime) {
    this.noteIndex = 0;
    this.nextNoteTime = startTime;
  }

  stop() {
    const currentTime = this.audioContext?.currentTime || 0;
    this.scheduledNodes.forEach(node => {
      try {
        if (node.osc) node.osc.stop(currentTime);
        if (node.noise) node.noise.stop(currentTime);
        if (node.oscGain) {
          node.oscGain.gain.cancelScheduledValues(currentTime);
          node.oscGain.gain.setValueAtTime(0, currentTime);
        }
        if (node.noiseGain) {
          node.noiseGain.gain.cancelScheduledValues(currentTime);
          node.noiseGain.gain.setValueAtTime(0, currentTime);
        }
        if (node.gain) {
          node.gain.gain.cancelScheduledValues(currentTime);
          node.gain.gain.setValueAtTime(0, currentTime);
        }
      } catch {
        // Already stopped
      }
    });
    this.scheduledNodes = [];
    this.isActive = false;
  }
}

// ==========================================
// Effects Chain - Delay and master processing
// ==========================================
class EffectsChain {
  constructor(audioContext, destination) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.input = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayFilter = null;
    this.limiter = null;
    this.masterGain = null;
  }

  init() {
    // Input gain for voices to connect to
    this.input = this.audioContext.createGain();
    this.input.gain.value = 1;

    // Master limiter (compressor used as limiter)
    this.limiter = this.audioContext.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.1;

    // Master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.25;

    // Delay with filtered feedback
    this.delayNode = this.audioContext.createDelay(1.0);
    this.delayNode.delayTime.value = 0.214; // Quarter note at ~140 BPM

    this.delayFeedback = this.audioContext.createGain();
    this.delayFeedback.gain.value = 0.25;

    this.delayFilter = this.audioContext.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 2000;

    // Delay wet/dry mix
    this.delayWet = this.audioContext.createGain();
    this.delayWet.gain.value = 0.2;

    // Connect delay chain
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFilter.connect(this.delayWet);

    // Connect to output
    this.input.connect(this.limiter);
    this.delayWet.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.destination);
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime,
        0.05
      );
    }
  }

  setDelayTime(bpm) {
    // Quarter note delay time
    const quarterNote = 60 / bpm;
    if (this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(quarterNote, this.audioContext.currentTime, 0.1);
    }
  }

  getInput() {
    return this.input;
  }
}

// ==========================================
// Intensity Manager - Level to layers mapping
// ==========================================
class IntensityManager {
  constructor(voices, drumVoice) {
    this.voices = voices;
    this.drumVoice = drumVoice;
    this.currentLevel = 1;
    this.fadeDuration = 0.5; // seconds to fade layers in/out
  }

  setLevel(level, audioContext) {
    const clampedLevel = Math.min(10, Math.max(1, level));
    if (clampedLevel === this.currentLevel) return;

    const prevLevel = this.currentLevel;
    this.currentLevel = clampedLevel;

    const currentTime = audioContext.currentTime;

    // Get layer configurations
    const prevLayers = INTENSITY_LAYERS[prevLevel] || [];
    const newLayers = INTENSITY_LAYERS[clampedLevel] || [];
    const filterSettings = INTENSITY_FILTER[clampedLevel] || INTENSITY_FILTER[1];

    // Determine which layers to activate/deactivate
    const layersToActivate = newLayers.filter(l => !prevLayers.includes(l));
    const layersToDeactivate = prevLayers.filter(l => !newLayers.includes(l));

    // Activate new layers
    layersToActivate.forEach(layerName => {
      if (layerName === 'drums' && this.drumVoice) {
        this.drumVoice.isActive = true;
        this.drumVoice.setVolume(0.5, currentTime);
      } else if (this.voices[layerName]) {
        this.voices[layerName].isActive = true;
        this.voices[layerName].setVolume(this.getLayerVolume(layerName), currentTime);
      }
    });

    // Deactivate old layers
    layersToDeactivate.forEach(layerName => {
      if (layerName === 'drums' && this.drumVoice) {
        this.drumVoice.setVolume(0, currentTime);
        // Don't set isActive false immediately, let fade happen
        setTimeout(() => { this.drumVoice.isActive = false; }, this.fadeDuration * 1000);
      } else if (this.voices[layerName]) {
        this.voices[layerName].setVolume(0, currentTime);
        setTimeout(() => {
          if (this.voices[layerName]) this.voices[layerName].isActive = false;
        }, this.fadeDuration * 1000);
      }
    });

    // Update filters on active voices
    Object.values(this.voices).forEach(voice => {
      if (voice.isActive) {
        voice.setFilterCutoff(filterSettings.cutoff, currentTime);
      }
    });
  }

  getLayerVolume(layerName) {
    const volumes = {
      bass: 0.6,
      lead: 0.5,
      harmony: 0.3,
      arpeggio: 0.25,
    };
    return volumes[layerName] || 0.3;
  }

  initializeForLevel(level, audioContext) {
    this.currentLevel = level;
    const layers = INTENSITY_LAYERS[level] || ['bass', 'lead'];
    const filterSettings = INTENSITY_FILTER[level] || INTENSITY_FILTER[1];
    const currentTime = audioContext.currentTime;

    // Set up initial state for all voices
    Object.entries(this.voices).forEach(([name, voice]) => {
      const shouldBeActive = layers.includes(name);
      voice.isActive = shouldBeActive;
      if (shouldBeActive) {
        voice.setVolume(this.getLayerVolume(name), currentTime);
        voice.setFilterCutoff(filterSettings.cutoff, currentTime);
      } else {
        voice.setVolume(0, currentTime);
      }
    });

    // Handle drums
    if (this.drumVoice) {
      const drumsActive = layers.includes('drums');
      this.drumVoice.isActive = drumsActive;
      this.drumVoice.setVolume(drumsActive ? 0.5 : 0, currentTime);
    }
  }
}

// ==========================================
// Multi-Layer Music Engine - Orchestrates everything
// ==========================================
class MultiLayerMusicEngine {
  constructor() {
    this.audioContext = null;
    this.effectsChain = null;
    this.voices = {};
    this.drumVoice = null;
    this.intensityManager = null;
    this.initialized = false;
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentTrackData = null;
    this.scheduleInterval = null;
    this.lookahead = 0.1; // 100ms
    this.scheduleAheadTime = 0.2; // 200ms
    this.currentLevel = 1;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create effects chain
      this.effectsChain = new EffectsChain(this.audioContext, this.audioContext.destination);
      this.effectsChain.init();

      const effectsInput = this.effectsChain.getInput();

      // Create voice channels with specific configurations
      this.voices = {
        bass: new VoiceChannel(this.audioContext, effectsInput, 'bass', {
          oscType: 'sine',
          filterType: 'lowpass',
          filterFreq: 200,
          filterQ: 1,
          attack: 0.02,
          decay: 0.1,
          sustain: 0.8,
          release: 0.2,
          noteVolume: 0.5,
        }),
        lead: new VoiceChannel(this.audioContext, effectsInput, 'lead', {
          oscType: 'sawtooth',
          filterType: 'lowpass',
          filterFreq: 3000,
          filterQ: 2,
          attack: 0.01,
          decay: 0.15,
          sustain: 0.6,
          release: 0.15,
          noteVolume: 0.35,
        }),
        harmony: new VoiceChannel(this.audioContext, effectsInput, 'harmony', {
          oscType: 'triangle',
          filterType: 'lowpass',
          filterFreq: 2000,
          filterQ: 0.5,
          attack: 0.3,
          decay: 0.2,
          sustain: 0.7,
          release: 0.5,
          noteVolume: 0.25,
        }),
        arpeggio: new VoiceChannel(this.audioContext, effectsInput, 'arpeggio', {
          oscType: 'square',
          filterType: 'bandpass',
          filterFreq: 1500,
          filterQ: 2,
          attack: 0.005,
          decay: 0.05,
          sustain: 0.3,
          release: 0.05,
          noteVolume: 0.2,
        }),
      };

      // Initialize all voices
      Object.values(this.voices).forEach(voice => voice.init());

      // Create drum voice
      this.drumVoice = new DrumVoice(this.audioContext, effectsInput);
      this.drumVoice.init();

      // Create intensity manager
      this.intensityManager = new IntensityManager(this.voices, this.drumVoice);

      this.initialized = true;
    } catch (err) {
      console.warn('Web Audio API not supported:', err);
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setVolume(volume) {
    if (this.effectsChain) {
      this.effectsChain.setMasterVolume(volume);
    }
  }

  setLevel(level) {
    this.currentLevel = level;
    if (this.intensityManager && this.audioContext && this.isPlaying) {
      this.intensityManager.setLevel(level, this.audioContext);
    }
  }

  getTrackData(track) {
    return getTrackByType(track);
  }

  play(track) {
    if (!this.initialized) {
      this.init();
    }
    this.resume();

    const trackData = this.getTrackData(track);
    if (!trackData) return;

    // If already playing this track, continue
    if (this.isPlaying && this.currentTrack === track) {
      return;
    }

    // Stop current playback
    this.stop();

    this.currentTrack = track;
    this.currentTrackData = trackData;

    // Set delay time based on BPM
    if (this.effectsChain) {
      this.effectsChain.setDelayTime(trackData.bpm);
    }

    // Reset all voice positions
    const startTime = this.audioContext.currentTime;
    Object.values(this.voices).forEach(voice => voice.reset(startTime));
    this.drumVoice.reset(startTime);

    // Initialize intensity for current level
    this.intensityManager.initializeForLevel(this.currentLevel, this.audioContext);

    this.isPlaying = true;

    // Start scheduling loop
    this.scheduleInterval = setInterval(() => {
      this.scheduleNotes();
    }, this.lookahead * 1000);

    // Initial schedule
    this.scheduleNotes();
  }

  scheduleNotes() {
    if (!this.isPlaying || !this.currentTrackData || !this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    const trackData = this.currentTrackData;

    // Schedule each active voice
    if (this.voices.bass.isActive && trackData.bass) {
      this.voices.bass.scheduleNotes(trackData.bass, currentTime, this.scheduleAheadTime);
    }
    if (this.voices.lead.isActive && trackData.lead) {
      this.voices.lead.scheduleNotes(trackData.lead, currentTime, this.scheduleAheadTime);
    }
    if (this.voices.harmony.isActive && trackData.harmony) {
      this.voices.harmony.scheduleNotes(trackData.harmony, currentTime, this.scheduleAheadTime);
    }
    if (this.voices.arpeggio.isActive && trackData.arpeggio) {
      this.voices.arpeggio.scheduleNotes(trackData.arpeggio, currentTime, this.scheduleAheadTime);
    }
    if (this.drumVoice.isActive && trackData.drums) {
      this.drumVoice.scheduleNotes(trackData.drums, currentTime, this.scheduleAheadTime);
    }
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    // Stop all scheduled notes
    Object.values(this.voices).forEach(voice => voice.stop());
    this.drumVoice.stop();
  }

  stop() {
    this.isPlaying = false;

    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    // Stop all voices
    Object.values(this.voices).forEach(voice => voice.stop());
    if (this.drumVoice) this.drumVoice.stop();

    // Reset
    this.currentTrack = null;
    this.currentTrackData = null;
  }
}

// Singleton instance
const musicEngine = new MultiLayerMusicEngine();

// localStorage key for track preference
const STORAGE_KEY = 'tetris-music-track';

// Helper to load saved track preference
function loadSavedTrack() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['A', 'B', 'C'].includes(saved)) {
      return saved;
    }
  } catch {
    console.warn('Failed to load music track from storage');
  }
  return 'A';
}

// Helper to save track preference
function saveTrack(track) {
  try {
    if (track) {
      localStorage.setItem(STORAGE_KEY, track);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    console.warn('Failed to save music track to storage');
  }
}

export function useMusic() {
  const [currentTrack, setCurrentTrackState] = useState(() => loadSavedTrack());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.25);
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
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [init]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      musicEngine.stop();
    };
  }, []);

  const setTrack = useCallback((track) => {
    setCurrentTrackState(track);
    saveTrack(track);
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

  const setLevel = useCallback((level) => {
    musicEngine.setLevel(level);
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
    setLevel,
    init,
  };
}
