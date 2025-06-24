# 🌱 Simmys Plant Diary

A beautiful plant care app with a Tamagotchi-style companion to help you nurture your green friends.

## ✨ Features

- 🌿 **Plant Management**: Track your plants with custom names, species, and care schedules
- 💧 **Watering Reminders**: Smart watering frequency tracking with visual indicators
- 📱 **PWA Support**: Install on mobile devices for native app experience
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 📸 **Image Storage**: Capture and store plant photos locally
- 🔄 **Offline First**: Works completely offline with optional cloud sync
- 🌙 **Dark Mode**: Automatic theme switching based on system preferences

## 🚀 Quick Start

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server with live Supabase |
| `pnpm dev:mock` | Start dev server with **local** Supabase emulator |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm build` | Production build |
| `pnpm release` | Trigger semantic-release |

---

### Env Vars

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | (Optional) Service key used by CI |

### Semantic Release Flow

1. Every merge must follow **Conventional Commits** (e.g. `feat: add offline cache`).
2. GitHub Actions CI runs `pnpm release` on `main`.
3. `semantic-release` tags & publishes `vX.Y.Z` and writes to `CHANGELOG.md`.

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run type-check
```

## 📦 Deployment

### Netlify (Recommended)

The project is configured for Netlify deployment with:
- Automatic builds from Git
- Edge functions support
- PWA optimization
- Performance headers

### Environment Variables for Production

Set these in your deployment platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
NEXT_TELEMETRY_DISABLED=1
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (Optional)
- **Storage**: IndexedDB/LocalStorage
- **Animations**: Framer Motion
- **Testing**: Jest + React Testing Library
- **Deployment**: Netlify

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                 # State management (Zustand stores)
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── contexts/           # React contexts
```

## 🎯 Performance Features

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip compression enabled
- **PWA**: Service worker for offline functionality

## 🔒 Security Features

- **CSP Headers**: Content Security Policy implemented
- **XSS Protection**: Built-in XSS protection
- **HTTPS Only**: Secure headers for production
- **Input Validation**: Client and server-side validation
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

## 📞 Support

For support, please open an issue or contact the development team.

## 📸 Storage Configuration

To enable cross-device image sync, create a **private** Storage bucket in Supabase and add a simple RLS policy:

```sql
-- Run in Supabase SQL editor
select storage.create_bucket('plant-images', public := false);

create or replace policy "User can read own images"
  on storage.objects for select
  using (
    bucket_id = 'plant-images' and auth.uid() = (storage_filename::json ->> 'user_id')::uuid
  );
```

Why this works: the bucket stays locked down, but a short-lived **signed URL** acts like a temporary, globally-valid HTTPS link. Each device fetches a fresh URL, so cached or revoked links never break what the user sees.

---

Made with ❤️ for plant lovers everywhere 🌱