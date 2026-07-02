import Foundation

#if canImport(FoundationModels)
import FoundationModels

/// On-device AI via Apple's FoundationModels framework (Apple Intelligence).
/// This is the ONLY file in the app that imports FoundationModels — if the
/// SDK's API differs from what's written here, fix it in this file alone
/// against Xcode's autocomplete; nothing else depends on these symbols.
@available(iOS 26.0, *)
@MainActor
final class FoundationModelsAssistant: PlantAssistant {
    let kind: AssistantKind = .foundationModels

    private var session: LanguageModelSession?
    /// The plant the current session was grounded in; a new scope gets a fresh session.
    private var sessionPlantID: UUID?

    private static let personaInstructions = """
    You are Planter's on-device plant-care companion. You help the owner keep \
    a photo journal of their houseplants and give practical care advice.

    Style: warm, concise, and concrete. Suggest observable checks the owner \
    can do right now (feel the soil, look under leaves, compare photos), not \
    generic filler. Use short paragraphs or tight bullet lists.

    Safety: never assert a pest or disease diagnosis with certainty from a \
    description alone — say what to look for to confirm. If a plant may be \
    toxic to pets or children, mention it. Politely decline questions \
    unrelated to plants and gardening.
    """

    func streamReply(
        prompt: String,
        plant: Plant?,
        history: [ChatTurn]
    ) -> AsyncThrowingStream<String, Error> {
        // Read everything from the SwiftData model before any await.
        let context = plant.map { PlantContextBuilder.context(for: $0) }
        let plantID = plant?.id
        let fullPrompt = Self.composePrompt(prompt: prompt, context: context)

        return AsyncThrowingStream { continuation in
            Task { [weak self] in
                guard let self else {
                    continuation.finish()
                    return
                }
                do {
                    let session = self.currentSession(for: plantID)
                    let stream = session.streamResponse(to: fullPrompt)
                    for try await partial in stream {
                        continuation.yield(String(describing: partial.content))
                    }
                    continuation.finish()
                } catch let error as LanguageModelSession.GenerationError {
                    switch error {
                    case .exceededContextWindowSize:
                        // Conversation grew past the model's window: start a
                        // fresh session and retry this prompt once.
                        self.session = nil
                        do {
                            let session = self.currentSession(for: plantID)
                            let stream = session.streamResponse(to: fullPrompt)
                            for try await partial in stream {
                                continuation.yield(String(describing: partial.content))
                            }
                            continuation.finish()
                        } catch {
                            continuation.yield(Self.apologyMessage)
                            continuation.finish()
                        }
                    case .guardrailViolation:
                        continuation.yield(
                            "I can't help with that one — I'm best at plant care. Ask me about watering, light, pests, or anything in your plant journal. 🌱"
                        )
                        continuation.finish()
                    default:
                        continuation.yield(Self.apologyMessage)
                        continuation.finish()
                    }
                } catch {
                    continuation.yield(Self.apologyMessage)
                    continuation.finish()
                }
            }
        }
    }

    /// Warm up the model so the first reply doesn't pay the load cost.
    func prewarm() {
        currentSession(for: sessionPlantID).prewarm()
    }

    private func currentSession(for plantID: UUID?) -> LanguageModelSession {
        if let session, sessionPlantID == plantID {
            return session
        }
        let newSession = LanguageModelSession(instructions: Self.personaInstructions)
        session = newSession
        sessionPlantID = plantID
        return newSession
    }

    private static func composePrompt(prompt: String, context: String?) -> String {
        guard let context else { return prompt }
        return """
        Here is the owner's journal for the plant this question is about:

        \(context)

        Owner's question: \(prompt)
        """
    }

    private static let apologyMessage =
        "Something went wrong on my end while thinking about that. Try asking again in a moment."
}
#endif
