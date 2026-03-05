# IronWatch Dashboard Demo

Security guard management and rapid response dispatch system. Built for property managers overseeing multi-site security operations.

## Features

- **Site Coverage Monitoring** — Real-time view of all properties with guard status (covered, confirming, uncovered)
- **Guard Pool Management** — Track officers by GRS score, armed certification, hours, and availability
- **Call-Out Tracking** — Monitor no-shows, resolution time, and shift fill history
- **AI Cascade System** — Automated ranked outreach when a guard fails to report, with configurable rules (rest rule, overtime cap, armed filter)
- **Live Simulation** — Interactive demo of a complete call-out scenario with cascade resolution

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix primitives)
- TanStack React Query
- Framer Motion
- Recharts

## Getting Started

```sh
npm install
npm run dev
```

Opens at `http://localhost:8080`.

## Project Structure

```
src/
  pages/        # Route-level views (Sites, CallOuts, GuardPool, LiveSim)
  components/   # Layout and shared components
  components/ui # shadcn/ui component library
  hooks/        # Custom React hooks
  lib/          # Data layer, types, utilities
  test/         # Test setup and specs
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint with ESLint |
