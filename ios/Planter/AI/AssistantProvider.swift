import Foundation

#if canImport(FoundationModels)
import FoundationModels
#endif

/// Picks the best assistant the current device can run: Apple's on-device
/// model when Apple Intelligence is available, the built-in care guide
/// everywhere else. Availability can change (e.g. the model finishes
/// downloading), so callers re-invoke this when the app foregrounds.
@MainActor
enum AssistantProvider {
    static func make() -> (assistant: PlantAssistant, status: AssistantStatus) {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            switch SystemLanguageModel.default.availability {
            case .available:
                return (
                    FoundationModelsAssistant(),
                    AssistantStatus(
                        kind: .foundationModels,
                        detail: "On-device Apple Intelligence — private, works offline."
                    )
                )
            case .unavailable(let reason):
                return (
                    FallbackAssistant(),
                    AssistantStatus(
                        kind: .fallback,
                        detail: fallbackDetail(for: reason)
                    )
                )
            @unknown default:
                break
            }
        }
        #endif
        return (
            FallbackAssistant(),
            AssistantStatus(
                kind: .fallback,
                detail: "Care guide mode — built-in plant knowledge, works on every device."
            )
        )
    }

    #if canImport(FoundationModels)
    @available(iOS 26.0, *)
    private static func fallbackDetail(
        for reason: SystemLanguageModel.Availability.UnavailableReason
    ) -> String {
        switch reason {
        case .deviceNotEligible:
            return "Care guide mode — this device doesn't support Apple Intelligence."
        case .appleIntelligenceNotEnabled:
            return "Care guide mode — enable Apple Intelligence in Settings to unlock on-device AI."
        case .modelNotReady:
            return "Care guide mode — the on-device model is still downloading; it will switch over automatically."
        @unknown default:
            return "Care guide mode — built-in plant knowledge, works on every device."
        }
    }
    #endif
}
