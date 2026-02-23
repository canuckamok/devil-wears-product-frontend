import SwiftUI

/// Full-screen celebration after successful NFC tap.
/// Auto-advances to receipt after AppConfig.celebrationDuration seconds.
struct CelebrationView: View {

    @EnvironmentObject var appVM: AppViewModel

    @State private var particles: [Particle] = []
    @State private var checkmarkScale: CGFloat = 0
    @State private var checkmarkOpacity: Double = 0
    @State private var screenFlash = true

    var body: some View {
        ZStack {
            // ── Flash background (brief green) ─────────────────────────────
            AppColors.accentGreen
                .opacity(screenFlash ? 0.4 : 0)
                .ignoresSafeArea()
                .animation(.easeOut(duration: 0.3), value: screenFlash)

            Color(hex: "#F0FFF4").ignoresSafeArea()

            // ── Confetti particles ─────────────────────────────────────────
            TimelineView(.animation) { timeline in
                Canvas { context, size in
                    for particle in particles {
                        let elapsed = timeline.date.timeIntervalSinceReferenceDate - particle.birthTime
                        let progress = min(elapsed / particle.lifetime, 1)
                        let x = particle.x + particle.vx * elapsed * size.width
                        let y = particle.y * size.height + particle.vy * elapsed * size.height + 200 * elapsed * elapsed
                        let opacity = 1.0 - progress
                        let scale = 1.0 - progress * 0.5

                        context.opacity = opacity
                        context.transform = CGAffineTransform(translationX: x, y: y)
                            .rotated(by: particle.rotation + elapsed * particle.rotationSpeed)
                            .scaledBy(x: scale, y: scale)

                        let rect = CGRect(x: -particle.size / 2, y: -particle.size / 2,
                                          width: particle.size, height: particle.size)
                        if particle.isCircle {
                            context.fill(Path(ellipseIn: rect), with: .color(particle.color))
                        } else {
                            context.fill(Path(rect), with: .color(particle.color))
                        }
                    }
                }
            }
            .ignoresSafeArea()

            // ── Checkmark + text ───────────────────────────────────────────
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(AppColors.accentGreen)
                        .frame(width: 160, height: 160)

                    Image(systemName: "checkmark")
                        .font(.system(size: 80, weight: .black))
                        .foregroundColor(.white)
                }
                .scaleEffect(checkmarkScale)
                .opacity(checkmarkOpacity)

                Text("APPROVED ✓")
                    .font(.system(size: 48, weight: .black, design: .rounded))
                    .foregroundColor(AppColors.accentGreen)
                    .scaleEffect(checkmarkScale)
                    .opacity(checkmarkOpacity)
            }
        }
        .onAppear {
            spawnConfetti()

            withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1)) {
                checkmarkScale = 1
                checkmarkOpacity = 1
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                screenFlash = false
            }

            // Auto-advance to receipt
            DispatchQueue.main.asyncAfter(deadline: .now() + AppConfig.celebrationDuration) {
                appVM.navigateTo(.receipt)
            }
        }
    }

    // MARK: – Confetti

    private func spawnConfetti() {
        let now = Date.timeIntervalSinceReferenceDate
        let colors: [Color] = [
            .red, .orange, .yellow, .green, .blue, .purple, .pink,
            AppColors.accent, AppColors.accentBlue, AppColors.accentGreen,
        ]
        particles = (0..<120).map { _ in
            Particle(
                x: CGFloat.random(in: 0.0...1.0),
                y: CGFloat.random(in: -0.3...0.1),
                vx: CGFloat.random(in: -0.05...0.05),
                vy: CGFloat.random(in: 0.05...0.3),
                size: CGFloat.random(in: 6...16),
                color: colors.randomElement()!,
                rotation: CGFloat.random(in: 0...(.pi * 2)),
                rotationSpeed: CGFloat.random(in: -3...3),
                lifetime: Double.random(in: 1.5...3.0),
                birthTime: now - Double.random(in: 0...0.2),
                isCircle: Bool.random()
            )
        }
    }
}

// MARK: – Particle model

private struct Particle {
    let x: CGFloat         // 0...1 normalized
    let y: CGFloat         // 0...1 normalized
    let vx: CGFloat        // velocity in screen-width/sec
    let vy: CGFloat        // velocity in screen-height/sec
    let size: CGFloat
    let color: Color
    let rotation: CGFloat
    let rotationSpeed: CGFloat
    let lifetime: Double
    let birthTime: TimeInterval
    let isCircle: Bool
}
