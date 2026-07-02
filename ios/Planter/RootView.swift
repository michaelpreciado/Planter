import SwiftData
import SwiftUI

@Observable
final class AppRouter {
    enum Tab: Hashable {
        case garden
        case assistant
        case settings
    }

    var selectedTab: Tab = .garden
    /// Set when a notification tap should push a plant's detail screen.
    var pendingPlantID: UUID?
    /// Set when "Ask assistant about this plant" should pre-scope the chat.
    var chatScopePlantID: UUID?

    func openPlant(id: UUID) {
        selectedTab = .garden
        pendingPlantID = id
    }

    func openChat(scopedTo plantID: UUID?) {
        chatScopePlantID = plantID
        selectedTab = .assistant
    }
}

struct RootView: View {
    @Environment(AppRouter.self) private var router

    var body: some View {
        @Bindable var router = router
        TabView(selection: $router.selectedTab) {
            Tab("Garden", systemImage: "leaf.fill", value: AppRouter.Tab.garden) {
                GardenView()
            }
            Tab("Assistant", systemImage: "bubble.left.and.text.bubble.right.fill", value: AppRouter.Tab.assistant) {
                ChatView()
            }
            Tab("Settings", systemImage: "gearshape.fill", value: AppRouter.Tab.settings) {
                SettingsView()
            }
        }
        .tint(Color.planterMoss)
    }
}
