# DSIP — Daily SIP Investment Engine

A React-based frontend for managing smart daily investment plans (SIP) with AI-assisted execution logic.

## Overview

DSIP lets you configure stock engines, track portfolio performance, and execute smart daily orders based on market conditions. Each stock engine defines an investment strategy with conviction-based allocation across a fixed budget and time horizon.

**Key screens:**

- **Home** — Portfolio overview showing Total Market Value, Invested Capital, Active Engines, Net Yield, and per-engine performance cards with deployment progress.
- **Tracker** — Per-stock execution interface with daily Market Context input (price change %, conviction slider), Engine Configuration details, Live Investment Cycle progress, and an Investment Performance panel.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Radix UI** — accessible component primitives
- **TanStack Query** — server state management
- **React Router v7** — routing

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```
   npm install
   ```

2. Start the dev server:
   ```
   npm run dev
   ```

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
| `npm run format`  | Format with Prettier     |
