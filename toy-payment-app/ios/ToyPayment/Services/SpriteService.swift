import UIKit

/// Manages sprite loading with a three-level hierarchy:
/// 1. Local bundled library (SpriteManifest.json)
/// 2. Disk cache of previously generated sprites
/// 3. Backend /generate-sprite API (generates and caches)
final class SpriteService {

    static let shared = SpriteService()
    private init() {
        loadManifest()
        ensureCacheDirectory()
    }

    private var manifest: [String: String] = [:] // item key → PNG filename
    private let network = NetworkService.shared
    private var cacheDirectory: URL?

    // MARK: – Public

    /// Resolve a sprite for the given item name + category.
    /// Returns a SpriteState (never throws — always has a fallback).
    func sprite(for itemName: String, category: String) async -> SpriteState {
        let key = normalizedKey(itemName: itemName, category: category)

        // Level 1: Local bundled library
        if let image = localSprite(for: key, itemName: itemName, category: category) {
            return .local(image)
        }

        // Level 2: Disk cache from previous generation
        if let image = cachedSprite(for: key) {
            return .generated(image)
        }

        // Level 3: Generate via backend (includes moderation)
        if let image = await generateAndCache(itemName: itemName, category: category, key: key) {
            return .generated(image)
        }

        // Fallback: emoji placeholder
        let emoji = ItemCategory.from(apiCategory: category).placeholderEmoji
        return .placeholder(emoji)
    }

    // MARK: – Level 1: Local bundle

    private func localSprite(for key: String, itemName: String, category: String) -> UIImage? {
        // Check manifest by normalized key
        if let filename = manifest[key] {
            return UIImage(named: filename) ?? UIImage(contentsOfFile: spritesBundlePath(filename))
        }

        // Check manifest by category
        if let filename = manifest["category:\(category)"] {
            return UIImage(named: filename) ?? UIImage(contentsOfFile: spritesBundlePath(filename))
        }

        // Try direct asset name match (Assets.xcassets/Sprites/)
        let assetName = "sprite_\(key)"
        return UIImage(named: assetName)
    }

    private func spritesBundlePath(_ filename: String) -> String {
        Bundle.main.bundlePath + "/Sprites/" + filename
    }

    // MARK: – Level 2: Disk cache

    private func cachedSprite(for key: String) -> UIImage? {
        guard let dir = cacheDirectory else { return nil }
        let fileURL = dir.appendingPathComponent("\(key).png")
        guard FileManager.default.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL),
              let image = UIImage(data: data)
        else { return nil }
        return image
    }

    // MARK: – Level 3: Generate + cache

    private func generateAndCache(itemName: String, category: String, key: String) async -> UIImage? {
        guard let response = await network.generateSprite(itemName: itemName, category: category),
              response.safe,
              let b64 = response.imageBase64,
              let data = Data(base64Encoded: b64),
              let image = UIImage(data: data)
        else { return nil }

        // Cache to disk
        if let dir = cacheDirectory {
            let fileURL = dir.appendingPathComponent("\(key).png")
            if let pngData = image.pngData() {
                try? pngData.write(to: fileURL, options: .atomic)
            }
        }

        return image
    }

    // MARK: – Helpers

    private func normalizedKey(itemName: String, category: String) -> String {
        let name = itemName.lowercased()
            .replacingOccurrences(of: " ", with: "_")
            .components(separatedBy: .letters.inverted.union(.init(charactersIn: "_")))
            .joined()
        return "\(category)_\(name)"
    }

    private func loadManifest() {
        guard let url = Bundle.main.url(forResource: "SpriteManifest", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let json = try? JSONDecoder().decode([String: String].self, from: data)
        else { return }
        manifest = json
    }

    private func ensureCacheDirectory() {
        guard let cachesURL = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else { return }
        let dir = cachesURL.appendingPathComponent(AppConfig.spriteCacheDirectory)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        cacheDirectory = dir
    }
}
