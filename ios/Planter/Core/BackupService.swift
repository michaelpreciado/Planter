import Foundation
import SwiftData

enum BackupError: LocalizedError {
    case unsupportedSchema(String)
    case unreadableFile

    var errorDescription: String? {
        switch self {
        case .unsupportedSchema(let schema):
            return "This file isn't a Planter backup this version understands (schema: \(schema))."
        case .unreadableFile:
            return "Couldn't read that file as a Planter backup."
        }
    }
}

@MainActor
enum BackupService {
    // MARK: - Export

    static func exportData(context: ModelContext) throws -> Data {
        let plants = try context.fetch(FetchDescriptor<Plant>(sortBy: [SortDescriptor(\.createdAt)]))
        let messages = try context.fetch(FetchDescriptor<ChatMessage>(sortBy: [SortDescriptor(\.createdAt)]))

        let document = BackupDocument(
            exportedAt: .now,
            plants: plants.map { plant in
                BackupDocument.PlantDTO(
                    id: plant.id,
                    name: plant.name,
                    species: plant.species,
                    location: plant.location,
                    careGoal: plant.careGoal,
                    status: plant.statusRaw,
                    isImportant: plant.isImportant,
                    reminderDays: plant.reminderDays,
                    lastCaredAt: plant.lastCaredAt,
                    createdAt: plant.createdAt,
                    updatedAt: plant.updatedAt,
                    photos: plant.sortedPhotos.map { photo in
                        BackupDocument.PhotoDTO(
                            id: photo.id,
                            imageBase64: photo.imageData.base64EncodedString(),
                            caption: photo.caption,
                            createdAt: photo.createdAt
                        )
                    },
                    notes: plant.sortedNotes.map { note in
                        BackupDocument.NoteDTO(id: note.id, text: note.text, createdAt: note.createdAt)
                    }
                )
            },
            messages: messages.map { message in
                BackupDocument.MessageDTO(
                    id: message.id,
                    role: message.roleRaw,
                    content: message.content,
                    createdAt: message.createdAt,
                    plantID: message.plant?.id
                )
            }
        )

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(document)
    }

    static func suggestedFilename() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return "planter-backup-\(formatter.string(from: .now)).json"
    }

    // MARK: - Import

    /// Replaces the store's contents with the backup's contents.
    static func importData(_ data: Data, context: ModelContext) throws {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let document: BackupDocument
        do {
            document = try decoder.decode(BackupDocument.self, from: data)
        } catch {
            throw BackupError.unreadableFile
        }
        guard document.schema == BackupDocument.currentSchema else {
            throw BackupError.unsupportedSchema(document.schema)
        }

        // Wipe current contents (cascade rules clean up photos/notes).
        let existingPlants = try context.fetch(FetchDescriptor<Plant>())
        for plant in existingPlants {
            ReminderScheduler.cancel(for: plant)
            context.delete(plant)
        }
        for message in try context.fetch(FetchDescriptor<ChatMessage>()) {
            context.delete(message)
        }

        var plantsByID: [UUID: Plant] = [:]
        for dto in document.plants {
            let plant = Plant(
                id: dto.id,
                name: dto.name,
                species: dto.species,
                location: dto.location,
                careGoal: dto.careGoal,
                status: PlantStatus(rawValue: dto.status) ?? .thriving,
                isImportant: dto.isImportant,
                reminderDays: dto.reminderDays,
                lastCaredAt: dto.lastCaredAt,
                createdAt: dto.createdAt
            )
            plant.updatedAt = dto.updatedAt
            context.insert(plant)
            plantsByID[dto.id] = plant

            for photoDTO in dto.photos {
                guard let imageData = Data(base64Encoded: photoDTO.imageBase64) else { continue }
                let photo = PlantPhoto(id: photoDTO.id, imageData: imageData, caption: photoDTO.caption, createdAt: photoDTO.createdAt)
                photo.plant = plant
                context.insert(photo)
            }
            for noteDTO in dto.notes {
                let note = CareNote(id: noteDTO.id, text: noteDTO.text, createdAt: noteDTO.createdAt)
                note.plant = plant
                context.insert(note)
            }
        }

        for messageDTO in document.messages {
            let message = ChatMessage(
                id: messageDTO.id,
                role: ChatMessage.Role(rawValue: messageDTO.role) ?? .assistant,
                content: messageDTO.content,
                createdAt: messageDTO.createdAt,
                plant: messageDTO.plantID.flatMap { plantsByID[$0] }
            )
            context.insert(message)
        }

        try context.save()
        ReminderScheduler.rescheduleAll(Array(plantsByID.values))
    }
}
