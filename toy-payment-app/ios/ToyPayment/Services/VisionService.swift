import Vision
import CoreML
import UIKit

/// On-device image classification using MobileNetV2 via Apple Vision framework.
/// Only escalates to cloud if confidence < AppConfig.localVisionConfidenceThreshold.
final class VisionService {

    struct LocalClassificationResult {
        let name: String
        let category: String
        let confidence: Float
    }

    // Lazily compiled Vision request — thread-safe via serial queue
    private var classificationRequest: VNCoreMLRequest?
    private let queue = DispatchQueue(label: "com.toystore.vision", qos: .userInitiated)

    init() {
        setupModel()
    }

    // MARK: – Public

    func classifyLocally(image: UIImage) async -> LocalClassificationResult? {
        guard let request = classificationRequest else { return nil }
        guard let cgImage = image.cgImage else { return nil }

        return await withCheckedContinuation { continuation in
            queue.async {
                let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
                do {
                    try handler.perform([request])
                    guard let result = request.results?.first as? VNClassificationObservation else {
                        continuation.resume(returning: nil)
                        return
                    }
                    let mapped = self.mapImageNetLabel(result.identifier, confidence: result.confidence)
                    continuation.resume(returning: mapped)
                } catch {
                    continuation.resume(returning: nil)
                }
            }
        }
    }

    // MARK: – Setup

    private func setupModel() {
        // Load MobileNetV2 from app bundle.
        // Download from https://developer.apple.com/machine-learning/models/
        // and add MobileNetV2.mlmodel to the Xcode project.
        guard let modelURL = Bundle.main.url(forResource: "MobileNetV2", withExtension: "mlmodelc") else {
            // Model not bundled — cloud fallback will handle all classification
            return
        }

        guard let mlModel = try? MLModel(contentsOf: modelURL),
              let vnModel = try? VNCoreMLModel(for: mlModel)
        else { return }

        let request = VNCoreMLRequest(model: vnModel)
        request.imageCropAndScaleOption = .centerCrop
        self.classificationRequest = request
    }

    // MARK: – ImageNet → our category mapping

    /// Map ImageNet class labels to our app's category taxonomy.
    private func mapImageNetLabel(_ label: String, confidence: Float) -> LocalClassificationResult {
        let lower = label.lowercased()

        // Fresh produce
        let produceTerms = ["banana", "apple", "orange", "lemon", "strawberry", "pineapple",
                            "watermelon", "grape", "pear", "peach", "cherry", "mango",
                            "carrot", "broccoli", "corn", "potato", "tomato", "cucumber",
                            "pepper", "onion", "mushroom", "lettuce", "cauliflower", "eggplant"]
        if produceTerms.contains(where: { lower.contains($0) }) {
            let name = label.split(separator: ",").first.map(String.init) ?? label
            return LocalClassificationResult(
                name: name.capitalized.trimmingCharacters(in: .whitespaces),
                category: "fresh_produce",
                confidence: confidence
            )
        }

        // Books
        if lower.contains("book") || lower.contains("novel") || lower.contains("comic") {
            return LocalClassificationResult(name: "Book", category: "childrens_book", confidence: confidence)
        }

        // Stuffed animals / plush
        if lower.contains("teddy") || lower.contains("stuffed") || lower.contains("plush") ||
            lower.contains("doll") {
            return LocalClassificationResult(name: "Stuffed Animal", category: "stuffed_animal_small", confidence: confidence)
        }

        // Toys
        if lower.contains("toy") || lower.contains("lego") || lower.contains("block") ||
            lower.contains("puzzle") || lower.contains("ball") || lower.contains("kite") {
            return LocalClassificationResult(name: "Toy", category: "toy", confidence: confidence)
        }

        // Boxes / packaged goods
        if lower.contains("box") || lower.contains("carton") || lower.contains("package") ||
            lower.contains("bag") {
            return LocalClassificationResult(name: "Package", category: "household_item", confidence: confidence)
        }

        // Clothing
        if lower.contains("shirt") || lower.contains("jacket") || lower.contains("sock") ||
            lower.contains("shoe") || lower.contains("hat") || lower.contains("jersey") ||
            lower.contains("sweater") || lower.contains("pants") {
            let name = label.split(separator: ",").first.map(String.init) ?? "Clothing"
            return LocalClassificationResult(
                name: name.capitalized.trimmingCharacters(in: .whitespaces),
                category: "clothing",
                confidence: confidence
            )
        }

        // Everything else — return low confidence to trigger cloud fallback
        let name = label.split(separator: ",").first.map(String.init) ?? label
        return LocalClassificationResult(
            name: name.capitalized.trimmingCharacters(in: .whitespaces),
            category: "other",
            confidence: min(confidence, 0.5) // cap unknown items to below threshold
        )
    }
}
