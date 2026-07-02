import SwiftUI

/// A repeating diamond band — phulkari embroidery and talavera tile
/// geometry converge on this shape. Used as thin section dividers.
struct GeometricBorder: Shape {
    var diamondWidth: CGFloat = 14

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let height = rect.height
        let half = diamondWidth / 2
        var x = rect.minX + half
        while x + half <= rect.maxX {
            path.move(to: CGPoint(x: x, y: rect.minY))
            path.addLine(to: CGPoint(x: x + half, y: rect.midY))
            path.addLine(to: CGPoint(x: x, y: rect.minY + height))
            path.addLine(to: CGPoint(x: x - half, y: rect.midY))
            path.closeSubpath()
            x += diamondWidth * 1.6
        }
        return path
    }
}

/// Ready-to-drop divider row: terra diamonds with marigold pin-dots.
struct GeometricDivider: View {
    var body: some View {
        ZStack {
            GeometricBorder(diamondWidth: 12)
                .fill(Color.planterTerra.opacity(0.7))
            GeometricBorder(diamondWidth: 4)
                .fill(Color.planterMarigold)
        }
        .frame(height: 10)
        .accessibilityHidden(true)
    }
}

#Preview {
    GeometricDivider()
        .padding()
        .background(Color.planterCream)
}
