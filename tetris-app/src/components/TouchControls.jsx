import { useCallback, useState } from 'react';
import './TouchControls.css';

export function TouchControls({ onLeft, onRight, onDown, onRotate, onHold, onDrop }) {
  const [activeButtons, setActiveButtons] = useState(new Set());

  const handleTouchStart = useCallback((action, buttonId) => (e) => {
    e.preventDefault();
    setActiveButtons(prev => new Set(prev).add(buttonId));
    action();
  }, []);

  const handleTouchEnd = useCallback((buttonId) => (e) => {
    e.preventDefault();
    setActiveButtons(prev => {
      const next = new Set(prev);
      next.delete(buttonId);
      return next;
    });
  }, []);

  const isActive = (buttonId) => activeButtons.has(buttonId);

  return (
    <div className="touch-controls">
      <div className="touch-dpad">
        <button
          className={`dpad-button dpad-up ${isActive('up') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onRotate, 'up')}
          onTouchEnd={handleTouchEnd('up')}
          onTouchCancel={handleTouchEnd('up')}
          aria-label="Rotate"
        >
          <span className="dpad-arrow">&#9650;</span>
        </button>
        <button
          className={`dpad-button dpad-left ${isActive('left') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onLeft, 'left')}
          onTouchEnd={handleTouchEnd('left')}
          onTouchCancel={handleTouchEnd('left')}
          aria-label="Move Left"
        >
          <span className="dpad-arrow">&#9664;</span>
        </button>
        <div className="dpad-center"></div>
        <button
          className={`dpad-button dpad-right ${isActive('right') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onRight, 'right')}
          onTouchEnd={handleTouchEnd('right')}
          onTouchCancel={handleTouchEnd('right')}
          aria-label="Move Right"
        >
          <span className="dpad-arrow">&#9654;</span>
        </button>
        <button
          className={`dpad-button dpad-down ${isActive('down') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onDown, 'down')}
          onTouchEnd={handleTouchEnd('down')}
          onTouchCancel={handleTouchEnd('down')}
          aria-label="Soft Drop"
        >
          <span className="dpad-arrow">&#9660;</span>
        </button>
      </div>

      <div className="touch-actions">
        <button
          className={`action-button action-hold ${isActive('hold') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onHold, 'hold')}
          onTouchEnd={handleTouchEnd('hold')}
          onTouchCancel={handleTouchEnd('hold')}
          aria-label="Hold Piece"
        >
          HOLD
        </button>
        <button
          className={`action-button action-drop ${isActive('drop') ? 'active' : ''}`}
          onTouchStart={handleTouchStart(onDrop, 'drop')}
          onTouchEnd={handleTouchEnd('drop')}
          onTouchCancel={handleTouchEnd('drop')}
          aria-label="Hard Drop"
        >
          DROP
        </button>
      </div>
    </div>
  );
}
