import SwiftUI

/// Planter's palette — warm paper and deep greens with marigold, saffron
/// and terracotta accents. The marigold is the shared thread between
/// Punjabi weddings and Día de los Muertos, so it carries the celebratory
/// moments; moss and fern do the everyday work.
extension Color {
    static let planterCream = Color("Cream")
    static let planterPaper = Color("Paper")
    static let planterInk = Color("Ink")
    static let planterMoss = Color("Moss")
    static let planterFern = Color("Fern")
    static let planterSage = Color("Sage")
    static let planterEarth = Color("Earth")
    static let planterTerra = Color("Terra")
    static let planterSun = Color("Sun")
    static let planterMarigold = Color("Marigold")
    static let planterSaffron = Color("Saffron")
}

enum PlanterTheme {
    static let cardCornerRadius: CGFloat = 24
    static let controlCornerRadius: CGFloat = 16
    static let screenPadding: CGFloat = 16
}

extension Font {
    /// Serif display face (New York) for plant names and screen titles.
    static func planterTitle(_ size: CGFloat = 28) -> Font {
        .system(size: size, weight: .semibold, design: .serif)
    }
}

/// Tracked small-caps eyebrow label, e.g. "PROGRESS TIMELINE".
struct EyebrowText: View {
    let text: String
    var color: Color = .planterEarth

    init(_ text: String, color: Color = .planterEarth) {
        self.text = text
        self.color = color
    }

    var body: some View {
        Text(text.uppercased())
            .font(.caption.weight(.bold))
            .kerning(1.6)
            .foregroundStyle(color)
    }
}
