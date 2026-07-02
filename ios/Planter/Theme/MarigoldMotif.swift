import SwiftUI

/// A layered marigold rosette drawn in Canvas — the flower strung at
/// Punjabi weddings and laid on Día de los Muertos ofrendas. Used for
/// empty states and celebratory accents.
struct MarigoldMotif: View {
    var size: CGFloat = 120

    var body: some View {
        Canvas { context, canvasSize in
            let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
            let radius = min(canvasSize.width, canvasSize.height) / 2

            drawPetalRing(context, center: center, count: 14, inner: radius * 0.24, outer: radius * 0.98, widthDegrees: 22, color: Color.planterSaffron, rotation: 0)
            drawPetalRing(context, center: center, count: 14, inner: radius * 0.20, outer: radius * 0.84, widthDegrees: 22, color: Color.planterMarigold, rotation: 360.0 / 28.0)
            drawPetalRing(context, center: center, count: 10, inner: radius * 0.14, outer: radius * 0.62, widthDegrees: 30, color: Color.planterSaffron, rotation: 0)
            drawPetalRing(context, center: center, count: 10, inner: radius * 0.10, outer: radius * 0.48, widthDegrees: 30, color: Color.planterSun, rotation: 18)

            let coreRadius = radius * 0.16
            let coreRect = CGRect(x: center.x - coreRadius, y: center.y - coreRadius, width: coreRadius * 2, height: coreRadius * 2)
            context.fill(Path(ellipseIn: coreRect), with: .color(Color.planterSaffron))

            let dotRadius = radius * 0.09
            let dotRect = CGRect(x: center.x - dotRadius, y: center.y - dotRadius, width: dotRadius * 2, height: dotRadius * 2)
            context.fill(Path(ellipseIn: dotRect), with: .color(Color.planterSun))
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }

    private func drawPetalRing(
        _ context: GraphicsContext,
        center: CGPoint,
        count: Int,
        inner: CGFloat,
        outer: CGFloat,
        widthDegrees: CGFloat,
        color: Color,
        rotation: CGFloat
    ) {
        for index in 0..<count {
            let angle = Angle.degrees(Double(rotation) + Double(index) * 360.0 / Double(count)).radians
            let half = Angle.degrees(Double(widthDegrees) / 2).radians
            let bulge = Angle.degrees(Double(widthDegrees) * 0.72).radians
            let mid = (inner + outer) / 2

            var path = Path()
            path.move(to: point(center, radius: inner, angle: angle - half))
            path.addQuadCurve(
                to: point(center, radius: outer, angle: angle),
                control: point(center, radius: mid, angle: angle - bulge)
            )
            path.addQuadCurve(
                to: point(center, radius: inner, angle: angle + half),
                control: point(center, radius: mid, angle: angle + bulge)
            )
            path.closeSubpath()
            context.fill(path, with: .color(color))
        }
    }

    private func point(_ center: CGPoint, radius: CGFloat, angle: Double) -> CGPoint {
        CGPoint(x: center.x + radius * cos(angle), y: center.y + radius * sin(angle))
    }
}

#Preview {
    MarigoldMotif(size: 160)
        .padding()
        .background(Color.planterCream)
}
