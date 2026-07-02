import UIKit

/// Downscales and re-encodes captured images before they are persisted,
/// so a 48 MP camera frame becomes a few hundred kilobytes of JPEG.
enum ImageProcessor {
    static let maxDimension: CGFloat = 2048
    static let jpegQuality: CGFloat = 0.8

    static func processedData(from image: UIImage) -> Data? {
        let scaled = downscaled(image, maxDimension: maxDimension)
        return scaled.jpegData(compressionQuality: jpegQuality)
    }

    static func downscaled(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let size = image.size
        let largestSide = max(size.width, size.height)
        guard largestSide > maxDimension, largestSide > 0 else { return image }

        let scale = maxDimension / largestSide
        let target = CGSize(width: floor(size.width * scale), height: floor(size.height * scale))

        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
    }
}
