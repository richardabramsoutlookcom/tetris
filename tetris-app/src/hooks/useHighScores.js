import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tetris-highscores';
const MAX_SCORES = 10;

export function useHighScores() {
  const [highScores, setHighScores] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load high scores from storage');
    }
    return [];
  });

  // Save to localStorage when highScores change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
    } catch (e) {
      console.warn('Failed to save high scores to storage');
    }
  }, [highScores]);

  // Check if a score qualifies for the leaderboard
  const isQualifyingScore = useCallback((score) => {
    if (score <= 0) return false;
    if (highScores.length < MAX_SCORES) return true;
    return score > highScores[highScores.length - 1].score;
  }, [highScores]);

  // Add a new high score
  const addHighScore = useCallback((initials, score) => {
    const newEntry = {
      initials: initials.toUpperCase().slice(0, 3),
      score,
      date: new Date().toISOString(),
    };

    setHighScores((prev) => {
      const updated = [...prev, newEntry];
      // Sort descending by score
      updated.sort((a, b) => b.score - a.score);
      // Keep only top MAX_SCORES
      return updated.slice(0, MAX_SCORES);
    });
  }, []);

  // Clear all high scores (for testing/settings)
  const clearHighScores = useCallback(() => {
    setHighScores([]);
  }, []);

  return {
    highScores,
    isQualifyingScore,
    addHighScore,
    clearHighScores,
  };
}
