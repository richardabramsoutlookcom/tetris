import './MusicSelector.css';

export function MusicSelector({ currentTrack, onTrackChange, disabled = false }) {
  const tracks = [
    { id: 'A', label: 'A' },
    { id: 'B', label: 'B' },
    { id: 'C', label: 'C' },
    { id: null, label: 'Off' },
  ];

  return (
    <div className="music-selector">
      <h3>MUSIC</h3>
      <div className="music-track-buttons">
        {tracks.map(track => (
          <button
            key={track.label}
            className={`music-track-btn ${currentTrack === track.id ? 'active' : ''}`}
            onClick={() => onTrackChange(track.id)}
            disabled={disabled}
          >
            {track.label}
          </button>
        ))}
      </div>
    </div>
  );
}
