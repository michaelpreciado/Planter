import SwiftData
import SwiftUI
import UserNotifications

@main
struct PlanterApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var router = AppRouter()

    let container: ModelContainer

    init() {
        do {
            container = try ModelContainer(
                for: Plant.self, PlantPhoto.self, CareNote.self, ChatMessage.self
            )
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(router)
                .onAppear {
                    appDelegate.router = router
                    SeedData.insertIfNeeded(context: container.mainContext)
                }
        }
        .modelContainer(container)
    }
}

/// Hosts the notification-center delegate so watering reminders can
/// present in the foreground and deep-link to a plant when tapped.
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    var router: AppRouter?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        return true
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        if let idString = response.notification.request.content.userInfo["plantID"] as? String,
           let plantID = UUID(uuidString: idString) {
            DispatchQueue.main.async { [weak self] in
                self?.router?.openPlant(id: plantID)
            }
        }
        completionHandler()
    }
}
