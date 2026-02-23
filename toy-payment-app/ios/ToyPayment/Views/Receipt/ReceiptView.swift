import SwiftUI

/// Receipt screen shown after successful payment.
struct ReceiptView: View {

    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var cartVM: CartViewModel

    @State private var stampVisible = false

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // ── Header ────────────────────────────────────────────────
                Text("🧾 Receipt")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundColor(AppColors.charcoal)
                    .padding(.top, 24)
                    .padding(.bottom, 16)

                // ── Receipt paper ─────────────────────────────────────────
                ScrollView {
                    ZStack {
                        // Receipt card
                        VStack(spacing: 0) {
                            // Store header
                            VStack(spacing: 4) {
                                Text("🛒 TOY STORE")
                                    .font(.system(size: 20, weight: .black, design: .monospaced))
                                Text("Thanks for shopping!")
                                    .font(.system(size: 13, design: .monospaced))
                                    .foregroundColor(AppColors.mutedText)
                            }
                            .padding(.vertical, 20)

                            Divider()
                                .overlay(dashDivider)

                            // Line items
                            VStack(spacing: 0) {
                                ForEach(cartVM.items) { item in
                                    ReceiptRow(item: item)
                                }
                            }
                            .padding(.vertical, 8)

                            Divider()
                                .overlay(dashDivider)

                            // Totals
                            VStack(spacing: 8) {
                                ReceiptTotalRow(label: "Subtotal", value: cartVM.formattedSubtotal, isBold: false)
                                ReceiptTotalRow(
                                    label: "Tax (13% HST)",
                                    value: cartVM.formattedTax,
                                    isBold: false
                                )
                                Divider()
                                ReceiptTotalRow(label: "TOTAL", value: cartVM.formattedTotal, isBold: true)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 16)
                        }
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.gray.opacity(0.1), lineWidth: 1)
                        )

                        // ── PAID stamp overlay ────────────────────────────
                        if stampVisible {
                            PaidStamp()
                                .rotationEffect(.degrees(-15))
                                .transition(.scale(scale: 1.5).combined(with: .opacity))
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
                }

                // ── START OVER button ─────────────────────────────────────
                Button {
                    cartVM.clear()
                    appVM.startOver()
                } label: {
                    Label("START OVER 🛒", systemImage: "arrow.counterclockwise")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 76)
                        .background(AppColors.accent, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 20)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.55).delay(0.4)) {
                stampVisible = true
            }
        }
    }

    private var dashDivider: some View {
        GeometryReader { geo in
            Path { path in
                let y = geo.size.height / 2
                var x: CGFloat = 0
                while x < geo.size.width {
                    path.move(to: CGPoint(x: x, y: y))
                    path.addLine(to: CGPoint(x: min(x + 8, geo.size.width), y: y))
                    x += 14
                }
            }
            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        }
    }
}

// MARK: – ReceiptRow

private struct ReceiptRow: View {
    let item: CartItem

    var body: some View {
        HStack(spacing: 10) {
            // Mini sprite
            SpriteView(state: item.sprite)
                .frame(width: 40, height: 40)

            Text(item.name)
                .font(.system(size: 15, weight: .medium, design: .monospaced))
                .foregroundColor(AppColors.charcoal)
                .lineLimit(1)

            Spacer()

            Text(String(format: "$%.2f", item.price))
                .font(.system(size: 15, weight: .bold, design: .monospaced))
                .foregroundColor(AppColors.charcoal)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 6)
    }
}

// MARK: – ReceiptTotalRow

private struct ReceiptTotalRow: View {
    let label: String
    let value: String
    let isBold: Bool

    var body: some View {
        HStack {
            Text(label)
                .font(.system(
                    size: isBold ? 18 : 15,
                    weight: isBold ? .black : .medium,
                    design: .monospaced
                ))
                .foregroundColor(isBold ? AppColors.charcoal : AppColors.mutedText)

            Spacer()

            Text(value)
                .font(.system(
                    size: isBold ? 20 : 15,
                    weight: isBold ? .black : .medium,
                    design: .monospaced
                ))
                .foregroundColor(isBold ? AppColors.accent : AppColors.charcoal)
        }
    }
}

// MARK: – PAID Stamp

private struct PaidStamp: View {
    var body: some View {
        Text("PAID")
            .font(.system(size: 64, weight: .black, design: .rounded))
            .foregroundColor(AppColors.accentGreen.opacity(0.85))
            .padding(.horizontal, 24)
            .padding(.vertical, 10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(AppColors.accentGreen.opacity(0.85), lineWidth: 6)
            )
    }
}
