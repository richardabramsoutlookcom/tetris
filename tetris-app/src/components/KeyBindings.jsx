import { useState, useEffect, useCallback } from 'react';
import { getKeyDisplayName } from '../hooks/useKeyBindings';
import { GAMEPAD_BUTTON_NAMES } from '../hooks/useGamepad';
import './KeyBindings.css';

export function KeyBindings({
  bindings,
  updateBinding,
  resetBindings,
  isKeyBound,
  actionLabels,
  onClose,
  // Gamepad props (optional)
  gamepadConnected = false,
  gamepadName = null,
  gamepadBindings = null,
  updateGamepadBinding = null,
  resetGamepadBindings = null,
  isGamepadInputBound = null,
  detectNextInput = null,
}) {
  const [activeTab, setActiveTab] = useState('keyboard');
  const [editingAction, setEditingAction] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [pendingKey, setPendingKey] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [detectingGamepad, setDetectingGamepad] = useState(false);

  const hasGamepadSupport = gamepadBindings && updateGamepadBinding && resetGamepadBindings;

  // Get display name for gamepad input
  const getGamepadDisplayName = (input) => {
    return GAMEPAD_BUTTON_NAMES[input] || input;
  };

  const handleKeyCapture = useCallback((e) => {
    if (!editingAction || activeTab !== 'keyboard') return;

    e.preventDefault();
    e.stopPropagation();

    const key = e.key;

    // Ignore certain keys
    if (['Escape', 'Enter'].includes(key)) {
      if (key === 'Escape') {
        setEditingAction(null);
        setEditingIndex(null);
        setPendingKey(null);
        setConflict(null);
      }
      return;
    }

    // Check for conflicts
    const conflictAction = isKeyBound(key, editingAction);
    if (conflictAction) {
      setConflict({ key, action: conflictAction });
      setPendingKey(key);
      return;
    }

    // Apply the binding
    applyKeyboardBinding(key);
  }, [editingAction, activeTab, isKeyBound]);

  const applyKeyboardBinding = (key) => {
    const currentKeys = [...bindings[editingAction]];

    if (editingIndex !== null && editingIndex < currentKeys.length) {
      // Replacing existing key
      currentKeys[editingIndex] = key;
    } else {
      // Adding new key
      if (!currentKeys.includes(key)) {
        currentKeys.push(key);
      }
    }

    updateBinding(editingAction, currentKeys);
    setEditingAction(null);
    setEditingIndex(null);
    setPendingKey(null);
    setConflict(null);
  };

  const applyGamepadBinding = (input) => {
    if (!gamepadBindings || !updateGamepadBinding) return;

    const currentInputs = [...gamepadBindings[editingAction]];

    if (editingIndex !== null && editingIndex < currentInputs.length) {
      currentInputs[editingIndex] = input;
    } else {
      if (!currentInputs.includes(input)) {
        currentInputs.push(input);
      }
    }

    updateGamepadBinding(editingAction, currentInputs);
    setEditingAction(null);
    setEditingIndex(null);
    setPendingKey(null);
    setConflict(null);
    setDetectingGamepad(false);
  };

  const handleConfirmConflict = () => {
    if (!pendingKey || !conflict) return;

    if (activeTab === 'keyboard') {
      // Remove the key from the conflicting action
      const conflictKeys = bindings[conflict.action].filter(k => k !== pendingKey);
      updateBinding(conflict.action, conflictKeys);
      applyKeyboardBinding(pendingKey);
    } else if (activeTab === 'gamepad' && gamepadBindings && updateGamepadBinding) {
      const conflictInputs = gamepadBindings[conflict.action].filter(i => i !== pendingKey);
      updateGamepadBinding(conflict.action, conflictInputs);
      applyGamepadBinding(pendingKey);
    }
  };

  const handleRemoveKey = (action, index) => {
    if (activeTab === 'keyboard') {
      const currentKeys = [...bindings[action]];
      if (currentKeys.length > 1) {
        currentKeys.splice(index, 1);
        updateBinding(action, currentKeys);
      }
    } else if (activeTab === 'gamepad' && gamepadBindings && updateGamepadBinding) {
      const currentInputs = [...gamepadBindings[action]];
      if (currentInputs.length > 1) {
        currentInputs.splice(index, 1);
        updateGamepadBinding(action, currentInputs);
      }
    }
  };

  const startEditing = async (action, index = null) => {
    setEditingAction(action);
    setEditingIndex(index);
    setPendingKey(null);
    setConflict(null);

    // If gamepad tab and have detection function, start detecting
    if (activeTab === 'gamepad' && detectNextInput && gamepadConnected) {
      setDetectingGamepad(true);
      try {
        const input = await detectNextInput();
        if (input) {
          // Check for conflicts
          const conflictAction = isGamepadInputBound?.(input, action);
          if (conflictAction) {
            setConflict({ key: input, action: conflictAction });
            setPendingKey(input);
            setDetectingGamepad(false);
          } else {
            applyGamepadBinding(input);
          }
        }
      } catch (e) {
        setDetectingGamepad(false);
        setEditingAction(null);
        setEditingIndex(null);
      }
    }
  };

  const cancelEditing = () => {
    setEditingAction(null);
    setEditingIndex(null);
    setPendingKey(null);
    setConflict(null);
    setDetectingGamepad(false);
  };

  useEffect(() => {
    if (editingAction && activeTab === 'keyboard') {
      window.addEventListener('keydown', handleKeyCapture);
      return () => window.removeEventListener('keydown', handleKeyCapture);
    }
  }, [editingAction, activeTab, handleKeyCapture]);

  // Cancel editing when switching tabs
  useEffect(() => {
    cancelEditing();
  }, [activeTab]);

  const handleReset = () => {
    if (activeTab === 'keyboard') {
      resetBindings();
    } else if (activeTab === 'gamepad' && resetGamepadBindings) {
      resetGamepadBindings();
    }
  };

  const currentBindings = activeTab === 'keyboard' ? bindings : gamepadBindings;
  const getDisplayName = activeTab === 'keyboard' ? getKeyDisplayName : getGamepadDisplayName;

  return (
    <div className="keybindings-overlay" onClick={onClose}>
      <div className="keybindings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>CONTROLS</h2>

        {/* Tab buttons */}
        <div className="keybindings-tabs">
          <button
            className={`tab-button ${activeTab === 'keyboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('keyboard')}
          >
            Keyboard
          </button>
          {hasGamepadSupport && (
            <button
              className={`tab-button ${activeTab === 'gamepad' ? 'active' : ''}`}
              onClick={() => setActiveTab('gamepad')}
            >
              Gamepad
              {gamepadConnected && <span className="gamepad-connected-dot" title={gamepadName} />}
            </button>
          )}
        </div>

        {/* Gamepad status */}
        {activeTab === 'gamepad' && (
          <div className={`gamepad-status ${gamepadConnected ? 'connected' : 'disconnected'}`}>
            {gamepadConnected ? (
              <>
                <span className="status-icon">🎮</span>
                <span className="status-text">{gamepadName || 'Controller connected'}</span>
              </>
            ) : (
              <>
                <span className="status-icon">⚠</span>
                <span className="status-text">No controller detected. Connect a controller and press any button.</span>
              </>
            )}
          </div>
        )}

        {currentBindings && (
          <div className="keybindings-list">
            {Object.entries(currentBindings).map(([action, keys]) => (
              <div key={action} className="keybinding-row">
                <span className="action-label">{actionLabels[action]}</span>
                <div className="keys-container">
                  {keys.map((key, index) => (
                    <div key={index} className="key-slot">
                      <button
                        className={`key-button ${editingAction === action && editingIndex === index ? 'editing' : ''} ${activeTab === 'gamepad' ? 'gamepad-button' : ''}`}
                        onClick={() => startEditing(action, index)}
                        disabled={activeTab === 'gamepad' && !gamepadConnected}
                      >
                        {editingAction === action && editingIndex === index
                          ? '...'
                          : getDisplayName(key)}
                      </button>
                      {keys.length > 1 && (
                        <button
                          className="remove-key"
                          onClick={() => handleRemoveKey(action, index)}
                          title="Remove this binding"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {keys.length < 3 && (
                    <button
                      className={`add-key ${editingAction === action && editingIndex === null ? 'editing' : ''}`}
                      onClick={() => startEditing(action, null)}
                      disabled={activeTab === 'gamepad' && !gamepadConnected}
                    >
                      {editingAction === action && editingIndex === null ? '...' : '+'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {conflict && (
          <div className="conflict-warning">
            <p>
              <strong>{getDisplayName(pendingKey)}</strong> is already bound to{' '}
              <strong>{actionLabels[conflict.action]}</strong>
            </p>
            <div className="conflict-buttons">
              <button onClick={handleConfirmConflict}>Replace</button>
              <button onClick={() => { setConflict(null); setPendingKey(null); setDetectingGamepad(false); }}>Cancel</button>
            </div>
          </div>
        )}

        {editingAction && !conflict && (
          <div className="editing-hint">
            {activeTab === 'keyboard' ? (
              <>Press any key to bind... (ESC to cancel)</>
            ) : detectingGamepad ? (
              <>Press any button or move stick... <button className="cancel-detect" onClick={cancelEditing}>Cancel</button></>
            ) : (
              <>Click a button above to rebind</>
            )}
          </div>
        )}

        <div className="keybindings-actions">
          <button className="reset-button" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="close-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
