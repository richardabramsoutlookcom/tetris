import './Leaderboard.css';

export function Leaderboard({ scores, onClose, currentScore = null }) {
  // Pad scores array to always show 10 slots
  const displayScores = [...scores];
  while (displayScores.length < 10) {
    displayScores.push(null);
  }

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <h2>HIGH SCORES</h2>

        <div className="leaderboard-list">
          {displayScores.map((entry, index) => {
            const isCurrentScore = currentScore !== null &&
              entry &&
              entry.score === currentScore.score &&
              entry.initials === currentScore.initials;

            return (
              <div
                key={index}
                className={`leaderboard-row ${isCurrentScore ? 'current' : ''} ${!entry ? 'empty' : ''}`}
              >
                <span className="rank">{index + 1}.</span>
                <span className="initials">{entry ? entry.initials : '---'}</span>
                <span className="score">{entry ? entry.score.toLocaleString() : '---'}</span>
              </div>
            );
          })}
        </div>

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
