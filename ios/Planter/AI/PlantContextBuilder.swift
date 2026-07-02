import Foundation

/// Turns a plant's journal into a compact context block the assistant can
/// ground its answers in. Kept short — the on-device model's context
/// window is small (~4k tokens).
enum PlantContextBuilder {
    static func context(for plant: Plant) -> String {
        var lines: [String] = []
        lines.append("Plant: \(plant.name) (\(plant.species))")
        if !plant.location.isEmpty {
            lines.append("Location in home: \(plant.location)")
        }
        if !plant.careGoal.isEmpty {
            lines.append("Owner's care goal: \(plant.careGoal)")
        }
        lines.append("Current status: \(plant.status.label)")

        if let days = PlantInsights.daysSince(plant.lastCaredAt) {
            lines.append("Last cared for: \(days) day\(days == 1 ? "" : "s") ago")
        } else {
            lines.append("Last cared for: not recorded")
        }
        if plant.reminderDays != nil {
            lines.append("Care reminder: \(PlantInsights.reminderCopy(for: plant))")
        }
        lines.append("Progress photos on file: \(plant.photos.count)")

        let recentNotes = plant.sortedNotes.prefix(3)
        if !recentNotes.isEmpty {
            lines.append("Recent owner notes:")
            for note in recentNotes {
                lines.append("- \(note.text)")
            }
        }
        return lines.joined(separator: "\n")
    }
}
