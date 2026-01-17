import { useEffect, useCallback, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { useGameLogic } from '../hooks/useGameLogic';
import { useKeyBindings } from '../hooks/useKeyBindings';
import { useHighScores } from '../hooks/useHighScores';
import { Starfield } from './Starfield';
import { GameBoard } from './GameBoard';
import { NextPiece } from './NextPiece';
import { HoldPiece } from './HoldPiece';
import { ScorePanel } from './ScorePanel';
import { Controls } from './Controls';
import { KeyBindings } from './KeyBindings';
import { HighScoreEntry } from './HighScoreEntry';
import { Leaderboard } from './Leaderboard';
import './Game.css';

export function Game() {
  const sound = useSound();
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastSubmittedScore, setLastSubmittedScore] = useState(null);
  // Track if user has dismissed or submitted the high score entry for this game
  const [highScoreHandled, setHighScoreHandled] = useState(false);

  const {
    bindings,
    getActionForKey,
    updateBinding,
    resetBindings,
    isKeyBound,
    actionLabels,
  } = useKeyBindings();

  const { highScores, isQualifyingScore, addHighScore } = useHighScores();

  const {
    board,
    currentPiece,
    nextPiece,
    heldPiece,
    canHold,
    position,
    score,
    lines,
    level,
    gameOver,
    isPaused,
    isPlaying,
    clearedRows,
    particles,
    movePiece,
    rotatePiece,
    hardDrop,
    softDrop,
    holdPiece,
    startGame: originalStartGame,
    togglePause,
  } = useGameLogic(sound);

  // Derive whether to show high score entry from current state
  // Show if: game over, score qualifies, and user hasn't handled it yet
  const showHighScoreEntry = gameOver && !highScoreHandled && isQualifyingScore(score);

  // Wrap startGame to reset high score state
  const startGame = useCallback(() => {
    setHighScoreHandled(false);
    setLastSubmittedScore(null);
    originalStartGame();
  }, [originalStartGame]);

  // Handle high score submission
  const handleHighScoreSubmit = useCallback((initials) => {
    addHighScore(initials, score);
    setLastSubmittedScore({ initials, score });
    setHighScoreHandled(true);
    setShowLeaderboard(true);
  }, [addHighScore, score]);

  // Handle skipping high score entry
  const handleHighScoreSkip = useCallback(() => {
    setHighScoreHandled(true);
  }, []);

  // Handle showing leaderboard
  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  // Handle closing leaderboard
  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
    setLastSubmittedScore(null);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e) => {
      // Don't handle keys when modals are open
      if (showSettings || showHighScoreEntry || showLeaderboard) return;

      const action = getActionForKey(e.key);

      // Only allow repeat for movement keys
      if (e.repeat && !['moveLeft', 'moveRight', 'softDrop'].includes(action)) {
        return;
      }

      switch (action) {
        case 'moveLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'moveRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'softDrop':
          e.preventDefault();
          softDrop();
          break;
        case 'rotateCW':
          e.preventDefault();
          rotatePiece(1);
          break;
        case 'rotateCCW':
          e.preventDefault();
          rotatePiece(-1);
          break;
        case 'hardDrop':
          e.preventDefault();
          if (isPlaying && !gameOver) {
            hardDrop();
          }
          break;
        case 'hold':
          e.preventDefault();
          holdPiece();
          break;
        case 'pause':
          e.preventDefault();
          togglePause();
          break;
        default:
          // Handle Enter separately (always start/restart)
          if (e.key === 'Enter' && (!isPlaying || gameOver)) {
            e.preventDefault();
            startGame();
          }
          break;
      }
    },
    [showSettings, showHighScoreEntry, showLeaderboard, getActionForKey, movePiece, softDrop, rotatePiece, hardDrop, holdPiece, togglePause, startGame, isPlaying, gameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const openSettings = () => {
    if (isPlaying && !isPaused && !gameOver) {
      togglePause();
    }
    setShowSettings(true);
  };

  return (
    <div className="game-container">
      <Starfield />

      <div className="game-content">
        <header className="game-header">
          <h1>TETRIS</h1>
          <p className="subtitle">Space Edition</p>
        </header>

        <div className="game-layout">
          <div className="left-panel">
            <HoldPiece piece={heldPiece} canHold={canHold} />
            <ScorePanel score={score} lines={lines} level={level} />
          </div>

          <div className="center-panel">
            <GameBoard
              board={board}
              currentPiece={currentPiece}
              position={position}
              clearedRows={clearedRows}
              particles={particles}
            />

            {/* Overlay for start/pause/game over */}
            {(!isPlaying || isPaused || gameOver) && !showHighScoreEntry && (
              <div className="game-overlay">
                {gameOver ? (
                  <div className="overlay-content game-over">
                    <h2>GAME OVER</h2>
                    <p>Final Score: {score.toLocaleString()}</p>
                    <p>Level: {level}</p>
                    <p>Lines: {lines}</p>
                    <button onClick={startGame}>Play Again</button>
                    <button className="secondary-button" onClick={handleShowLeaderboard}>
                      High Scores
                    </button>
                    <p className="hint">or press ENTER</p>
                  </div>
                ) : isPaused ? (
                  <div className="overlay-content paused">
                    <h2>PAUSED</h2>
                    <button onClick={togglePause}>Resume</button>
                    <p className="hint">or press P</p>
                  </div>
                ) : (
                  <div className="overlay-content start">
                    <h2>TETRIS</h2>
                    <p>Space Edition</p>
                    <button onClick={startGame}>Start Game</button>
                    <button className="secondary-button" onClick={handleShowLeaderboard}>
                      High Scores
                    </button>
                    <p className="hint">or press ENTER</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="right-panel">
            <NextPiece piece={nextPiece} />
            <Controls bindings={bindings} />
            <button className="settings-button" onClick={openSettings}>
              ⚙ Key Bindings
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <KeyBindings
          bindings={bindings}
          updateBinding={updateBinding}
          resetBindings={resetBindings}
          isKeyBound={isKeyBound}
          actionLabels={actionLabels}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHighScoreEntry && (
        <HighScoreEntry
          score={score}
          onSubmit={handleHighScoreSubmit}
          onCancel={handleHighScoreSkip}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          scores={highScores}
          onClose={handleCloseLeaderboard}
          currentScore={lastSubmittedScore}
        />
      )}
    </div>
  );
}
