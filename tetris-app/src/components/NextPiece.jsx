import { CELL_SIZE } from '../constants/tetrominos';
import './NextPiece.css';

export function NextPiece({ piece }) {
  if (!piece) return null;

  const previewSize = 20;

  return (
    <div className="next-piece-container">
      <h3>NEXT</h3>
      <div className="next-piece-preview">
        {piece.shape.map((row, rowIndex) => (
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
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
