import { getKeyDisplayName } from '../hooks/useKeyBindings';
import './Controls.css';

export function Controls({ bindings }) {
  const formatKeys = (keys) => {
    if (!keys || keys.length === 0) return '-';
    return keys.slice(0, 2).map(getKeyDisplayName).join(' / ');
  };

  return (
    <div className="controls-panel">
      <h3>CONTROLS</h3>
      <div className="control-list">
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.moveLeft)} {formatKeys(bindings?.moveRight)}</span>
          <span className="action">Move</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.rotateCW)}</span>
          <span className="action">Rotate CW</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.rotateCCW)}</span>
          <span className="action">Rotate CCW</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.softDrop)}</span>
          <span className="action">Soft Drop</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.hardDrop)}</span>
          <span className="action">Hard Drop</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.hold)}</span>
          <span className="action">Hold</span>
        </div>
        <div className="control-item">
          <span className="key">{formatKeys(bindings?.pause)}</span>
          <span className="action">Pause</span>
        </div>
      </div>
    </div>
  );
}
