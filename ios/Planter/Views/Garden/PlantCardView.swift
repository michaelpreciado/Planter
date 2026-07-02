import SwiftUI
import UIKit

struct PlantCardView: View {
    let plant: Plant

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            photo
            VStack(alignment: .leading, spacing: 6) {
                Text(plant.name)
                    .font(.planterTitle(19))
                    .foregroundStyle(Color.planterInk)
                    .lineLimit(1)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.planterInk.opacity(0.6))
                    .lineLimit(1)
                HealthScoreLabel(plant: plant)
                Text(PlantInsights.reminderCopy(for: plant))
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.planterEarth)
            }
            .padding(12)
        }
        .background(
            RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous)
                .fill(Color.planterPaper)
                .shadow(color: Color.planterInk.opacity(0.08), radius: 10, y: 5)
        )
        .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous))
    }

    private var subtitle: String {
        plant.location.isEmpty ? plant.species : "\(plant.species) · \(plant.location)"
    }

    private var photo: some View {
        ZStack(alignment: .topTrailing) {
            Group {
                if let data = plant.latestPhoto?.imageData, let image = UIImage(data: data) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                } else {
                    ZStack {
                        Color.planterSage.opacity(0.25)
                        Image(systemName: "leaf")
                            .font(.largeTitle)
                            .foregroundStyle(Color.planterMoss.opacity(0.6))
                    }
                }
            }
            .frame(height: 130)
            .frame(maxWidth: .infinity)
            .clipped()

            if plant.isImportant {
                Image(systemName: "bell.badge.fill")
                    .font(.caption)
                    .foregroundStyle(Color.planterPaper)
                    .padding(6)
                    .background(Circle().fill(Color.planterTerra))
                    .padding(8)
                    .accessibilityLabel("Marked important")
            }
        }
    }
}
