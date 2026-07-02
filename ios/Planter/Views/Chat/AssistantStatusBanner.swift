import SwiftUI

struct AssistantStatusBanner: View {
    let status: AssistantStatus

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: status.kind == .foundationModels ? "sparkles" : "book.closed.fill")
                .font(.caption)
                .foregroundStyle(status.kind == .foundationModels ? Color.planterMarigold : Color.planterEarth)
            Text(status.detail)
                .font(.caption)
                .foregroundStyle(Color.planterInk.opacity(0.65))
                .lineLimit(2)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Capsule().fill(Color.planterPaper)
                .overlay(Capsule().stroke(Color.planterInk.opacity(0.08)))
        )
    }
}
