import Foundation

/// The care-guide assistant used on devices without Apple Intelligence.
/// Answers come from the built-in knowledge base; replies are streamed
/// word by word so the chat feels the same as the on-device model.
@MainActor
final class FallbackAssistant: PlantAssistant {
    let kind: AssistantKind = .fallback

    func streamReply(
        prompt: String,
        plant: Plant?,
        history: [ChatTurn]
    ) -> AsyncThrowingStream<String, Error> {
        let answer = PlantCareKnowledgeBase.answer(prompt: prompt, plant: plant)
        return AsyncThrowingStream { continuation in
            Task {
                var soFar = ""
                for word in answer.split(separator: " ", omittingEmptySubsequences: false) {
                    soFar += soFar.isEmpty ? String(word) : " \(word)"
                    continuation.yield(soFar)
                    try? await Task.sleep(for: .milliseconds(18))
                }
                continuation.finish()
            }
        }
    }
}
