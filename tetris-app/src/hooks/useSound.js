import { useCallback, useRef, useEffect } from 'react';

// Web Audio API sound generator
class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
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

  // Create an oscillator with envelope
  playTone(frequency, duration, type = 'square', attack = 0.01, decay = 0.1) {
    if (!this.initialized) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Play multiple tones in sequence (arpeggio)
  playArpeggio(frequencies, noteDuration = 0.08) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, noteDuration * 2, 'square'), i * noteDuration * 1000);
    });
  }

  // Sound effects
  move() {
    this.playTone(200, 0.05, 'square');
  }

  rotate() {
    this.playTone(400, 0.08, 'sine');
  }

  drop() {
    this.playTone(150, 0.15, 'triangle');
  }

  hardDrop() {
    this.playTone(100, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(80, 0.15, 'sawtooth'), 50);
  }

  lineClear(lines) {
    if (lines === 4) {
      // Tetris! Epic sound
      this.playArpeggio([523, 659, 784, 1047], 0.08);
      setTimeout(() => this.playArpeggio([1047, 1319, 1568, 2093], 0.06), 300);
    } else if (lines >= 2) {
      this.playArpeggio([392, 523, 659], 0.08);
    } else {
      this.playArpeggio([262, 330, 392], 0.06);
    }
  }

  levelUp() {
    this.playArpeggio([523, 659, 784, 880, 1047], 0.1);
  }

  gameOver() {
    this.playArpeggio([440, 392, 349, 330, 294, 262], 0.2);
  }

  pause() {
    this.playTone(300, 0.1, 'sine');
  }
}

const soundEngine = new SoundEngine();

export function useSound() {
  const initialized = useRef(false);

  const init = useCallback(() => {
    if (!initialized.current) {
      soundEngine.init();
      initialized.current = true;
    }
    soundEngine.resume();
  }, []);

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

  return {
    init,
    move: () => soundEngine.move(),
    rotate: () => soundEngine.rotate(),
    drop: () => soundEngine.drop(),
    hardDrop: () => soundEngine.hardDrop(),
    lineClear: (lines) => soundEngine.lineClear(lines),
    levelUp: () => soundEngine.levelUp(),
    gameOver: () => soundEngine.gameOver(),
    pause: () => soundEngine.pause(),
  };
}
