import Foundation
import SwiftData

@Model
final class Plant {
    @Attribute(.unique) var id: UUID
    var name: String
    var species: String
    var location: String
    var careGoal: String
    var statusRaw: String
    var isImportant: Bool
    var reminderDays: Int?
    var lastCaredAt: Date?
    var createdAt: Date
    var updatedAt: Date

    @Relationship(deleteRule: .cascade, inverse: \PlantPhoto.plant)
    var photos: [PlantPhoto] = []

    @Relationship(deleteRule: .cascade, inverse: \CareNote.plant)
    var notes: [CareNote] = []

    @Relationship(deleteRule: .nullify, inverse: \ChatMessage.plant)
    var chatMessages: [ChatMessage] = []

    init(
        id: UUID = UUID(),
        name: String,
        species: String,
        location: String = "",
        careGoal: String = "",
        status: PlantStatus = .thriving,
        isImportant: Bool = false,
        reminderDays: Int? = 7,
        lastCaredAt: Date? = nil,
        createdAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.species = species
        self.location = location
        self.careGoal = careGoal
        self.statusRaw = status.rawValue
        self.isImportant = isImportant
        self.reminderDays = reminderDays
        self.lastCaredAt = lastCaredAt
        self.createdAt = createdAt
        self.updatedAt = createdAt
    }

    var status: PlantStatus {
        get { PlantStatus(rawValue: statusRaw) ?? .thriving }
        set {
            statusRaw = newValue.rawValue
            if newValue == .urgent { isImportant = true }
        }
    }

    /// Photos newest-first. SwiftData relationship arrays are unordered.
    var sortedPhotos: [PlantPhoto] {
        photos.sorted { $0.createdAt > $1.createdAt }
    }

    /// Notes newest-first.
    var sortedNotes: [CareNote] {
        notes.sorted { $0.createdAt > $1.createdAt }
    }

    var latestPhoto: PlantPhoto? {
        sortedPhotos.first
    }

    func touch() {
        updatedAt = .now
    }
}
