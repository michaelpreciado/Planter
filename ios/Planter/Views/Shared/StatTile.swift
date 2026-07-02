import SwiftUI

struct StatTile: View {
    let systemImage: String
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: systemImage)
                .font(.body.weight(.semibold))
                .foregroundStyle(Color.planterMoss)
            Text(value)
                .font(.title2.weight(.bold))
                .foregroundStyle(Color.planterInk)
            Text(label.uppercased())
                .font(.caption2.weight(.semibold))
                .kerning(1.0)
                .foregroundStyle(Color.planterInk.opacity(0.55))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: PlanterTheme.controlCornerRadius, style: .continuous)
                .fill(Color.planterPaper)
                .overlay(
                    RoundedRectangle(cornerRadius: PlanterTheme.controlCornerRadius, style: .continuous)
                        .stroke(Color.planterInk.opacity(0.08))
                )
        )
    }
}
