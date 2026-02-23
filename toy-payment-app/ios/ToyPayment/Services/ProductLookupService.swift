import Foundation

/// Looks up product info from barcode databases.
/// Step 1: Open Food Facts (free, no key)
/// Step 2: UPCitemdb free tier (no key for limited use)
final class ProductLookupService {

    func lookup(barcode: String) async -> Product? {
        // Try Open Food Facts first
        if let product = await lookupOpenFoodFacts(barcode: barcode) {
            return product
        }
        // Fall back to UPCitemdb
        return await lookupUPCitemdb(barcode: barcode)
    }

    // MARK: – Open Food Facts

    private func lookupOpenFoodFacts(_ barcode: String) async -> Product? {
        guard let url = URL(string: "https://world.openfoodfacts.org/api/v2/product/\(barcode)?fields=product_name,categories_tags") else {
            return nil
        }

        var request = URLRequest(url: url)
        request.setValue("ToyStoreApp/1.0 (children's toy app; contact@example.com)", forHTTPHeaderField: "User-Agent")
        request.timeoutInterval = 5

        guard let (data, response) = try? await URLSession.shared.data(for: request),
              let http = response as? HTTPURLResponse,
              http.statusCode == 200
        else { return nil }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let status = json["status"] as? Int,
              status == 1,
              let productData = json["product"] as? [String: Any],
              let productName = productData["product_name"] as? String,
              !productName.isEmpty
        else { return nil }

        let categoriesRaw = (productData["categories_tags"] as? [String]) ?? []
        let category = mapFoodFactsCategory(categoriesRaw)

        return Product(
            name: productName.capitalized,
            category: category,
            price: category.suggestedPrice(seed: productName),
            source: .barcode(code: barcode, api: "Open Food Facts")
        )
    }

    // MARK: – UPCitemdb

    private func lookupUPCitemdb(_ barcode: String) async -> Product? {
        guard let url = URL(string: "https://api.upcitemdb.com/prod/trial/lookup?upc=\(barcode)") else {
            return nil
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 5

        guard let (data, response) = try? await URLSession.shared.data(for: request),
              let http = response as? HTTPURLResponse,
              http.statusCode == 200
        else { return nil }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let items = json["items"] as? [[String: Any]],
              let first = items.first,
              let title = first["title"] as? String,
              !title.isEmpty
        else { return nil }

        let categoryRaw = (first["category"] as? String) ?? ""
        let category = mapUPCCategory(categoryRaw)

        return Product(
            name: title,
            category: category,
            price: category.suggestedPrice(seed: title),
            source: .barcode(code: barcode, api: "UPCitemdb")
        )
    }

    // MARK: – Category mapping

    private func mapFoodFactsCategory(_ tags: [String]) -> ItemCategory {
        let joined = tags.joined(separator: " ").lowercased()

        if joined.contains("snack") || joined.contains("chip") || joined.contains("candy") ||
            joined.contains("chocolate") || joined.contains("cookie") { return .packagedSnack }
        if joined.contains("cereal") || joined.contains("pasta") || joined.contains("rice") ||
            joined.contains("canned") || joined.contains("conserv") { return .cerealPastaCanned }
        if joined.contains("fresh") || joined.contains("fruit") || joined.contains("vegetable") ||
            joined.contains("produce") { return .freshProduce }
        return .packagedSnack // most barcoded food items are packaged snacks
    }

    private func mapUPCCategory(_ raw: String) -> ItemCategory {
        let lower = raw.lowercased()
        if lower.contains("toy") || lower.contains("game") && lower.contains("board") { return .toy }
        if lower.contains("game") { return .boardGame }
        if lower.contains("book") { return .childrensBook }
        if lower.contains("food") || lower.contains("grocery") || lower.contains("beverage") { return .packagedSnack }
        if lower.contains("apparel") || lower.contains("clothing") { return .clothing }
        return .householdItem
    }
}
