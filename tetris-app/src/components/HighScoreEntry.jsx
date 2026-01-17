import { useState, useCallback } from 'react';
import './HighScoreEntry.css';

export function HighScoreEntry({ score, onSubmit, onCancel }) {
  const [initials, setInitials] = useState('');

  const handleInputChange = useCallback((e) => {
    // Transform to uppercase and limit to 3 characters
    const value = e.target.value.toUpperCase().slice(0, 3);
    setInitials(value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (initials.trim()) {
      onSubmit(initials.trim());
    }
  }, [initials, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && initials.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  }, [initials, handleSubmit]);

  return (
    <div className="highscore-entry-overlay">
      <div className="highscore-entry-modal">
        <h2>NEW HIGH SCORE!</h2>
        <p className="score-display">{score.toLocaleString()}</p>
        <p className="initials-prompt">Enter your initials:</p>
        <input
          type="text"
          className="initials-input"
          value={initials}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={3}
          autoFocus
          placeholder="AAA"
        />
        <div className="highscore-entry-actions">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!initials.trim()}
          >
            Submit
          </button>
          <button className="skip-button" onClick={onCancel}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
