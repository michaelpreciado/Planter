import SwiftUI

struct StatusBadge: View {
    let status: PlantStatus

    var body: some View {
        Label(status.label, systemImage: status.systemImage)
            .font(.caption.weight(.bold))
            .foregroundStyle(status.tint)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(status.tint.opacity(0.16)))
    }
}

#Preview {
    VStack {
        StatusBadge(status: .thriving)
        StatusBadge(status: .watch)
        StatusBadge(status: .urgent)
    }
    .padding()
    .background(Color.planterCream)
}
