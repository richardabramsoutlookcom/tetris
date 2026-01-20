import { useState, useEffect, useCallback, useRef } from 'react';

// Standard gamepad button mappings (based on standard gamepad layout)
// https://w3c.github.io/gamepad/#remapping
const GAMEPAD_BUTTONS = {
  0: 'A',           // Bottom button (A on Xbox, X on PlayStation)
  1: 'B',           // Right button (B on Xbox, O on PlayStation)
  2: 'X',           // Left button (X on Xbox, Square on PlayStation)
  3: 'Y',           // Top button (Y on Xbox, Triangle on PlayStation)
  4: 'LB',          // Left bumper
  5: 'RB',          // Right bumper
  6: 'LT',          // Left trigger
  7: 'RT',          // Right trigger
  8: 'Back',        // Back/Select/Share
  9: 'Start',       // Start/Options
  10: 'L3',         // Left stick press
  11: 'R3',         // Right stick press
  12: 'DPadUp',     // D-pad up
  13: 'DPadDown',   // D-pad down
  14: 'DPadLeft',   // D-pad left
  15: 'DPadRight',  // D-pad right
  16: 'Home',       // Home/Guide button
};

// Display names for buttons
export const GAMEPAD_BUTTON_NAMES = {
  A: 'A',
  B: 'B',
  X: 'X',
  Y: 'Y',
  LB: 'LB',
  RB: 'RB',
  LT: 'LT',
  RT: 'RT',
  Back: 'BACK',
  Start: 'START',
  L3: 'L3',
  R3: 'R3',
  DPadUp: 'D-UP',
  DPadDown: 'D-DOWN',
  DPadLeft: 'D-LEFT',
  DPadRight: 'D-RIGHT',
  Home: 'HOME',
  LeftStickUp: 'LS-UP',
  LeftStickDown: 'LS-DOWN',
  LeftStickLeft: 'LS-LEFT',
  LeftStickRight: 'LS-RIGHT',
};

// Default gamepad bindings
export const DEFAULT_GAMEPAD_BINDINGS = {
  moveLeft: ['DPadLeft', 'LeftStickLeft'],
  moveRight: ['DPadRight', 'LeftStickRight'],
  softDrop: ['DPadDown', 'LeftStickDown'],
  hardDrop: ['A'],
  rotateCW: ['B', 'RB'],
  rotateCCW: ['X', 'LB'],
  hold: ['Y'],
  pause: ['Start'],
};

const GAMEPAD_STORAGE_KEY = 'tetris-gamepad-bindings';
const GAMEPAD_STORAGE_VERSION = 2; // Increment to reset user bindings
const STICK_THRESHOLD = 0.5; // Threshold for analog stick to register as direction
const REPEAT_DELAY = 150; // Initial delay before repeat in ms
const REPEAT_RATE = 50; // Repeat interval in ms

