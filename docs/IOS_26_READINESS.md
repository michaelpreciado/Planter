# iOS 26 Readiness Notes

Planter is still local-first web app first, but this pass prepares the UI and metadata for iPhone-first testing and eventual App Store packaging.

## Added in this pass

- `viewport-fit=cover` support through Next viewport metadata.
- Apple web app metadata, status bar style, and touch icon hints.
- Safe-area padding classes for Dynamic Island/home indicator layouts.
- Sticky translucent navigation with bottom safe-area padding.
- 44px minimum touch targets for core actions.
- 16px form controls to avoid iOS Safari input zoom.
- Momentum scrolling for chat-like panels.
- Camera capture hints on plant photo uploads.
- Reduced-motion CSS for accessibility/performance.
- PWA manifest additions: app id, scope, orientation, categories, display override.

## App Store path later

1. Keep the local-first web core stable.
2. Reintroduce a native shell only when needed: Capacitor, Expo, or Swift wrapper.
3. Add native permissions copy for camera/photos/notifications.
4. Add local notification scheduling for care reminders.
5. Add encrypted export/import before online sync.
6. Add sync as an optional adapter, not a required account wall.
7. Test on actual devices for safe area, keyboard, image picker, offline launch, memory pressure, and large photo libraries.

## AI engineer showcase angle

This iOS prep demonstrates mobile product engineering discipline: offline-first behavior, privacy-preserving data ownership, installable app ergonomics, and a clear future path to on-device model inference.
