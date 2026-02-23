import Foundation
import Combine

/// Manages the shopping cart state throughout the app lifecycle.
@MainActor
final class CartViewModel: ObservableObject {

    @Published private(set) var items: [CartItem] = []

    var subtotal: Double {
        items.reduce(0) { $0 + $1.price }
    }

    var tax: Double {
        (subtotal * AppConfig.taxRate * 100).rounded() / 100
    }

    var total: Double {
        ((subtotal + tax) * 100).rounded() / 100
    }

    var formattedSubtotal: String { formatPrice(subtotal) }
    var formattedTax: String { formatPrice(tax) }
    var formattedTotal: String { formatPrice(total) }

    var isEmpty: Bool { items.isEmpty }

    // MARK: – Mutations

    func addItem(_ item: CartItem) {
        items.append(item)
    }

    func removeItem(id: UUID) {
        items.removeAll { $0.id == id }
    }

    func updateSprite(for id: UUID, sprite: SpriteState) {
        guard let idx = items.firstIndex(where: { $0.id == id }) else { return }
        items[idx].sprite = sprite
    }

    func clear() {
        items.removeAll()
    }

    // MARK: – Helpers

    private func formatPrice(_ value: Double) -> String {
        String(format: "$%.2f", value)
    }
}
