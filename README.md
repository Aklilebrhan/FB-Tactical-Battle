# Football Tactical Analysis Board

Web-based football tactical board built with **React**, **TypeScript**, **Tailwind CSS**, and **Konva / React-Konva**.

## Features

- **European Powerhouse Clubs & National Teams** — Preset rosters with authentic kit colors, tactical setups, starting 11 players, and full benches for:
  - **Premier League**: Manchester City, Arsenal, Liverpool, Manchester United, Chelsea
  - **La Liga**: Real Madrid, FC Barcelona, Atlético Madrid
  - **Bundesliga**: Bayern Munich, Borussia Dortmund, Bayer Leverkusen
  - **Serie A**: Inter Milan, AC Milan, Juventus
  - **Ligue 1**: Paris Saint-Germain, Olympique de Marseille, AS Monaco
  - **National Teams**: Spain, England, France, Germany, Portugal, Italy, Netherlands
- **Bench & Tactical Substitutions** — Full benches of real substitutes with 1-click in-game substitutions (swapping starters ⇄ bench players), custom bench player management, and role badges
- **Pitch view** — Full FIFA-style markings with Full / Half pitch toggle
- **Formations** — Instant presets: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2, 4-1-4-1, 4-5-1 (home & away)
- **Drag tokens** — 11 players per team + ball; edit numbers, names, positions, and kit colors
- **Telestration** — Freehand, arrows, dashed run-paths, rectangles, circles, text labels, eraser
- **Undo / Redo** — Full board & substitution history (`Ctrl+Z` / `Ctrl+Y`)
- **Export & Import** — High-resolution PNG download and JSON save/load with frames
- **Responsive canvas** — Drawings stored in pitch coordinates so they survive resize

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build   # production build
npm run preview # preview production build
```

## Deployment

This app is a client-side Single Page Application (SPA). The compiled assets live in `dist/` and can be hosted anywhere for free:

### 1. Vercel (Fastest & Recommended)
- Push code to GitHub / GitLab.
- Go to [vercel.com](https://vercel.com) and import the repository.
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Click **Deploy**!

Or via terminal:
```bash
npx vercel
```

### 2. Netlify (Drag & Drop or Git)
- **Drag & Drop**: Run `npm run build`, then drag the `dist` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Git**: Connect your repository on [netlify.com](https://www.netlify.com) with build command `npm run build` and publish directory `dist`.

### 3. GitHub Pages
A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy tactical board"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository settings, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and deploy the app!

### 4. Docker / Self-Hosted VPS
Build and run the included lightweight Docker container:
```bash
docker build -t tactical-board .
docker run -d -p 80:80 tactical-board
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `V` | Select / move |
| `P` | Freehand |
| `A` | Arrow |
| `D` | Dashed run path |
| `R` | Rectangle |
| `C` | Circle |
| `E` | Eraser |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |

## Project structure

```
src/
  components/     # Pitch, tokens, drawing layer, sidebars
  formations.ts   # Formation slot presets
  hooks/          # Undo/redo history
  types.ts
  utils.ts        # Pitch ↔ stage coordinate helpers
  App.tsx
```
