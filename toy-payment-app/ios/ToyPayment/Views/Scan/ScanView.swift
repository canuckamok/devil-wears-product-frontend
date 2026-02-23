import SwiftUI
import AVFoundation

/// Main scanning screen — camera always live, barcode and image capture handled here.
struct ScanView: View {

    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var cartVM: CartViewModel

    @StateObject private var scanVM = ScanViewModel()
    @StateObject private var barcodeService = BarcodeService()

    var body: some View {
        ZStack {
            // ── Camera layer (full screen) ─────────────────────────────────
            CameraPreviewView(session: barcodeService.session)
                .ignoresSafeArea()
                .onAppear { barcodeService.startSession() }
                .onDisappear { barcodeService.stopSession() }

            // ── Green flash feedback on successful scan ────────────────────
            if scanVM.flashFeedback {
                AppColors.accentGreen.opacity(0.25)
                    .ignoresSafeArea()
                    .allowsHitTesting(false)
            }

            // ── Finder overlay ────────────────────────────────────────────
            FinderOverlay()

            // ── Top bar ───────────────────────────────────────────────────
            VStack {
                HStack {
                    Text("🛒 Scan Items")
                        .font(.system(size: 22, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                        .shadow(radius: 2)

                    Spacer()

                    // Cart badge button
                    if !cartVM.isEmpty {
                        CartBadgeButton(count: cartVM.items.count) {
                            appVM.navigateTo(.cart)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                Spacer()

                // ── Processing indicator ───────────────────────────────
                if scanVM.isProcessing {
                    HStack(spacing: 10) {
                        ProgressView()
                            .tint(.white)
                        Text("Looking up item…")
                            .font(.system(size: 17, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 14)
                    .background(.ultraThinMaterial, in: Capsule())
                    .padding(.bottom, 160)
                }

                // ── Bottom action bar ──────────────────────────────────
                HStack(spacing: 16) {
                    // Snap-to-identify button (no barcode)
                    SnapButton {
                        barcodeService.captureFrame { image in
                            scanVM.processFrame(image)
                        }
                    }

                    if !cartVM.isEmpty {
                        // Checkout CTA
                        Button {
                            appVM.navigateTo(.cart)
                        } label: {
                            Label("Checkout \(cartVM.items.count)", systemImage: "cart.fill")
                                .font(.system(size: 18, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                                .padding(.horizontal, 28)
                                .frame(height: 60)
                                .background(AppColors.accent, in: Capsule())
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 50)
            }
        }
        .onReceive(barcodeService.$detectedBarcode) { code in
            guard let code else { return }
            barcodeService.captureFrame { image in
                scanVM.processFrame(image, detectedBarcode: code)
            }
        }
        .onAppear {
            scanVM.cartViewModel = cartVM
        }
    }
}

// MARK: – Subviews

/// Translucent viewfinder cutout with corner markers.
private struct FinderOverlay: View {
    var body: some View {
        GeometryReader { geo in
            let boxSize = min(geo.size.width, geo.size.height) * 0.65
            let boxY = (geo.size.height - boxSize) / 2 - 40

            ZStack {
                // Dim surrounding area
                Rectangle()
                    .fill(Color.black.opacity(0.45))
                    .ignoresSafeArea()
                    .mask(
                        Rectangle()
                            .ignoresSafeArea()
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .frame(width: boxSize, height: boxSize)
                                    .offset(y: boxY - geo.size.height / 2 + boxSize / 2)
                                    .blendMode(.destinationOut)
                            )
                    )

                // Corner brackets
                CornerBrackets(size: boxSize)
                    .position(x: geo.size.width / 2, y: boxY + boxSize / 2)
            }
        }
    }
}

private struct CornerBrackets: View {
    let size: CGFloat
    let thickness: CGFloat = 4
    let len: CGFloat = 28
    let radius: CGFloat = 6

    var body: some View {
        ZStack {
            ForEach(0..<4, id: \.self) { i in
                BracketShape(corner: i, len: len, thickness: thickness, radius: radius)
                    .stroke(Color.white, lineWidth: thickness)
                    .frame(width: size, height: size)
            }
        }
    }
}

private struct BracketShape: Shape {
    let corner: Int
    let len: CGFloat
    let thickness: CGFloat
    let radius: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let (x, y): (CGFloat, CGFloat)
        let (dx, dy): (CGFloat, CGFloat)

        switch corner {
        case 0: x = rect.minX; y = rect.minY; dx = 1; dy = 1
        case 1: x = rect.maxX; y = rect.minY; dx = -1; dy = 1
        case 2: x = rect.minX; y = rect.maxY; dx = 1; dy = -1
        default: x = rect.maxX; y = rect.maxY; dx = -1; dy = -1
        }

        path.move(to: CGPoint(x: x + dx * len, y: y))
        path.addLine(to: CGPoint(x: x, y: y))
        path.addLine(to: CGPoint(x: x, y: y + dy * len))
        return path
    }
}

private struct CartBadgeButton: View {
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "cart.fill")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)

                Text("\(count)")
                    .font(.system(size: 13, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .padding(5)
                    .background(AppColors.accent, in: Circle())
                    .offset(x: 10, y: -10)
            }
            .frame(width: 60, height: 60)
        }
    }
}

private struct SnapButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(.white)
                    .frame(width: 72, height: 72)
                Circle()
                    .strokeBorder(.white.opacity(0.5), lineWidth: 3)
                    .frame(width: 82, height: 82)
            }
        }
        .frame(width: 82, height: 82)
        .accessibilityLabel("Scan item")
    }
}
