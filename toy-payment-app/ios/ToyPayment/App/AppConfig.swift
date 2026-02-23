import Foundation

/// All app-wide configuration constants.
/// Swap BackendBaseURL between local dev and production here.
enum AppConfig {

    // MARK: – Backend

    /// The base URL of the Cloudflare Worker proxy.
    /// Change this to "http://localhost:8787" during local `wrangler dev` sessions.
    static let backendBaseURL = "https://toy-payment-proxy.YOUR_SUBDOMAIN.workers.dev"

    /// Simple shared secret sent in every proxy request as `X-App-Token`.
    /// Not a security silver-bullet — prevents casual abuse only.
    /// The actual value must match APP_TOKEN wrangler secret.
    ///
    /// Stored as an XOR-obfuscated byte array so the plaintext isn't a grep-able literal.
    static let appToken: String = {
        // Replace this array with the output of `encode_token.py` (see backend/README.md).
        // Default placeholder: "ToyPayApp2024" XOR 0x5A
        let encoded: [UInt8] = [0x0E, 0x34, 0x3B, 0x2E, 0x3B, 0x2F, 0x0F, 0x3F, 0x3B, 0x09, 0x78, 0x58, 0x5A]
        let key: UInt8 = 0x5A
        let decoded = encoded.map { $0 ^ key }
        return String(bytes: decoded, encoding: .utf8) ?? ""
    }()

    // MARK: – Tax

    /// Ontario HST — displayed on receipt as a flat line item.
    static let taxRate: Double = 0.13

    // MARK: – Vision

    /// Confidence threshold below which local Vision result is discarded
    /// and the image is sent to the cloud classify endpoint.
    static let localVisionConfidenceThreshold: Float = 0.75

    // MARK: – Timing

    /// Celebration screen auto-advances to receipt after this duration (seconds).
    static let celebrationDuration: Double = 2.5

    // MARK: – NFC

    static let nfcScanMessage = "Hold your card near the back of the phone"

    // MARK: – Sprite

    /// Disk cache directory name for generated sprites.
    static let spriteCacheDirectory = "GeneratedSprites"
}