export function useGamepad(onAction) {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState(null);
  const [bindings, setBindings] = useState(() => {
    try {
      const savedVersion = localStorage.getItem(GAMEPAD_STORAGE_KEY + '-version');
      if (savedVersion && parseInt(savedVersion, 10) === GAMEPAD_STORAGE_VERSION) {
        const saved = localStorage.getItem(GAMEPAD_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Failed to load gamepad bindings from storage');
    }
    return DEFAULT_GAMEPAD_BINDINGS;
  });

  // Track button/stick states for edge detection and repeat
  const buttonStates = useRef({});
  const repeatTimers = useRef({});
  const animationFrameRef = useRef(null);
  const isPollingRef = useRef(false);

  // Use refs to always have current values in callbacks
  const onActionRef = useRef(onAction);
  const bindingsRef = useRef(bindings);

  // Keep refs updated
  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  // Save bindings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GAMEPAD_STORAGE_KEY, JSON.stringify(bindings));
      localStorage.setItem(GAMEPAD_STORAGE_KEY + '-version', String(GAMEPAD_STORAGE_VERSION));
    } catch (e) {
      console.warn('Failed to save gamepad bindings to storage');
    }
  }, [bindings]);

  // Get action for a gamepad input (uses ref for current bindings)
  const getActionForInput = (input) => {
    for (const [action, inputs] of Object.entries(bindingsRef.current)) {
      if (inputs.includes(input)) {
        return action;
      }
    }
    return null;
  };

  // Update a binding
  const updateBinding = useCallback((action, newInputs) => {
    setBindings((prev) => ({
      ...prev,
      [action]: newInputs,
    }));
  }, []);

  // Reset to defaults
  const resetBindings = useCallback(() => {
    setBindings(DEFAULT_GAMEPAD_BINDINGS);
  }, []);

  // Check if an input is already bound
  const isInputBound = useCallback((input, excludeAction = null) => {
    for (const [action, inputs] of Object.entries(bindings)) {
      if (action !== excludeAction && inputs.includes(input)) {
        return action;
      }
    }
    return null;
  }, [bindings]);

  // Handle button press with repeat support (not a callback - called from polling loop)
  const handleInput = (input, pressed) => {
    const wasPressed = buttonStates.current[input];
    buttonStates.current[input] = pressed;

    if (pressed && !wasPressed) {
      // Button just pressed - get action and fire immediately
      const action = getActionForInput(input);
      if (action && onActionRef.current) {
        onActionRef.current(action);

        // Set up repeat for movement actions
        if (['moveLeft', 'moveRight', 'softDrop'].includes(action)) {
          // Clear any existing timer
          if (repeatTimers.current[input]) {
            clearTimeout(repeatTimers.current[input]);
          }

          // Start repeat after initial delay - capture input in closure
          const capturedInput = input;
          const repeatFn = () => {
            // Check if button is still held
            if (buttonStates.current[capturedInput] && onActionRef.current) {
              // Re-check action in case bindings changed
              const currentAction = getActionForInput(capturedInput);
              if (currentAction) {
                onActionRef.current(currentAction);
              }
              repeatTimers.current[capturedInput] = setTimeout(repeatFn, REPEAT_RATE);
            }
          };
          repeatTimers.current[capturedInput] = setTimeout(repeatFn, REPEAT_DELAY);
        }
      }
    } else if (!pressed && wasPressed) {
      // Button just released - clear repeat timer
      if (repeatTimers.current[input]) {
        clearTimeout(repeatTimers.current[input]);
        delete repeatTimers.current[input];
      }
    }
  };

  // Poll gamepad state - uses refs only, no dependencies needed
  const pollGamepad = () => {
    if (!isPollingRef.current) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0]; // Use first gamepad

    if (gamepad) {
      // Process buttons - use for loop since buttons is array-like, not a true array
      for (let index = 0; index < gamepad.buttons.length; index++) {
        const button = gamepad.buttons[index];
        const buttonName = GAMEPAD_BUTTONS[index];
        if (buttonName && button) {
          const pressed = button.pressed || button.value > 0.5;
          handleInput(buttonName, pressed);
        }
      }

      // Process left stick for movement
      const leftStickX = gamepad.axes[0] || 0;
      const leftStickY = gamepad.axes[1] || 0;

      handleInput('LeftStickLeft', leftStickX < -STICK_THRESHOLD);
      handleInput('LeftStickRight', leftStickX > STICK_THRESHOLD);
      handleInput('LeftStickUp', leftStickY < -STICK_THRESHOLD);
      handleInput('LeftStickDown', leftStickY > STICK_THRESHOLD);
    }

    animationFrameRef.current = requestAnimationFrame(pollGamepad);
  };

  // Gamepad connection handling
  useEffect(() => {
    const handleGamepadConnected = (e) => {
      setGamepadConnected(true);
      setGamepadName(e.gamepad.id);
    };

    const handleGamepadDisconnected = () => {
      setGamepadConnected(false);
      setGamepadName(null);
      // Clear all button states and timers
      buttonStates.current = {};
      Object.values(repeatTimers.current).forEach(clearTimeout);
      repeatTimers.current = {};
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Check if gamepad is already connected
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads[0]) {
      setGamepadConnected(true);
      setGamepadName(gamepads[0].id);
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  // Start/stop polling based on connection
  // Note: We only depend on gamepadConnected, not on the handler.
  // The handler is accessed via onActionRef.current at call time, so changing
  // the handler doesn't restart polling (which would cause race conditions).
  useEffect(() => {
    if (gamepadConnected) {
      // Clear button states when starting polling to avoid stale edge detection
      buttonStates.current = {};
      isPollingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    } else {
      isPollingRef.current = false;
    }

    return () => {
      isPollingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear all repeat timers
      Object.values(repeatTimers.current).forEach(clearTimeout);
      repeatTimers.current = {};
    };
  }, [gamepadConnected]);

  // Function to detect next button press (for remapping)
  const detectNextInput = useCallback(() => {
    return new Promise((resolve, reject) => {
      let detecting = true;
      let initialStates = null;
      let waitingForRelease = true;

      const detectFn = () => {
        if (!detecting) return;

        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];

        if (!gamepad) {
          if (detecting) requestAnimationFrame(detectFn);
          return;
        }

        // First, capture initial state from actual gamepad (not our tracking state)
        if (initialStates === null) {
          initialStates = {};
          for (let i = 0; i < gamepad.buttons.length; i++) {
            const button = gamepad.buttons[i];
            const buttonName = GAMEPAD_BUTTONS[i];
            if (buttonName && button) {
              initialStates[buttonName] = button.pressed || button.value > 0.5;
            }
          }
          const leftStickX = gamepad.axes[0] || 0;
          const leftStickY = gamepad.axes[1] || 0;
          initialStates.LeftStickLeft = leftStickX < -STICK_THRESHOLD;
          initialStates.LeftStickRight = leftStickX > STICK_THRESHOLD;
          initialStates.LeftStickUp = leftStickY < -STICK_THRESHOLD;
          initialStates.LeftStickDown = leftStickY > STICK_THRESHOLD;
        }

        // Wait for all buttons to be released first if any were initially pressed
        if (waitingForRelease) {
          let anyPressed = false;
          for (let i = 0; i < gamepad.buttons.length; i++) {
            const button = gamepad.buttons[i];
            if (button && (button.pressed || button.value > 0.5)) {
              anyPressed = true;
              break;
            }
          }
          const leftStickX = gamepad.axes[0] || 0;
          const leftStickY = gamepad.axes[1] || 0;
          if (Math.abs(leftStickX) > STICK_THRESHOLD || Math.abs(leftStickY) > STICK_THRESHOLD) {
            anyPressed = true;
          }

          if (!anyPressed) {
            waitingForRelease = false;
            // Reset initial states now that everything is released
            initialStates = {};
          }

          if (detecting) requestAnimationFrame(detectFn);
          return;
        }

        // Now detect new button presses
        // Check buttons
        for (let i = 0; i < gamepad.buttons.length; i++) {
          const button = gamepad.buttons[i];
          const buttonName = GAMEPAD_BUTTONS[i];
          if (buttonName && button) {
            const pressed = button.pressed || button.value > 0.5;
            if (pressed) {
              detecting = false;
              resolve(buttonName);
              return;
            }
          }
        }

        // Check sticks
        const leftStickX = gamepad.axes[0] || 0;
        const leftStickY = gamepad.axes[1] || 0;

        if (leftStickX < -STICK_THRESHOLD) {
          detecting = false;
          resolve('LeftStickLeft');
          return;
        }
        if (leftStickX > STICK_THRESHOLD) {
          detecting = false;
          resolve('LeftStickRight');
          return;
        }
        if (leftStickY < -STICK_THRESHOLD) {
          detecting = false;
          resolve('LeftStickUp');
          return;
        }
        if (leftStickY > STICK_THRESHOLD) {
          detecting = false;
          resolve('LeftStickDown');
          return;
        }

        if (detecting) {
          requestAnimationFrame(detectFn);
        }
      };

      requestAnimationFrame(detectFn);

      // Return cancel function (though Promise doesn't use it directly)
      // The KeyBindings component handles cancellation by ignoring the result
    });
  }, []);

  return {
    gamepadConnected,
    gamepadName,
    bindings,
    updateBinding,
    resetBindings,
    isInputBound,
    detectNextInput,
    buttonNames: GAMEPAD_BUTTON_NAMES,
    defaultBindings: DEFAULT_GAMEPAD_BINDINGS,
  };
}
