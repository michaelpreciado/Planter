import SwiftUI

/// The app's card surface: warm paper, continuous corners, soft ink shadow.
struct PlanterCard: ViewModifier {
    var padding: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous)
                    .fill(Color.planterPaper)
                    .shadow(color: Color.planterInk.opacity(0.08), radius: 12, y: 6)
            )
    }
}

extension View {
    func planterCard(padding: CGFloat = 16) -> some View {
        modifier(PlanterCard(padding: padding))
    }
}
