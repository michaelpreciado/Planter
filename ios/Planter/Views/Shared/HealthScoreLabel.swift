import SwiftUI

struct HealthScoreLabel: View {
    let plant: Plant

    var body: some View {
        let score = PlantInsights.healthScore(for: plant)
        HStack(spacing: 6) {
            Image(systemName: "heart.fill")
                .font(.caption2)
            Text("\(score)/100 · \(PlantInsights.healthLabel(for: score))")
                .font(.caption.weight(.bold))
        }
        .foregroundStyle(tint(for: score))
    }

    private func tint(for score: Int) -> Color {
        if score >= 82 { return .planterFern }
        if score >= 62 { return .planterSun }
        return .planterTerra
    }
}
