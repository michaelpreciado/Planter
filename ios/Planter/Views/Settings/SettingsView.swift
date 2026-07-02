import SwiftData
import SwiftUI
import UserNotifications
import UIKit

struct SettingsView: View {
    @Environment(\.scenePhase) private var scenePhase
    @Query private var plants: [Plant]

    @State private var assistantStatus = AssistantProvider.make().status
    @State private var notificationStatus: UNAuthorizationStatus = .notDetermined

    var body: some View {
        NavigationStack {
            Form {
                assistantSection
                notificationsSection
                BackupSection()
                privacySection
                aboutSection
            }
            .scrollContentBackground(.hidden)
            .background(Color.planterCream)
            .navigationTitle("Settings")
        }
        .task {
            await refreshNotificationStatus()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                assistantStatus = AssistantProvider.make().status
                Task { await refreshNotificationStatus() }
                ReminderScheduler.rescheduleAll(plants)
            }
        }
    }

    private var assistantSection: some View {
        Section {
            HStack(spacing: 10) {
                Image(systemName: assistantStatus.kind == .foundationModels ? "sparkles" : "book.closed.fill")
                    .foregroundStyle(assistantStatus.kind == .foundationModels ? Color.planterMarigold : Color.planterEarth)
                VStack(alignment: .leading, spacing: 3) {
                    Text(assistantStatus.kind == .foundationModels ? "Apple Intelligence" : "Care guide mode")
                        .font(.subheadline.weight(.semibold))
                    Text(assistantStatus.detail)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        } header: {
            Text("Assistant")
        } footer: {
            Text("Every answer is generated on this device. Your questions and plant journal never leave your phone.")
        }
    }

    private var notificationsSection: some View {
        Section {
            HStack {
                Label("Care reminders", systemImage: "bell.fill")
                Spacer()
                Text(notificationStatusLabel)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            if notificationStatus == .denied {
                Button("Open notification settings") {
                    if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
            }
        } header: {
            Text("Notifications")
        } footer: {
            Text("Set a care cadence on any plant and Planter reminds you at 9 AM on the day it's due.")
        }
    }

    private var privacySection: some View {
        Section {
            Label {
                Text("All data stays on this device")
            } icon: {
                Image(systemName: "lock.shield.fill")
                    .foregroundStyle(Color.planterFern)
            }
            Label {
                Text("No accounts, no analytics, no tracking")
            } icon: {
                Image(systemName: "eye.slash.fill")
                    .foregroundStyle(Color.planterFern)
            }
        } header: {
            Text("Privacy")
        } footer: {
            Text("Planter is local-first. The export backup is the only way data leaves the app, and you control where it goes.")
        }
    }

    private var aboutSection: some View {
        Section {
            VStack(spacing: 10) {
                MarigoldMotif(size: 72)
                Text("Planter")
                    .font(.planterTitle(22))
                Text("A plant journal with marigold roots — inspired by the gardens of Punjab and Mexico, where the same flower marks weddings and welcomes home the remembered.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                Text("Version \(appVersion)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }

    private var appVersion: String {
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
        let build = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "1"
        return "\(version) (\(build))"
    }

    private var notificationStatusLabel: String {
        switch notificationStatus {
        case .authorized, .provisional, .ephemeral:
            return "On"
        case .denied:
            return "Off in Settings"
        case .notDetermined:
            return "Asked when you set a reminder"
        @unknown default:
            return "Unknown"
        }
    }

    private func refreshNotificationStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        notificationStatus = settings.authorizationStatus
    }
}
