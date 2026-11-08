# SunHap Diwali Lights

A Diwali greeting from SunHap — built with React + Vite. Tap "Light the Diyas" to start an ambient, synthesized soundtrack (drone + bell melody, via the Web Audio API) and a canvas-based fireworks show, then reveals a SunHap-branded Happy Diwali message.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static production bundle to `dist/`, deployable to any static host (Vercel, Netlify, GitHub Pages, S3, etc.).

## Structure

- `src/components/FireworksCanvas.jsx` — rocket + spark particle engine on `<canvas>`
- `src/components/StartStage.jsx` — entry screen that gates the audio behind a user gesture
- `src/components/Greeting.jsx` — SunHap logo, tagline, and the Diwali message
- `src/hooks/useAmbientAudio.js` — Web Audio API ambient music and firework crackle sound effects
