import Foundation

struct ChatTurn {
    enum Role {
        case user
        case assistant
    }

    let role: Role
    let content: String
}

enum AssistantKind {
    case foundationModels
    case fallback
}

struct AssistantStatus {
    let kind: AssistantKind
    /// User-facing explanation shown in the chat banner.
    let detail: String
}

/// Streams cumulative response snapshots (not deltas): each yielded value
/// is the full text so far. That matches how Apple's FoundationModels
/// streams partials, and the fallback mimics it, so the chat UI simply
/// replaces the in-flight bubble's text on every yield.
///
/// Implementations must read everything they need from `plant`
/// synchronously, before any await, since it is a SwiftData model
/// owned by the main actor.
@MainActor
protocol PlantAssistant: AnyObject {
    var kind: AssistantKind { get }

    func streamReply(
        prompt: String,
        plant: Plant?,
        history: [ChatTurn]
    ) -> AsyncThrowingStream<String, Error>
}
