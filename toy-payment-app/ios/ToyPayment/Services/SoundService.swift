import AVFoundation
import UIKit

/// Manages all bundled audio playback.
/// All sounds are loaded at init — no streaming, no network.
///
/// Required audio files (add to Xcode project Resources/Sounds/):
///   scan_beep.wav     — realistic supermarket scanner beep
///   register_ding.wav — classic cash register ding
///   card_approved.wav — card terminal approval beep (short, professional)
///   celebration.wav   — cartoony celebratory sound (coins, fanfare)
///
/// Sources: freesound.org CC0 assets — see README for exact file IDs.
final class SoundService {

    static let shared = SoundService()
    private init() { prepare() }

    private var scanPlayer: AVAudioPlayer?
    private var registerPlayer: AVAudioPlayer?
    private var approvedPlayer: AVAudioPlayer?
    private var celebrationPlayer: AVAudioPlayer?

    // MARK: – Public API

    func playScanBeep() {
        scanPlayer?.play()
    }

    func playPaymentApproved() {
        approvedPlayer?.play()
        // Layer celebratory sound with slight delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.celebrationPlayer?.play()
        }
    }

    // MARK: – Setup

    private func prepare() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            // Non-fatal — sounds simply won't play if session setup fails
        }

        scanPlayer = loadPlayer(filename: "scan_beep", ext: "wav")
        registerPlayer = loadPlayer(filename: "register_ding", ext: "wav")
        approvedPlayer = loadPlayer(filename: "card_approved", ext: "wav")
        celebrationPlayer = loadPlayer(filename: "celebration", ext: "wav")

        // Preload buffers
        [scanPlayer, registerPlayer, approvedPlayer, celebrationPlayer].forEach {
            $0?.prepareToPlay()
        }
    }

    private func loadPlayer(filename: String, ext: String) -> AVAudioPlayer? {
        guard let url = Bundle.main.url(forResource: filename, withExtension: ext) else {
            return nil
        }
        return try? AVAudioPlayer(contentsOf: url)
    }
}
