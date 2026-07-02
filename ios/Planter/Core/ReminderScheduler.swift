import Foundation
import UserNotifications

/// Schedules one local watering reminder per plant. Permission is asked
/// contextually — the first time a cadence is set — never at launch.
enum ReminderScheduler {
    private static func identifier(for plant: Plant) -> String {
        "watering-\(plant.id.uuidString)"
    }

    /// Ask for permission if needed, then schedule. Use when the user
    /// first turns a reminder on.
    static func requestPermissionThenSchedule(for plant: Plant) {
        let plantSnapshot = snapshot(of: plant)
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            guard granted else { return }
            schedule(plantSnapshot)
        }
    }

    /// Re-schedule (or cancel) based on the plant's current state.
    static func reschedule(for plant: Plant) {
        let plantSnapshot = snapshot(of: plant)
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else { return }
            schedule(plantSnapshot)
        }
    }

    static func cancel(for plant: Plant) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(
            withIdentifiers: [identifier(for: plant)]
        )
    }

    /// Sweep every plant, e.g. on foreground or after a backup import.
    static func rescheduleAll(_ plants: [Plant]) {
        for plant in plants {
            reschedule(for: plant)
        }
    }

    // MARK: - Internals

    /// Plain-value copy of what scheduling needs, safe to carry into
    /// notification-center callbacks off the main actor.
    private struct PlantSnapshot {
        let identifier: String
        let name: String
        let careGoal: String
        let plantID: String
        let reminderDays: Int?
        let anchor: Date
    }

    private static func snapshot(of plant: Plant) -> PlantSnapshot {
        PlantSnapshot(
            identifier: identifier(for: plant),
            name: plant.name,
            careGoal: plant.careGoal,
            plantID: plant.id.uuidString,
            reminderDays: plant.reminderDays,
            anchor: plant.lastCaredAt ?? plant.createdAt
        )
    }

    private static func schedule(_ plant: PlantSnapshot) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [plant.identifier])

        guard let reminderDays = plant.reminderDays else { return }

        var dueDate = Calendar.current.date(byAdding: .day, value: reminderDays, to: plant.anchor) ?? .now
        // At 9 AM local on the due day; if that already passed, nudge to
        // the next near-term slot so overdue plants still get a ping.
        var components = Calendar.current.dateComponents([.year, .month, .day], from: dueDate)
        components.hour = 9
        components.minute = 0
        if let atNine = Calendar.current.date(from: components) {
            dueDate = atNine
        }
        if dueDate <= .now {
            dueDate = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
        }

        let content = UNMutableNotificationContent()
        content.title = "🌼 \(plant.name) is due for care"
        content.body = plant.careGoal.isEmpty
            ? "Check the soil and add a progress photo while you're at it."
            : plant.careGoal
        content.sound = .default
        content.userInfo = ["plantID": plant.plantID]

        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: dueDate),
            repeats: false
        )
        let request = UNNotificationRequest(identifier: plant.identifier, content: content, trigger: trigger)
        center.add(request)
    }
}
