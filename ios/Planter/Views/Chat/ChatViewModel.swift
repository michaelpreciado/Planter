import Foundation
import SwiftData
import SwiftUI

@Observable
@MainActor
final class ChatViewModel {
    private(set) var assistant: PlantAssistant
    private(set) var status: AssistantStatus

    /// Cumulative text of the reply currently being streamed, shown as an
    /// in-progress bubble until it's persisted as a ChatMessage.
    var inFlightReply: String?
    var isResponding = false

    init() {
        let made = AssistantProvider.make()
        assistant = made.assistant
        status = made.status
    }

    /// Availability can change (model download finishes, setting toggled),
    /// so re-pick the assistant when the app foregrounds.
    func refreshAvailability() {
        guard !isResponding else { return }
        let made = AssistantProvider.make()
        assistant = made.assistant
        status = made.status
    }

    func prewarm() {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *), let fmAssistant = assistant as? FoundationModelsAssistant {
            fmAssistant.prewarm()
        }
        #endif
    }

    func send(prompt: String, plant: Plant?, history: [ChatMessage], context: ModelContext) {
        let text = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isResponding else { return }

        let userMessage = ChatMessage(role: .user, content: text, plant: plant)
        context.insert(userMessage)

        let turns = history.suffix(10).map { message in
            ChatTurn(role: message.role == .user ? .user : .assistant, content: message.content)
        }

        isResponding = true
        inFlightReply = ""

        Task {
            var finalText = ""
            do {
                let stream = assistant.streamReply(prompt: text, plant: plant, history: Array(turns))
                for try await snapshot in stream {
                    finalText = snapshot
                    inFlightReply = snapshot
                }
            } catch {
                finalText = "Something went wrong while answering. Try again in a moment."
            }
            if finalText.isEmpty {
                finalText = "I didn't manage to come up with an answer — try rephrasing the question."
            }
            let reply = ChatMessage(role: .assistant, content: finalText, plant: plant)
            context.insert(reply)
            inFlightReply = nil
            isResponding = false
        }
    }
}
