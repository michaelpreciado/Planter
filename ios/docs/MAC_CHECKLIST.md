# Mac Checklist — from clone to App Store

Ordered steps to take this project from this repo to TestFlight and the App Store. You need: a Mac with **Xcode 26** (the iOS 26 SDK is required for the Apple Intelligence integration) and an **Apple Developer Program** membership ($99/yr, developer.apple.com).

## 1. Open and configure (5 min)

1. Clone the repo and open `ios/Planter.xcodeproj` in Xcode.
2. Select the **Planter** target → **Signing & Capabilities** → set **Team** to your Apple Developer team. Leave "Automatically manage signing" on.
3. Confirm the bundle identifier (`com.mpreciado.planter`) or change it to whatever you registered — remember it must match App Store Connect later.

> **If Xcode refuses to open the project** (it was authored by hand): File → New → Project → iOS App, name it `Planter`, SwiftUI interface, save it anywhere. In the new project, delete the template `Planter` folder reference, then drag this repo's `ios/Planter` folder into the project navigator (it becomes a synchronized folder automatically). Copy the build settings listed in `ios/Planter.xcodeproj/project.pbxproj` (deployment target 18.0, the `INFOPLIST_KEY_*` entries). ~2 minutes, zero source changes.

## 2. First build (10 min)

1. Pick any iPhone Simulator and press **⌘R**.
2. **Expected possible fix-up**: `Planter/AI/FoundationModelsAssistant.swift` is the only file written against the FoundationModels SDK without a compiler to check it. If it has errors, fix them against Xcode's autocomplete (the streaming loop and error-case names are the likely spots). **Nothing else in the app imports FoundationModels**, so all errors will be confined to that one file. Worst case: replace the body of `streamReply` with a non-streaming `session.respond(to:)` call and yield once.
3. Everything else should build clean. If a stray setting complains (e.g. `ITSAppUsesNonExemptEncryption`), delete that line from build settings — it can be answered in App Store Connect instead.

## 3. Functional test pass (30 min)

On the **Simulator** (exercises the fallback AI path — the camera is unavailable there, which is expected):
- [ ] Sample plant appears on first launch
- [ ] Add a plant with a library photo; edit it; delete it
- [ ] Add 2+ photos to a plant → comparison slider appears and drags
- [ ] Add and delete care notes; change status; "Mark cared for" updates the reminder line
- [ ] Assistant tab shows the "Care guide mode" banner; ask about watering/pests/light — answers stream in
- [ ] Scope the chat to a plant — answers mention the plant by name
- [ ] Settings → Export backup → save to Files; delete a plant; Import the backup → plant returns
- [ ] Set a reminder cadence → permission prompt appears (long-term firing is easier to verify on device)

On a **physical iPhone** (connect it, select it as the run target):
- [ ] Camera capture works from Add plant and Add photo
- [ ] On an Apple Intelligence iPhone (15 Pro or newer with AI enabled): Assistant banner says "On-device Apple Intelligence" and answers are model-generated
- [ ] Set a 2-day reminder, then change `lastCaredAt` by marking cared-for and confirm a notification is pending: Xcode → Debug → it's simplest to just set a cadence on a plant that's already overdue — a notification arrives ~30 min later
- [ ] Tap the notification → app opens directly to that plant

Also worth a minute: switch the device to dark mode and skim every screen.

## 4. App Store Connect setup (20 min)

1. appstoreconnect.apple.com → **My Apps** → **+** → New App: iOS, name + bundle ID from `APP_STORE_SUBMISSION.md`, SKU `planter-ios-001`.
2. Fill in metadata, keywords, description, review notes from `APP_STORE_SUBMISSION.md`.
3. Host the privacy policy (see note at the bottom of `PRIVACY_POLICY.md`) and paste the URL.
4. App Privacy section → **Data Not Collected**.

## 5. Archive and upload (15 min)

1. In Xcode: select **Any iOS Device (arm64)** as the destination.
2. **Product → Archive**. When the Organizer opens: **Distribute App → App Store Connect → Upload** (accept defaults; automatic signing handles certificates).
3. Wait for processing (~15 min, email arrives when done).

## 6. TestFlight (recommended, 1–2 days)

1. App Store Connect → TestFlight tab → the build appears after processing.
2. Add yourself + your girlfriend as internal testers (their Apple IDs); they install via the TestFlight app.
3. Live with it for a couple of days — daily-use bugs (reminders, camera, photo sizes) show up fast.

## 7. Screenshots and submit

1. Take the 6 screenshots listed in `APP_STORE_SUBMISSION.md` (Simulator: **⌘S** saves to Desktop).
2. Upload to the version page, select the build, **Submit for Review**.
3. Typical review time is 1–2 days. If rejected, the review notes in `APP_STORE_SUBMISSION.md` address the likely questions — reply in Resolution Center and resubmit.

## Ongoing

- Ship updates by bumping **Version** (marketing) and letting Xcode manage build numbers, then repeat steps 5–7.
- When you're ready to monetize, see "Future monetization" in `APP_STORE_SUBMISSION.md`.
