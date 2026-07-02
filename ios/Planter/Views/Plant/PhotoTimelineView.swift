import SwiftUI
import UIKit

struct PhotoTimelineView: View {
    let plant: Plant
    let onDelete: (PlantPhoto) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(plant.sortedPhotos) { photo in
                PhotoTimelineCard(photo: photo, plantName: plant.name, onDelete: onDelete)
            }
        }
    }
}

private struct PhotoTimelineCard: View {
    let photo: PlantPhoto
    let plantName: String
    let onDelete: (PlantPhoto) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let image = UIImage(data: photo.imageData) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 200)
                    .frame(maxWidth: .infinity)
                    .clipped()
            }
            VStack(alignment: .leading, spacing: 6) {
                Text(photo.createdAt, format: .relative(presentation: .named))
                    .font(.caption.weight(.bold))
                    .kerning(0.8)
                    .foregroundStyle(Color.planterEarth)
                    .textCase(.uppercase)
                Text(photo.caption.isEmpty ? "Progress photo saved." : photo.caption)
                    .font(.subheadline)
                    .foregroundStyle(Color.planterInk.opacity(0.75))
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(
            RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous)
                .fill(Color.planterPaper)
        )
        .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous))
        .contextMenu {
            Button(role: .destructive) {
                onDelete(photo)
            } label: {
                Label("Delete photo", systemImage: "trash")
            }
        }
        .accessibilityLabel("Photo of \(plantName), \(photo.caption)")
    }
}
