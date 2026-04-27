# Planter

[![CI](https://github.com/michaelpreciado/Planter/actions/workflows/ci.yml/badge.svg)](https://github.com/michaelpreciado/Planter/actions/workflows/ci.yml)

Planter is a local-first AI botanical journal for tracking plant records, progress photos, care notes, and offline-minded plant-care intelligence.

**Live demo:** https://planter-ekb2f1y8p-michael-preciados-projects.vercel.app  
**Built by:** [Michael Preciado](https://github.com/michaelpreciado) / Preciado Tech

## Why this project matters

Planter is designed as a portfolio-grade product signal: a warm, mobile-first interface backed by practical state management, local data ownership, and AI-ready product thinking. It shows the kind of software I like to build — useful, polished, and grounded in real workflows instead of demo-only AI hype.

## What it does

- Stores local-first plant records in the browser
- Tracks plant name, plant type, location, care goals, and status
- Supports progress photo uploads for each plant
- Generates AI-style care feedback grounded in local plant history
- Highlights plants that need attention with badges and health scoring
- Compares before/after photos for visible progress review
- Supports export/import backups so users own their data
- Includes settings for a future offline model such as Gemma 4 0.8B

## Technical highlights

- **Framework:** Next.js 14 + React 18 + TypeScript
- **State/data:** Zustand-powered local-first plant state
- **UI:** Tailwind CSS, responsive mobile-first layout, botanical visual system
- **Deployment:** Vercel production build with Analytics and Speed Insights
- **Quality gates:** GitHub Actions CI, TypeScript checks, production build validation

## Product case study

### Problem

Plant care often gets scattered across memory, camera rolls, notes apps, and generic reminder tools. That makes it hard to see progress, remember care history, or understand what changed over time.

### Approach

Planter treats each plant like a small living project: profile, notes, status, photos, care history, and eventually local AI guidance. The rebuild intentionally removed legacy auth, sync, and mobile-shell complexity so the core experience could become clean, fast, and easy to reason about.

### What this demonstrates

- Product judgment: reducing scope to the version that actually matters
- Frontend execution: responsive, polished UI that feels app-like
- AI taste: care guidance framed as useful support, not gimmickry
- Systems thinking: data ownership, backups, local-first direction, and maintainable architecture

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

## Roadmap

- Add screenshot/GIF demo above the fold
- Add richer plant timeline and note filtering
- Add offline model experiment for local care suggestions
- Improve accessibility and keyboard navigation
- Explore optional sync without sacrificing local-first ownership

## Direction

This branch intentionally removes the legacy auth, Supabase sync, Capacitor/iOS shell, old routes, and older PWA/service-worker clutter. The app is now a clean slate for the new Planter design system and local-first architecture.
