import SwiftUI

/// NFC tap screen — waits for any NFC card tap or shows PAY NOW fallback.
struct CheckoutView: View {

    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var cartVM: CartViewModel
    @StateObject private var checkoutVM = CheckoutViewModel()

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // ── Header ───────────────────────────────────────────────
                HStack {
                    Button {
                        appVM.navigateTo(.cart)
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(AppColors.charcoal)
                            .frame(width: 44, height: 44)
                    }
                    Spacer()
                    Text("Pay")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(AppColors.charcoal)
                    Spacer()
                    Color.clear.frame(width: 44, height: 44)
                }
                .padding(.horizontal, 16)
                .padding(.top, 20)

                Spacer()

                // ── Total display ─────────────────────────────────────────
                VStack(spacing: 6) {
                    Text("Total")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(AppColors.mutedText)
                    Text(cartVM.formattedTotal)
                        .font(.system(size: 56, weight: .black, design: .rounded))
                        .foregroundColor(AppColors.charcoal)
                }
                .padding(.bottom, 48)

                // ── NFC tap area ──────────────────────────────────────────
                if checkoutVM.nfcAvailable {
                    NFCTapPrompt(isWaiting: checkoutVM.isWaitingForTap) {
                        checkoutVM.startNFCSession()
                    }
                    .padding(.bottom, 32)
                }

                // ── Fallback pay button ───────────────────────────────────
                Button {
                    checkoutVM.simulatePayment()
                } label: {
                    Label(
                        checkoutVM.nfcAvailable ? "Pay Without Card" : "PAY NOW",
                        systemImage: "hand.tap.fill"
                    )
                    .font(.system(
                        size: checkoutVM.nfcAvailable ? 18 : 28,
                        weight: .black,
                        design: .rounded
                    ))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: checkoutVM.nfcAvailable ? 56 : 80)
                    .background(
                        checkoutVM.nfcAvailable ? AppColors.mutedText : AppColors.accentGreen,
                        in: RoundedRectangle(cornerRadius: 20, style: .continuous)
                    )
                }
                .padding(.horizontal, 24)

                Spacer()
            }
        }
        .onChange(of: checkoutVM.tapResult) { _, result in
            if case .approved = result {
                appVM.navigateTo(.celebration)
            }
        }
        .onAppear {
            // Auto-start NFC session when screen appears
            if checkoutVM.nfcAvailable {
                checkoutVM.startNFCSession()
            }
        }
    }
}

// MARK: – NFC Tap Prompt

private struct NFCTapPrompt: View {
    let isWaiting: Bool
    let onTap: () -> Void

    @State private var pulseScale: CGFloat = 1.0

    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                // Animated pulse rings
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .stroke(AppColors.accentBlue.opacity(isWaiting ? 0.3 : 0), lineWidth: 2)
                        .scaleEffect(isWaiting ? pulseScale + CGFloat(i) * 0.25 : 1)
                        .animation(
                            isWaiting
                                ? .easeOut(duration: 1.5).repeatForever(autoreverses: false)
                                    .delay(Double(i) * 0.4)
                                : .default,
                            value: pulseScale
                        )
                }

                // Card icon
                Button(action: onTap) {
                    ZStack {
                        Circle()
                            .fill(isWaiting ? AppColors.accentBlue : AppColors.softGray)
                            .frame(width: 140, height: 140)

                        Image(systemName: "creditcard.and.123")
                            .font(.system(size: 52, weight: .medium))
                            .foregroundColor(isWaiting ? .white : AppColors.mutedText)
                    }
                }
                .buttonStyle(.plain)
            }
            .frame(width: 200, height: 200)
            .onAppear {
                pulseScale = 1.6
            }

            Text(isWaiting ? "Hold your card here" : "Tap to pay")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(isWaiting ? AppColors.accentBlue : AppColors.charcoal)
        }
    }
}
