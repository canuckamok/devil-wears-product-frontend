import Foundation

/// A resolved product from any identification source.
struct Product {
    let name: String
    let category: ItemCategory
    let price: Double
    let source: IdentificationSource
}

enum ItemCategory: String, CaseIterable {
    case freshProduce = "fresh_produce"
    case packagedSnack = "packaged_snack"
    case cerealPastaCanned = "cereal_pasta_canned"
    case stuffedAnimalSmall = "stuffed_animal_small"
    case stuffedAnimalLarge = "stuffed_animal_large"
    case childrensBook = "childrens_book"
    case toy = "toy"
    case boardGame = "board_game"
    case clothing = "clothing"
    case householdItem = "household_item"
    case other = "other"

    var displayName: String {
        switch self {
        case .freshProduce: return "Fresh Produce"
        case .packagedSnack: return "Snack"
        case .cerealPastaCanned: return "Grocery"
        case .stuffedAnimalSmall, .stuffedAnimalLarge: return "Stuffed Animal"
        case .childrensBook: return "Book"
        case .toy: return "Toy"
        case .boardGame: return "Game"
        case .clothing: return "Clothing"
        case .householdItem: return "Household"
        case .other: return "Item"
        }
    }

    /// Placeholder emoji used when no sprite is available.
    var placeholderEmoji: String {
        switch self {
        case .freshProduce: return "🍎"
        case .packagedSnack: return "🍫"
        case .cerealPastaCanned: return "🥫"
        case .stuffedAnimalSmall, .stuffedAnimalLarge: return "🧸"
        case .childrensBook: return "📚"
        case .toy: return "🧩"
        case .boardGame: return "🎲"
        case .clothing: return "👕"
        case .householdItem: return "📦"
        case .other: return "🛍️"
        }
    }

    /// Price range for local price generation (mirrors backend pricing.ts).
    var priceRange: ClosedRange<Double> {
        switch self {
        case .freshProduce: return 0.99...0.99
        case .packagedSnack: return 2.99...4.99
        case .cerealPastaCanned: return 3.99...5.99
        case .stuffedAnimalSmall: return 9.99...14.99
        case .stuffedAnimalLarge: return 19.99...24.99
        case .childrensBook: return 7.99...10.99
        case .toy: return 9.99...19.99
        case .boardGame: return 14.99...29.99
        case .clothing: return 12.99...24.99
        case .householdItem: return 4.99...9.99
        case .other: return 2.99...9.99
        }
    }

    /// Pick a deterministic .99-ending price using the item name as seed.
    func suggestedPrice(seed: String) -> Double {
        let range = priceRange
        if range.lowerBound == range.upperBound { return range.lowerBound }

        // Collect .99 prices in range
        var prices: [Double] = []
        var p = range.lowerBound
        while p <= range.upperBound + 0.001 {
            prices.append((p * 100).rounded() / 100)
            p = Double(Int(p)) + 1.99
        }
        guard !prices.isEmpty else { return range.lowerBound }

        let hash = seed.unicodeScalars.reduce(0) { ($0 << 5) &- $0 &+ Int($1.value) }
        return prices[abs(hash) % prices.count]
    }

    static func from(apiCategory: String) -> ItemCategory {
        ItemCategory(rawValue: apiCategory) ?? .other
    }
}

enum IdentificationSource {
    case barcode(code: String, api: String)
    case localVision(modelName: String, confidence: Float)
    case cloudVision
    case manual
}
