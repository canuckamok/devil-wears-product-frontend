import SwiftUI

/// Cart screen: all scanned items + running total + checkout button.
struct CartView: View {

    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var cartVM: CartViewModel

    var body: some View {
        VStack(spacing: 0) {
            // ── Header ─────────────────────────────────────────────────────
            HStack {
                Button {
                    appVM.navigateTo(.scan)
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(AppColors.charcoal)
                        .frame(width: 44, height: 44)
                }

                Spacer()

                Text("Your Cart 🛒")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundColor(AppColors.charcoal)

                Spacer()

                // Spacer to balance back button
                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, 16)
            .padding(.top, 20)
            .padding(.bottom, 12)

            // ── Item list ──────────────────────────────────────────────────
            if cartVM.isEmpty {
                Spacer()
                VStack(spacing: 16) {
                    Text("🛒")
                        .font(.system(size: 64))
                    Text("Cart is empty!")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundColor(AppColors.mutedText)
                    Button("Scan Items") {
                        appVM.navigateTo(.scan)
                    }
                    .font(.system(size: 18, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .frame(height: 56)
                    .background(AppColors.accent, in: Capsule())
                }
                Spacer()
            } else {
                ScrollView {
                    LazyVStack(spacing: 10) {
                        ForEach(cartVM.items) { item in
                            CartItemCard(item: item) {
                                withAnimation(.spring()) {
                                    cartVM.removeItem(id: item.id)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 20)
                }

                // ── Total + Checkout CTA ────────────────────────────────────
                VStack(spacing: 0) {
                    Divider()

                    VStack(spacing: 10) {
                        HStack {
                            Text("\(cartVM.items.count) item\(cartVM.items.count == 1 ? "" : "s")")
                                .font(.system(size: 17, weight: .semibold, design: .rounded))
                                .foregroundColor(AppColors.mutedText)
                            Spacer()
                            Text(cartVM.formattedSubtotal)
                                .font(.system(size: 17, weight: .semibold, design: .rounded))
                                .foregroundColor(AppColors.charcoal)
                        }

                        HStack {
                            Text("Total")
                                .font(.system(size: 26, weight: .black, design: .rounded))
                                .foregroundColor(AppColors.charcoal)
                            Spacer()
                            Text(cartVM.formattedTotal)
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .foregroundColor(AppColors.accent)
                        }

                        // Checkout button
                        Button {
                            appVM.navigateTo(.checkout)
                        } label: {
                            Label("Pay Now", systemImage: "creditcard.fill")
                                .font(.system(size: 22, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 68)
                                .background(AppColors.accentGreen, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        }
                        .padding(.top, 4)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 20)
                    .background(AppColors.surface)
                }
            }
        }
        .background(AppColors.background)
    }
}
