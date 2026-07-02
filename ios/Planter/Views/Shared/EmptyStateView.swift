import SwiftUI

struct EmptyStateView: View {
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            MarigoldMotif(size: 110)
            Text(title)
                .font(.planterTitle(24))
                .foregroundStyle(Color.planterInk)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(Color.planterInk.opacity(0.65))
                .multilineTextAlignment(.center)
            if let actionTitle, let action {
                Button(action: action) {
                    Label(actionTitle, systemImage: "plus")
                        .font(.body.weight(.bold))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Capsule().fill(Color.planterMoss))
                        .foregroundStyle(Color.planterPaper)
                }
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
    }
}
