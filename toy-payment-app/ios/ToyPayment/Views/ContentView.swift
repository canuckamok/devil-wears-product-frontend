import SwiftUI

/// Root view — transitions between app screens based on AppViewModel.currentScreen.
struct ContentView: View {

    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var cartVM: CartViewModel

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            switch appVM.currentScreen {
            case .scan:
                ScanView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .leading),
                        removal: .move(edge: .leading)
                    ))

            case .cart:
                CartView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing),
                        removal: .move(edge: .trailing)
                    ))

            case .checkout:
                CheckoutView()
                    .transition(.move(edge: .bottom))

            case .celebration:
                CelebrationView()
                    .transition(.opacity)

            case .receipt:
                ReceiptView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing),
                        removal: .move(edge: .trailing)
                    ))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: appVM.currentScreen)
    }
}

// MARK: – Design Tokens

enum AppColors {
    static let background   = Color(hex: "#FAFAF7")
    static let surface      = Color.white
    static let accent       = Color(hex: "#FF6B35")   // warm orange
    static let accentGreen  = Color(hex: "#4CAF50")
    static let accentBlue   = Color(hex: "#2196F3")
    static let charcoal     = Color(hex: "#2D2D2D")
    static let softGray     = Color(hex: "#F0F0EE")
    static let mutedText    = Color(hex: "#888888")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .init(charactersIn: "#"))
        let rgb = UInt32(hex, radix: 16) ?? 0
        let r = Double((rgb >> 16) & 0xFF) / 255
        let g = Double((rgb >> 8) & 0xFF) / 255
        let b = Double(rgb & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
