# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**None detected.**

This is a standalone client-side application with no external API integrations.

## Data Storage

**Databases:**
- None - No backend or database connectivity

**File Storage:**
- None - No file uploads or downloads

**Caching:**
- None - No external caching services

**Local Storage:**
- Browser localStorage for key bindings
  - Key: `tetris-keybindings`
  - Location: `tetris-app/src/hooks/useKeyBindings.js`
  - Data: JSON object mapping actions to key arrays
  - Example:
    ```json
    {
      "moveLeft": ["ArrowLeft"],
      "moveRight": ["ArrowRight"],
      "softDrop": ["ArrowDown"],
      "hardDrop": [" "],
      "rotateCW": ["ArrowUp", "x", "X"],
      "rotateCCW": ["z", "Z"],
      "hold": ["Shift"],
      "pause": ["p", "P"]
    }
    ```

## Authentication & Identity

**Auth Provider:**
- None - No user authentication required

## Monitoring & Observability

**Error Tracking:**
- None - Errors go to browser console only

**Logs:**
- `console.warn()` for non-critical issues (e.g., localStorage failures, Web Audio unavailable)
- No structured logging

**Analytics:**
- None

## CI/CD & Deployment

**Hosting:**
- Not configured
- Application builds to static files (`dist/` directory)
- Can be hosted on any static file server (Netlify, Vercel, GitHub Pages, etc.)

**CI Pipeline:**
- None configured

## Environment Configuration

**Required env vars:**
- None

**Optional env vars:**
- None

**Secrets:**
- None required

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs (Local Integrations)

**Web Audio API:**
- Purpose: Procedural sound effect generation
- Location: `tetris-app/src/hooks/useSound.js`
- Initialization: Lazy, on first user interaction (click/keydown)
- Features:
  - OscillatorNode for tone generation
  - GainNode for volume control and envelopes
  - Multiple waveforms: square, sine, triangle, sawtooth
- Fallback: Silent operation if unsupported

**Canvas 2D API:**
- Purpose: Animated starfield background
- Location: `tetris-app/src/components/Starfield.jsx`
- Uses: `requestAnimationFrame` for smooth animation

**localStorage API:**
- Purpose: Persist user key binding preferences
- Location: `tetris-app/src/hooks/useKeyBindings.js`
- Fallback: Default bindings if storage fails

**Keyboard Events:**
- Purpose: Game controls
- Location: `tetris-app/src/components/Game.jsx`
- Uses: `window.addEventListener('keydown', ...)`

## Third-Party Libraries

**None with external connectivity.**

All npm dependencies are build-time or client-side only:
- React/React-DOM: UI rendering
- Vite: Development and bundling
- ESLint: Code linting

No libraries make network requests or integrate with external services.

## Network Activity

**Development:**
- Vite dev server (localhost only)
- HMR WebSocket connection (localhost only)

**Production:**
- Zero network requests
- Fully offline-capable once loaded

---

*Integration audit: 2026-01-17*
