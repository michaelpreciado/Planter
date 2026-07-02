import SwiftUI
import UIKit

/// Before/after slider: drag the marigold handle to reveal the latest
/// photo over the previous one.
struct PhotoCompareView: View {
    let beforeData: Data
    let afterData: Data

    @State private var fraction: CGFloat = 0.5

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            ZStack(alignment: .leading) {
                photo(from: beforeData, size: geometry.size)
                photo(from: afterData, size: geometry.size)
                    .mask(
                        HStack(spacing: 0) {
                            Rectangle().frame(width: width * fraction)
                            Spacer(minLength: 0)
                        }
                    )
                handle(height: geometry.size.height)
                    .offset(x: width * fraction - 14)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        fraction = min(1, max(0, value.location.x / width))
                    }
            )
        }
        .frame(height: 260)
        .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.cardCornerRadius, style: .continuous))
        .overlay(alignment: .bottomLeading) {
            label("Latest")
                .padding(10)
        }
        .overlay(alignment: .bottomTrailing) {
            label("Previous")
                .padding(10)
        }
        .accessibilityLabel("Photo comparison slider between the previous and latest photo")
    }

    private func photo(from data: Data, size: CGSize) -> some View {
        Group {
            if let image = UIImage(data: data) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Color.planterSage.opacity(0.3)
            }
        }
        .frame(width: size.width, height: size.height)
        .clipped()
    }

    private func handle(height: CGFloat) -> some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(Color.planterPaper)
                .frame(width: 3)
        }
        .frame(height: height)
        .overlay(
            Circle()
                .fill(Color.planterMarigold)
                .frame(width: 28, height: 28)
                .overlay(
                    Image(systemName: "arrow.left.and.right")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Color.planterInk)
                )
        )
        .frame(width: 28)
    }

    private func label(_ text: String) -> some View {
        Text(text)
            .font(.caption2.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Capsule().fill(Color.black.opacity(0.45)))
    }
}
