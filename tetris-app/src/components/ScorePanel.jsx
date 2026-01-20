import './ScorePanel.css';

export function ScorePanel({ score, lines, level }) {
  return (
    <div className="score-panel">
      <div className="score-item">
        <label>SCORE</label>
        <div className="score-value">{score.toLocaleString()}</div>
      </div>
      <div className="score-item">
        <label>LINES</label>
        <div className="score-value">{lines}</div>
      </div>
      <div className="score-item level">
        <label>LEVEL</label>
        <div className="score-value">{level}</div>
      </div>
    </div>
  );
}
