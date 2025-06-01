# Plant Tracker 🌱

A beautiful React Native app for tracking your plants with a cute Tamagotchi-style interface. Built with Expo, TypeScript, and NativeWind.

## Features

- 🌿 **Beautiful UI**: Pixel-perfect recreation of the Plant Tracker mockup
- 🎨 **Customizable**: Change your Tamagotchi's color and toggle dark mode
- 📱 **Cross-platform**: iOS, Android, and Web (PWA) support
- ⚡ **60fps Performance**: Smooth animations with Moti and Reanimated
- 🎯 **Modern Stack**: Expo 50+, React Navigation v6, NativeWind, TypeScript

## Tech Stack

- **Expo SDK 50+** with EAS build profile
- **React Native 0.73+** with TypeScript strict mode
- **React Navigation v6** (Drawer + Bottom Tabs)
- **NativeWind** for utility-first styling
- **React Native SVG** + **Moti** for animations
- **Expo Vector Icons** (Ionicons)
- **React Hook Form** for form management
- **AsyncStorage** for local persistence
- **Supabase** (ready for backend integration)

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd plant-tracker

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Different Platforms

```bash
# iOS Simulator
npm run ios

# Android Emulator  
npm run android

# Web Browser
npm run web
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS (first time only)
eas login
eas build:configure

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build for both platforms
npm run build:all
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── TamagotchiBlob.tsx    # Animated SVG character
│   └── IconButton.tsx        # Touchable icon component
├── context/            # React Context providers
│   └── ThemeContext.tsx     # Theme & settings management
├── navigation/         # Navigation configuration
│   ├── RootNavigator.tsx    # Drawer navigator
│   └── HomeStackNavigator.tsx # Bottom tabs
├── screens/           # Main app screens
│   ├── HomeScreen.tsx       # Main screen with Tamagotchi
│   ├── ListScreen.tsx       # Plant list (TODO)
│   ├── AddPlantModal.tsx    # Add plant form
│   └── SettingsScreen.tsx   # App settings
└── types/             # TypeScript type definitions
```

## Design Tokens

The app uses consistent design tokens defined in `tailwind.config.js`:

```css
--color-bg: #FFFFFF
--color-primary: #4CAF50
--color-primary-light: #A5D6A7  
--color-text: #000000
--font-heading: "SF Pro Rounded"
--font-body: "SF Pro Text"
```

## Development

### Code Quality

```bash
# Lint TypeScript files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

### Git Hooks

The project uses Husky for pre-commit hooks:

- **ESLint**: Checks for code quality issues
- **Prettier**: Ensures consistent formatting
- **TypeScript**: Validates type safety

## TODOs & Stretch Goals

### Core Features (TODO)
- [ ] Plant data persistence with Supabase
- [ ] Plant list with CRUD operations  
- [ ] Watering log functionality
- [ ] Plant care reminders

### Stretch Goals (Commented Code Available)
- [ ] Lottie watering animations
- [ ] Push notifications with `expo-notifications`
- [ ] Offline mode with SQLite + Drizzle ORM
- [ ] Plant identification via camera
- [ ] Social features (share plants)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by modern plant care apps
- Tamagotchi character design with React Native SVG
- Built with ❤️ using Expo and React Native