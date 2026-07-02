import Foundation
import SwiftData

@Model
final class ChatMessage {
    @Attribute(.unique) var id: UUID
    var roleRaw: String
    var content: String
    var createdAt: Date
    var plant: Plant?

    enum Role: String {
        case user
        case assistant
    }

    init(id: UUID = UUID(), role: Role, content: String, createdAt: Date = .now, plant: Plant? = nil) {
        self.id = id
        self.roleRaw = role.rawValue
        self.content = content
        self.createdAt = createdAt
        self.plant = plant
    }

    var role: Role {
        Role(rawValue: roleRaw) ?? .assistant
    }
}
