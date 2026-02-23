import CoreNFC
import Foundation

/// Detects any NFC tag (ISO 7816, ISO 15693, MIFARE, FeliCa).
/// The specific card type doesn't matter — any valid tap triggers checkout.
final class NFCService: NSObject {

    var onTagDetected: (() -> Void)?
    var onError: ((String) -> Void)?

    private var session: NFCTagReaderSession?

    func start() {
        guard NFCTagReaderSession.readingAvailable else {
            onError?("NFC is not available on this device")
            return
        }

        session = NFCTagReaderSession(
            pollingOption: [.iso14443, .iso15693, .iso18092, .pace],
            delegate: self,
            queue: nil
        )
        session?.alertMessage = AppConfig.nfcScanMessage
        session?.begin()
    }
}

// MARK: – NFCTagReaderSessionDelegate

extension NFCService: NFCTagReaderSessionDelegate {

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        // Session is ready — no action needed
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        let nfcError = error as? NFCReaderError
        // User cancelled is not an error condition we need to surface
        if nfcError?.code == .readerSessionInvalidationErrorUserCanceled { return }
        if nfcError?.code == .readerSessionInvalidationErrorSessionTimeout { return }
        onError?(error.localizedDescription)
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let tag = tags.first else { return }

        // Connect to the tag to confirm it's valid
        session.connect(to: tag) { error in
            if let error {
                session.invalidate(errorMessage: "Connection failed: \(error.localizedDescription)")
                return
            }

            // We don't read any data — detection alone triggers payment
            session.alertMessage = "Payment Approved! ✓"
            session.invalidate()
            self.onTagDetected?()
        }
    }
}
