import SwiftUI

/// Features that could move behind a "Planter Pro" purchase later.
/// Every gated call site checks the entitlements provider today, so
/// adding StoreKit later means swapping in one new provider class —
/// no feature code changes.
enum Feature: String, CaseIterable {
    case unlimitedPlants
    case photoCompare
    case aiChat
    case backupExport
}

protocol EntitlementsProviding {
    func isUnlocked(_ feature: Feature) -> Bool
    /// nil means unlimited.
    var maxPlantCount: Int? { get }
}

/// v1 ships everything unlocked and free.
struct FreeForNowEntitlements: EntitlementsProviding {
    func isUnlocked(_ feature: Feature) -> Bool { true }
    var maxPlantCount: Int? { nil }
}

private struct EntitlementsKey: EnvironmentKey {
    static let defaultValue: EntitlementsProviding = FreeForNowEntitlements()
}

extension EnvironmentValues {
    var entitlements: EntitlementsProviding {
        get { self[EntitlementsKey.self] }
        set { self[EntitlementsKey.self] = newValue }
    }
}
