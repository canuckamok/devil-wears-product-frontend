import SwiftUI

/// Top-level navigation state for the app.
@MainActor
final class AppViewModel: ObservableObject {

    enum Screen {
        case scan
        case cart
        case checkout   // NFC tap waiting
        case celebration
        case receipt
    }

    @Published var currentScreen: Screen = .scan

    func navigateTo(_ screen: Screen) {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            currentScreen = screen
        }
    }

    func startOver() {
        navigateTo(.scan)
    }
}
