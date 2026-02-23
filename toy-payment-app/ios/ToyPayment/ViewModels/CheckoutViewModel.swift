import Foundation
import CoreNFC

/// Manages NFC reading and checkout state.
@MainActor
final class CheckoutViewModel: ObservableObject {

    @Published var nfcAvailable: Bool = NFCTagReaderSession.readingAvailable
    @Published var isWaitingForTap = false
    @Published var tapResult: TapResult?

    enum TapResult {
        case approved
        case failed(String)
    }

    private var nfcService: NFCService?
    private let soundService = SoundService.shared

    // MARK: – NFC

    func startNFCSession() {
        guard NFCTagReaderSession.readingAvailable else {
            // NFC unavailable — fallback button handles this in the View
            return
        }
        isWaitingForTap = true
        tapResult = nil

        let service = NFCService()
        service.onTagDetected = { [weak self] in
            Task { @MainActor in
                self?.handleApproved()
            }
        }
        service.onError = { [weak self] message in
            Task { @MainActor in
                self?.isWaitingForTap = false
                self?.tapResult = .failed(message)
            }
        }
        self.nfcService = service
        service.start()
    }

    /// Called by the "PAY NOW" fallback button (no NFC hardware).
    func simulatePayment() {
        handleApproved()
    }

    private func handleApproved() {
        isWaitingForTap = false
        tapResult = .approved
        soundService.playPaymentApproved()
    }
}
