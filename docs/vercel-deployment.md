# Vercel Deployment Guide

This project is configured for Vercel-first deployment with Next.js App Router.

## 1) Vercel project settings

- Framework Preset: **Next.js**
- Build Command: `npm run build:vercel`
- Install Command: `npm ci`
- Output Directory: leave default (`.next`)

## 2) Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your production URL, e.g. `https://your-project.vercel.app`)
- `NEXT_TELEMETRY_DISABLED=1`

## 3) Performance and caching behavior

The app is configured to:

- Serve immutable cache headers for static assets.
- Keep service worker requests revalidated.
- Use AVIF/WebP formats via Next.js image optimization.
- Enable production compression.

## 4) Pre-deploy checks

Run locally before deploying:

```bash
npm run lint
npm run type-check
npm run build:vercel
```

## 5) Optional static export mode

If you are generating an export bundle for Capacitor/offline builds:

```bash
NEXT_STATIC_EXPORT=true npm run build:static
```

This is separate from the standard Vercel runtime build.
