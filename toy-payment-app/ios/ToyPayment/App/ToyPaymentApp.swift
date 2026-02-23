import SwiftUI

@main
struct ToyPaymentApp: App {

    @StateObject private var cartViewModel = CartViewModel()
    @StateObject private var appViewModel = AppViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(cartViewModel)
                .environmentObject(appViewModel)
                // Full-screen, no status bar — immersive for young children
                .statusBarHidden(true)
                .persistentSystemOverlays(.hidden)
        }
    }
}
