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

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/planter.git
cd planter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration (Optional)

The app works fully offline without any configuration. For cloud sync features, create a `.env.local` file:

```bash
# Supabase Configuration (Optional - app works offline without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Build Configuration
NEXT_TELEMETRY_DISABLED=1
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or deploy to Netlify
npm run build:netlify
```

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

---

Made with ❤️ for plant lovers everywhere 🌱