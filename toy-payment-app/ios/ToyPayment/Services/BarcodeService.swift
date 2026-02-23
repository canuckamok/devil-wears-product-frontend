import AVFoundation
import UIKit
import Combine

/// Manages AVCaptureSession for live camera preview + barcode detection.
/// Also provides a single-frame capture for vision classification.
@MainActor
final class BarcodeService: NSObject, ObservableObject {

    // MARK: – Published

    @Published var detectedBarcode: String?
    @Published var permissionDenied = false

    // MARK: – Internal

    let session = AVCaptureSession()

    private var lastBarcodeTime: Date = .distantPast
    private let barcodeCooldown: TimeInterval = 2.5 // don't re-scan the same item too fast

    private var photoOutput: AVCapturePhotoOutput?
    private var frameCaptureCompletion: ((UIImage) -> Void)?

    // MARK: – Setup

    func startSession() {
        Task.detached(priority: .userInitiated) { [weak self] in
            await self?.configureAndStart()
        }
    }

    func stopSession() {
        Task.detached(priority: .background) { [weak self] in
            self?.session.stopRunning()
        }
    }

    private func configureAndStart() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            if !granted {
                await MainActor.run { permissionDenied = true }
                return
            }
        case .denied, .restricted:
            await MainActor.run { permissionDenied = true }
            return
        case .authorized:
            break
        @unknown default:
            break
        }

        guard !session.isRunning else { return }

        session.beginConfiguration()
        session.sessionPreset = .high

        // Video input
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let videoInput = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(videoInput)
        else {
            session.commitConfiguration()
            return
        }
        session.addInput(videoInput)

        // Barcode metadata output
        let metadataOutput = AVCaptureMetadataOutput()
        if session.canAddOutput(metadataOutput) {
            session.addOutput(metadataOutput)
            metadataOutput.setMetadataObjectsDelegate(self, queue: .main)
            metadataOutput.metadataObjectTypes = [
                .ean13, .ean8, .upce, .code128, .code39, .qr, .dataMatrix
            ]
        }

        // Still photo output for frame capture
        let photo = AVCapturePhotoOutput()
        if session.canAddOutput(photo) {
            session.addOutput(photo)
            self.photoOutput = photo
        }

        session.commitConfiguration()
        session.startRunning()
    }

    // MARK: – Frame Capture

    /// Capture a single high-quality frame for visual identification.
    func captureFrame(completion: @escaping (UIImage) -> Void) {
        guard let photoOutput else { return }
        frameCaptureCompletion = completion

        let settings = AVCapturePhotoSettings()
        settings.flashMode = .off
        photoOutput.capturePhoto(with: settings, delegate: self)
    }
}

// MARK: – AVCaptureMetadataOutputObjectsDelegate

extension BarcodeService: AVCaptureMetadataOutputObjectsDelegate {

    nonisolated func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let value = obj.stringValue
        else { return }

        Task { @MainActor in
            guard Date().timeIntervalSince(self.lastBarcodeTime) >= self.barcodeCooldown else { return }
            self.lastBarcodeTime = Date()
            self.detectedBarcode = value
            // Reset after brief delay so the pipeline can detect the same barcode again
            try? await Task.sleep(nanoseconds: 500_000_000)
            self.detectedBarcode = nil
        }
    }
}

// MARK: – AVCapturePhotoCaptureDelegate

extension BarcodeService: AVCapturePhotoCaptureDelegate {

    nonisolated func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        guard error == nil,
              let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data)
        else { return }

        Task { @MainActor in
            self.frameCaptureCompletion?(image)
            self.frameCaptureCompletion = nil
        }
    }
}
