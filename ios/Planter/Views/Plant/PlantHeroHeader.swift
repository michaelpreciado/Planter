import SwiftUI
import UIKit

struct PlantHeroHeader: View {
    let plant: Plant

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            heroImage
            LinearGradient(
                colors: [.clear, Color.black.opacity(0.65)],
                startPoint: .center,
                endPoint: .bottom
            )
            VStack(alignment: .leading, spacing: 8) {
                Text(plant.species.uppercased())
                    .font(.caption.weight(.bold))
                    .kerning(1.4)
                    .foregroundStyle(Color.white.opacity(0.85))
                Text(plant.name)
                    .font(.planterTitle(32))
                    .foregroundStyle(.white)
                HStack(spacing: 8) {
                    StatusBadge(status: plant.status)
                    Text(PlantInsights.reminderCopy(for: plant))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.white.opacity(0.22)))
                }
            }
            .padding(16)
        }
        .frame(height: 300)
        .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous))
    }

    @ViewBuilder
    private var heroImage: some View {
        if let data = plant.latestPhoto?.imageData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(height: 300)
                .frame(maxWidth: .infinity)
                .clipped()
        } else {
            ZStack {
                Color.planterSage.opacity(0.3)
                VStack(spacing: 10) {
                    MarigoldMotif(size: 80)
                    Text("No photo yet")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.planterMoss)
                }
            }
            .frame(height: 300)
            .frame(maxWidth: .infinity)
        }
    }
}
