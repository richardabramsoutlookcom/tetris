import './HoldPiece.css';

export function HoldPiece({ piece, canHold }) {
  const previewSize = 20;

  return (
    <div className={`hold-piece-container ${!canHold ? 'used' : ''}`}>
      <h3>HOLD</h3>
      <div className="hold-piece-preview">
        {piece ? (
          piece.shape.map((row, rowIndex) => (
            <div key={rowIndex} className="preview-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`preview-cell ${cell ? 'filled' : ''}`}
                  style={{
                    width: previewSize,
                    height: previewSize,
                    backgroundColor: cell ? piece.color : 'transparent',
                    borderColor: cell ? piece.color : 'transparent',
                    boxShadow: cell
                      ? `0 0 8px ${piece.color}, inset 0 0 6px rgba(255,255,255,0.3)`
                      : 'none',
                    opacity: canHold ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="empty-hold">
            <span>SHIFT</span>
          </div>
        )}
      </div>
    </div>
  );
}
