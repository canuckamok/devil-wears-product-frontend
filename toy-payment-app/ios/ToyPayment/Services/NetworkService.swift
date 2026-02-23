import Foundation

/// Single network layer. All API calls go through this class.
/// API keys never leave the server — this client only calls the backend proxy.
final class NetworkService {

    static let shared = NetworkService()
    private init() {}

    private let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 20
        config.timeoutIntervalForResource = 30
        return URLSession(configuration: config)
    }()

    // MARK: – /classify

    struct ClassifyResponse {
        let safe: Bool
        let itemName: String
        let category: String
        let suggestedPrice: Double
        let confidence: Double
    }

    func classify(imageBase64: String) async -> ClassifyResponse? {
        guard let url = URL(string: "\(AppConfig.backendBaseURL)/classify") else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(AppConfig.appToken, forHTTPHeaderField: "X-App-Token")

        let body: [String: Any] = ["image_base64": imageBase64]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        request.httpBody = data

        guard let (responseData, response) = try? await session.data(for: request),
              let http = response as? HTTPURLResponse,
              http.statusCode == 200
        else { return nil }

        guard let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let safe = json["safe"] as? Bool
        else { return nil }

        guard safe else { return ClassifyResponse(safe: false, itemName: "", category: "", suggestedPrice: 0, confidence: 0) }

        return ClassifyResponse(
            safe: true,
            itemName: (json["item_name"] as? String) ?? "Unknown Item",
            category: (json["category"] as? String) ?? "other",
            suggestedPrice: (json["suggested_price"] as? Double) ?? 4.99,
            confidence: (json["confidence"] as? Double) ?? 0
        )
    }

    // MARK: – /generate-sprite

    struct GenerateSpriteResponse {
        let safe: Bool
        let imageBase64: String?
    }

    func generateSprite(itemName: String, category: String) async -> GenerateSpriteResponse? {
        guard let url = URL(string: "\(AppConfig.backendBaseURL)/generate-sprite") else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(AppConfig.appToken, forHTTPHeaderField: "X-App-Token")

        let body: [String: Any] = ["item_name": itemName, "category": category]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        request.httpBody = data

        guard let (responseData, response) = try? await session.data(for: request),
              let http = response as? HTTPURLResponse,
              http.statusCode == 200
        else { return nil }

        guard let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let safe = json["safe"] as? Bool
        else { return nil }

        guard safe else { return GenerateSpriteResponse(safe: false, imageBase64: nil) }

        return GenerateSpriteResponse(
            safe: true,
            imageBase64: json["image_base64"] as? String
        )
    }

    // MARK: – /moderate

    func moderateText(_ text: String) async -> Bool {
        guard let url = URL(string: "\(AppConfig.backendBaseURL)/moderate") else { return false }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(AppConfig.appToken, forHTTPHeaderField: "X-App-Token")

        let body: [String: Any] = ["text": text]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return false }
        request.httpBody = data

        guard let (responseData, response) = try? await session.data(for: request),
              let http = response as? HTTPURLResponse,
              http.statusCode == 200,
              let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let safe = json["safe"] as? Bool
        else { return false } // fail-safe

        return safe
    }
}
