# Pegasus

**AI-Powered Security Operations Manager**

Pegasus is an AI copilot that manages overnight security operations autonomously — monitoring 24 sites, coordinating guards, handling callouts, and keeping the manager informed. Built for IronWatch Security's Dittmar contract in Arlington, VA.

---

## Features

### Tonight's Board
Real-time site grid with color-coded status cards. Each card shows guard assignment, THERMS check-in status, scan compliance, and live callout banners. Filter by armed sites, active issues, or callouts. Operational metrics bar tracks coverage, check-in rates, and fill times at a glance.

### Pre-Shift Management
ConnectTeams shift confirmations at the top — see who's confirmed and who hasn't responded. Below that: callout history, weekly/8-week distribution charts, cost impact analysis, and response time comparisons (manual vs Pegasus).

### Pegasus AI Chat
Conversational AI copilot powered by Claude. Context-aware suggestions change based on the active view. Full-page mode with thread sidebar for managing multiple conversations — new threads, rename, delete, search across history.

### Callout Cascade
Automated guard outreach with built-in friction before manager escalation. Pegasus contacts the guard first, waits for a response, escalates to the manager if unresponsive, then initiates the cascade. Pattern detection flags repeat offenders.

### Hourly Summaries
Proactive operational status reports every hour — coverage counts, callout updates, compliance rates, and actionable flags. No need to ask — Pegasus keeps you informed.

### THERMS Integration
Scan compliance tracking per guard. Real-time patrol monitoring with checkpoint tracking. Compliance dots on every site card. Late start detection and patrol rate analysis for performance reviews.

---

## Tech Stack

- **React 18** + **TypeScript** — Component architecture with strict types
- **Tailwind CSS** — Utility-first styling with dark mode
- **Vite** — Fast dev server and optimized builds
- **Claude API** — AI-powered operational copilot (Anthropic SDK)
- **Framer Motion** — Smooth animations and transitions
- **Tanstack Query** — Server state management
- **Supabase** — Auth and database

---

## Getting Started

```bash
# Clone
git clone https://github.com/EmanuelTeklu/pegasus.git
cd pegasus

# Install
npm install

# Dev server
npm run dev
```

Create a `.env` file with your keys:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_ANTHROPIC_API_KEY=your_claude_key
```

---

## Screenshots

*Coming soon*

---

## Architecture

```
src/
  components/       UI components (board, pegasus, sidebar, shared)
  pages/            Route-level views (Board, Pre-Shift, Guard Pool, Pegasus)
  contexts/         React contexts (Pegasus AI, Auth)
  hooks/            Custom hooks (data fetching, simulation, THERMS)
  lib/              Core logic (types, data, simulation engine)
```

The simulation engine (`src/lib/simulation.ts`) drives a compressed overnight demo — 10 hours of operations in ~2 minutes. Events fire in sequence with realistic timing, updating site statuses and feeding messages to the Pegasus AI chat.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint with ESLint |

---

## License

MIT

---

Built by [Emanuel Teklu](https://github.com/EmanuelTeklu)
