# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- JavaScript (ES2020+) - All application code, using ES Modules (`"type": "module"`)

**Secondary:**
- CSS3 - Styling with modern features (animations, gradients, transforms)
- HTML5 - Single entry point (`index.html`)

## Runtime

**Environment:**
- Node.js (development only, no runtime specified)
- Browser (production target)

**Package Manager:**
- npm
- Lockfile: `tetris-app/package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.0 - UI framework
  - Uses functional components exclusively
  - React hooks for state management (`useState`, `useCallback`, `useEffect`, `useRef`, `useMemo`)
  - React.memo for component optimization
  - StrictMode enabled in development

**Build/Dev:**
- Vite 7.2.4 - Build tool and dev server
  - Config: `tetris-app/vite.config.js`
  - Plugin: `@vitejs/plugin-react` 5.1.1 (uses Babel for Fast Refresh)
  - Commands:
    - `npm run dev` - Development server with HMR
    - `npm run build` - Production build
    - `npm run preview` - Preview production build

**Linting:**
- ESLint 9.39.1
  - Config: `tetris-app/eslint.config.js` (flat config format)
  - Plugins:
    - `eslint-plugin-react-hooks` 7.0.1
    - `eslint-plugin-react-refresh` 0.4.24
  - Command: `npm run lint`

## Key Dependencies

**Production:**
- `react` 19.2.0 - Core React library
- `react-dom` 19.2.0 - React DOM renderer

**Development:**
- `@types/react` 19.2.5 - TypeScript types (for IDE support only)
- `@types/react-dom` 19.2.3 - TypeScript types (for IDE support only)
- `globals` 16.5.0 - Global variable definitions for ESLint

## Browser APIs Used

**Critical:**
- Web Audio API - Sound generation via `AudioContext`
  - Location: `tetris-app/src/hooks/useSound.js`
  - Synthesized audio (no external sound files)
  - Graceful degradation if unsupported

- Canvas API - Starfield background animation
  - Location: `tetris-app/src/components/Starfield.jsx`
  - Uses `requestAnimationFrame` for rendering

- localStorage - Key binding persistence
  - Location: `tetris-app/src/hooks/useKeyBindings.js`
  - Key: `tetris-keybindings`

## Configuration

**Build Configuration:**
- `tetris-app/vite.config.js` - Minimal config with React plugin
- `tetris-app/eslint.config.js` - ESLint flat config with React rules

**Environment Variables:**
- None required
- No `.env` files present

**TypeScript:**
- Not used (plain JavaScript with JSX)
- Type definitions installed for IDE intellisense only

## Platform Requirements

**Development:**
- Node.js (version not specified, modern LTS recommended)
- npm for package management

**Production:**
- Modern browser with:
  - ES2020 support
  - Web Audio API (optional, for sound)
  - Canvas API (for background effects)
  - localStorage (for settings persistence)

**Deployment:**
- Static file hosting (builds to `dist/` directory)
- No server-side requirements

## Project Structure

```
tetris-app/
├── index.html           # Entry HTML
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── public/              # Static assets
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Root component
│   ├── App.css          # Root styles
│   ├── index.css        # Global styles
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── constants/       # Game constants
└── node_modules/        # Dependencies
```

---

*Stack analysis: 2026-01-17*
