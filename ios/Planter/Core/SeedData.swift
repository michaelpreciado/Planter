import Foundation
import SwiftData

/// Inserts one sample plant on first launch so the garden never starts
/// as a blank screen. The flag lives in UserDefaults, not the store, so
/// deleting the sample plant doesn't resurrect it.
enum SeedData {
    private static let seededKey = "planter.hasSeededSampleData"

    static func insertIfNeeded(context: ModelContext) {
        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: seededKey) else { return }
        defaults.set(true, forKey: seededKey)

        let plant = Plant(
            name: "Monstera Scout",
            species: "Monstera deliciosa",
            location: "Morning window",
            careGoal: "Track new leaf unfurling, rotate weekly, and avoid watering before the top soil dries.",
            reminderDays: 7
        )
        context.insert(plant)

        let note = CareNote(text: "This is a sample plant — swipe or use Edit to delete it, then add your own. 🌱")
        note.plant = plant
        context.insert(note)
    }
}
