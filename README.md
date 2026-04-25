# Planter

Planter is being rebuilt as a local-first botanical journal with an offline care companion.

## What this version focuses on

- A warm botanical interface based on the visual prototype
- Local-first plant records stored in the browser
- Plant name, plant type, location, and care goals
- Progress photo uploads for each plant
- AI-style care feedback and follow-up questions grounded in local plant history
- Important badges for plants that need attention
- Settings for a future offline model such as Gemma 4 0.8B

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run type-check
npm run build
```

## Direction

This branch intentionally removes the legacy auth, Supabase sync, Capacitor/iOS shell, old routes, and older PWA/service-worker clutter. The app is now a clean slate for the new Planter design system and local-first architecture.
