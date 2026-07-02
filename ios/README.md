# Planter for iOS

Native SwiftUI app: a local-first plant care journal with photo growth timelines, care reminders, and a private on-device AI assistant (Apple Intelligence when available, built-in care guide everywhere else).

- **Open on a Mac**: `ios/Planter.xcodeproj` with Xcode 26+ → set your team → ⌘R. Full path to the App Store: [`docs/MAC_CHECKLIST.md`](docs/MAC_CHECKLIST.md).
- **Store listing content**: [`docs/APP_STORE_SUBMISSION.md`](docs/APP_STORE_SUBMISSION.md)
- **Privacy policy**: [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)

## Architecture

| Layer | Where | Notes |
|---|---|---|
| UI | `Planter/Views/` | SwiftUI, 3-tab shell (`RootView`), iOS 18+ |
| Data | `Planter/Models/` | SwiftData; photos as external-storage blobs; cascade deletes |
| AI | `Planter/AI/` | `PlantAssistant` protocol; `FoundationModelsAssistant` (iOS 26, the only file importing FoundationModels) + `FallbackAssistant` knowledge base |
| Domain | `Planter/Core/` | health-score heuristics (ported from the web app), image downscaling, reminder scheduling, JSON backup, feature gating for a future Pro tier |
| Theme | `Planter/Theme/` | palette shared with the web app; marigold motif + phulkari/talavera geometry |

The app icon is generated: `python3 scripts/generate_app_icon.py` (requires Pillow).

The web app in the repo root is unchanged and independent.
