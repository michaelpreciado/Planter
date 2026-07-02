import Foundation
import SwiftData

@Model
final class PlantPhoto {
    @Attribute(.unique) var id: UUID
    @Attribute(.externalStorage) var imageData: Data
    var caption: String
    var createdAt: Date
    var plant: Plant?

    init(id: UUID = UUID(), imageData: Data, caption: String = "", createdAt: Date = .now) {
        self.id = id
        self.imageData = imageData
        self.caption = caption
        self.createdAt = createdAt
    }
}
