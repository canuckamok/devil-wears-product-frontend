import SwiftUI

/// A single card in the cart showing pixel art sprite + name + price.
struct CartItemCard: View {

    let item: CartItem
    let onRemove: () -> Void

    @State private var scale: CGFloat = 0.85
    @State private var opacity: Double = 0

    var body: some View {
        HStack(spacing: 14) {
            // ── Sprite ────────────────────────────────────────────────────
            SpriteView(state: item.sprite)
                .frame(width: 72, height: 72)

            // ── Name ──────────────────────────────────────────────────────
            VStack(alignment: .leading, spacing: 2) {
                Text(item.name)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(AppColors.charcoal)
                    .lineLimit(2)

                Text(ItemCategory.from(apiCategory: item.category).displayName)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundColor(AppColors.mutedText)
            }

            Spacer()

            // ── Price ─────────────────────────────────────────────────────
            Text(String(format: "$%.2f", item.price))
                .font(.system(size: 19, weight: .black, design: .rounded))
                .foregroundColor(AppColors.charcoal)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(AppColors.surface, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .shadow(color: .black.opacity(0.06), radius: 8, y: 3)
        .scaleEffect(scale)
        .opacity(opacity)
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                scale = 1
                opacity = 1
            }
        }
        // Tap to remove (parent-facing — no prominent UI cue)
        .onLongPressGesture(minimumDuration: 0.6) {
            onRemove()
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive, action: onRemove) {
                Label("Remove", systemImage: "trash")
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.name), \(String(format: "$%.2f", item.price))")
        .accessibilityHint("Swipe left to remove")
    }
}

// MARK: – SpriteView

struct SpriteView: View {

    let state: SpriteState

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(AppColors.softGray)

            switch state {
            case .loading:
                ShimmerView()
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            case .local(let image), .generated(let image):
                Image(uiImage: image)
                    .resizable()
                    .interpolation(.none) // crisp pixel art — no anti-aliasing
                    .scaledToFit()
                    .padding(6)

            case .placeholder(let emoji):
                Text(emoji)
                    .font(.system(size: 36))
            }
        }
    }
}

// MARK: – Shimmer

private struct ShimmerView: View {

    @State private var phase: CGFloat = -1

    var body: some View {
        GeometryReader { geo in
            LinearGradient(
                colors: [
                    Color.gray.opacity(0.15),
                    Color.gray.opacity(0.3),
                    Color.gray.opacity(0.15),
                ],
                startPoint: .init(x: phase, y: 0),
                endPoint: .init(x: phase + 1, y: 0)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
        }
    }
}
