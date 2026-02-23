import AVFoundation
import UIKit
import Combine

/// Drives the main scanning flow:
/// barcode → product lookup → local vision → cloud vision → cart add.
@MainActor
final class ScanViewModel: ObservableObject {

    @Published var isProcessing = false
    @Published var lastError: String?
    @Published var flashFeedback = false // brief green flash on successful scan

    private let productLookup = ProductLookupService()
    private let visionService = VisionService()
    private let networkService = NetworkService.shared
    private let spriteService = SpriteService.shared
    private let soundService = SoundService.shared

    weak var cartViewModel: CartViewModel?

    // MARK: – Entry point called by BarcodeService / camera frame handler

    /// Process a captured image frame. Runs the full 5-step identification pipeline.
    func processFrame(_ image: UIImage, detectedBarcode: String? = nil) {
        guard !isProcessing else { return }
        isProcessing = true
        lastError = nil

        Task {
            await runPipeline(image: image, barcode: detectedBarcode)
            isProcessing = false
        }
    }

    // MARK: – Pipeline

    private func runPipeline(image: UIImage, barcode: String?) async {
        var product: Product?

        // Step 1 & 2: Barcode → product lookup
        if let code = barcode {
            product = await productLookup.lookup(barcode: code)
        }

        // Step 3: Local Vision (on-device, no network)
        if product == nil {
            let localResult = await visionService.classifyLocally(image: image)
            if let result = localResult, result.confidence >= AppConfig.localVisionConfidenceThreshold {
                let category = ItemCategory.from(apiCategory: result.category)
                let price = category.suggestedPrice(seed: result.name)
                product = Product(
                    name: result.name,
                    category: category,
                    price: price,
                    source: .localVision(modelName: "MobileNetV2", confidence: result.confidence)
                )
            }
        }

        // Step 4: Cloud vision fallback
        if product == nil {
            guard let jpeg = image.jpegData(compressionQuality: 0.7) else {
                lastError = "Could not process image"
                return
            }
            let base64 = jpeg.base64EncodedString()

            // Step 5: Safety check happens server-side before classification returns
            let cloudResult = await networkService.classify(imageBase64: base64)

            if let r = cloudResult, r.safe {
                let category = ItemCategory.from(apiCategory: r.category)
                product = Product(
                    name: r.itemName,
                    category: category,
                    price: r.suggestedPrice,
                    source: .cloudVision
                )
            } else if cloudResult?.safe == false {
                // Flagged by moderation — silently discard, show nothing
                isProcessing = false
                return
            }
        }

        guard let resolvedProduct = product else {
            lastError = "Could not identify this item"
            return
        }

        // Add to cart with placeholder sprite while we fetch the real one
        let cartItem = CartItem(
            name: resolvedProduct.name,
            category: resolvedProduct.category.rawValue,
            price: resolvedProduct.price,
            sprite: .placeholder(resolvedProduct.category.placeholderEmoji)
        )

        cartViewModel?.addItem(cartItem)
        soundService.playScanBeep()
        triggerFlashFeedback()

        // Fetch sprite asynchronously — update cart item when ready
        let sprite = await spriteService.sprite(
            for: resolvedProduct.name,
            category: resolvedProduct.category.rawValue
        )
        cartViewModel?.updateSprite(for: cartItem.id, sprite: sprite)
    }

    private func triggerFlashFeedback() {
        flashFeedback = true
        Task {
            try? await Task.sleep(nanoseconds: 300_000_000)
            flashFeedback = false
        }
    }
}
