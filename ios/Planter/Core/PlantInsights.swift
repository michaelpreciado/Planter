import Foundation

/// Health-score and reminder heuristics, ported from the web app
/// (src/lib/plant-insights.ts) so both platforms agree on the numbers.
enum PlantInsights {
    static func daysSince(_ date: Date?) -> Int? {
        guard let date else { return nil }
        let seconds = Date.now.timeIntervalSince(date)
        return max(0, Int(seconds / 86_400))
    }

    /// Days until care is due. Negative means overdue. nil when no reminder is set.
    static func nextCareDue(for plant: Plant) -> Int? {
        guard let reminderDays = plant.reminderDays else { return nil }
        let anchor = plant.lastCaredAt ?? plant.createdAt
        let elapsed = daysSince(anchor) ?? 0
        return reminderDays - elapsed
    }

    static func healthScore(for plant: Plant) -> Int {
        var score = 88
        if plant.status == .watch { score -= 14 }
        if plant.status == .urgent { score -= 32 }
        if plant.isImportant { score -= 8 }
        if plant.photos.isEmpty { score -= 10 }
        if plant.photos.count >= 3 { score += 5 }
        if let due = nextCareDue(for: plant), due < 0 {
            score -= min(20, abs(due) * 4)
        }
        if plant.notes.count >= 2 { score += 4 }
        return max(0, min(100, score))
    }

    static func healthLabel(for score: Int) -> String {
        if score >= 82 { return "Stable" }
        if score >= 62 { return "Needs watch" }
        return "High attention"
    }

    static func reminderCopy(for plant: Plant) -> String {
        guard let due = nextCareDue(for: plant) else { return "No reminder set" }
        if due < 0 {
            let days = abs(due)
            return "\(days) day\(days == 1 ? "" : "s") overdue"
        }
        if due == 0 { return "Due today" }
        return "Due in \(due) day\(due == 1 ? "" : "s")"
    }

    /// True when the plant needs the owner's attention right now.
    static func needsAttention(_ plant: Plant) -> Bool {
        if plant.isImportant || plant.status == .urgent { return true }
        if let due = nextCareDue(for: plant), due < 0 { return true }
        return false
    }
}
