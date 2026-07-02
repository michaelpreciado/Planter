import Foundation

/// JSON backup schema. Photos are embedded as base64 so a single file
/// carries the whole journal. Dates are ISO-8601.
struct BackupDocument: Codable {
    static let currentSchema = "planter.local.v3"

    var schema: String = BackupDocument.currentSchema
    var exportedAt: Date
    var plants: [PlantDTO]
    var messages: [MessageDTO]

    struct PlantDTO: Codable {
        var id: UUID
        var name: String
        var species: String
        var location: String
        var careGoal: String
        var status: String
        var isImportant: Bool
        var reminderDays: Int?
        var lastCaredAt: Date?
        var createdAt: Date
        var updatedAt: Date
        var photos: [PhotoDTO]
        var notes: [NoteDTO]
    }

    struct PhotoDTO: Codable {
        var id: UUID
        var imageBase64: String
        var caption: String
        var createdAt: Date
    }

    struct NoteDTO: Codable {
        var id: UUID
        var text: String
        var createdAt: Date
    }

    struct MessageDTO: Codable {
        var id: UUID
        var role: String
        var content: String
        var createdAt: Date
        var plantID: UUID?
    }
}
