import { useState, useEffect, useCallback } from 'react';

const DEFAULT_BINDINGS = {
  moveLeft: ['ArrowLeft'],
  moveRight: ['ArrowRight'],
  softDrop: ['ArrowDown'],
  hardDrop: [' '],
  rotateCW: ['ArrowUp', 'x', 'X'],
  rotateCCW: ['z', 'Z'],
  hold: ['Shift'],
  pause: ['p', 'P'],
};

const ACTION_LABELS = {
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  softDrop: 'Soft Drop',
  hardDrop: 'Hard Drop',
  rotateCW: 'Rotate CW',
  rotateCCW: 'Rotate CCW',
  hold: 'Hold Piece',
  pause: 'Pause',
};

const STORAGE_KEY = 'tetris-keybindings';

// Convert key to display name
export const getKeyDisplayName = (key) => {
  const keyMap = {
    ' ': 'SPACE',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Shift': 'SHIFT',
    'Control': 'CTRL',
    'Alt': 'ALT',
    'Enter': 'ENTER',
    'Escape': 'ESC',
    'Backspace': 'BACK',
    'Tab': 'TAB',
  };
  return keyMap[key] || key.toUpperCase();
};

export function useKeyBindings() {
  const [bindings, setBindings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load key bindings from storage');
    }
    return DEFAULT_BINDINGS;
  });

  // Save to localStorage when bindings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
    } catch (e) {
      console.warn('Failed to save key bindings to storage');
    }
  }, [bindings]);

  // Get action for a key press
  const getActionForKey = useCallback((key) => {
    for (const [action, keys] of Object.entries(bindings)) {
      if (keys.includes(key)) {
        return action;
      }
    }
    return null;
  }, [bindings]);

  // Update a binding
  const updateBinding = useCallback((action, newKeys) => {
    setBindings((prev) => ({
      ...prev,
      [action]: newKeys,
    }));
  }, []);

  // Reset to defaults
  const resetBindings = useCallback(() => {
    setBindings(DEFAULT_BINDINGS);
  }, []);

  // Check if a key is already bound to another action
  const isKeyBound = useCallback((key, excludeAction = null) => {
    for (const [action, keys] of Object.entries(bindings)) {
      if (action !== excludeAction && keys.includes(key)) {
        return action;
      }
    }
    return null;
  }, [bindings]);

  return {
    bindings,
    getActionForKey,
    updateBinding,
    resetBindings,
    isKeyBound,
    actionLabels: ACTION_LABELS,
    defaultBindings: DEFAULT_BINDINGS,
  };
}
