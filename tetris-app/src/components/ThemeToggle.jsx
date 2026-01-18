import './ThemeToggle.css';

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle}>
      {theme === 'gameboy' ? 'DMG' : 'MODERN'}
    </button>
  );
}
