import SwiftUI

enum PlantStatus: String, Codable, CaseIterable, Identifiable {
    case thriving
    case watch
    case urgent

    var id: String { rawValue }

    var label: String {
        switch self {
        case .thriving: return "Thriving"
        case .watch: return "Watch"
        case .urgent: return "Needs help"
        }
    }

    var tint: Color {
        switch self {
        case .thriving: return .planterFern
        case .watch: return .planterSun
        case .urgent: return .planterTerra
        }
    }

    var systemImage: String {
        switch self {
        case .thriving: return "leaf.fill"
        case .watch: return "eye.fill"
        case .urgent: return "exclamationmark.triangle.fill"
        }
    }
}
