import SwiftUI
import AVFoundation

/// UIViewRepresentable that hosts a live AVCaptureSession preview layer.
struct CameraPreviewView: UIViewRepresentable {

    let session: AVCaptureSession

    func makeUIView(context: Context) -> PreviewUIView {
        let view = PreviewUIView()
        view.session = session
        return view
    }

    func updateUIView(_ uiView: PreviewUIView, context: Context) {}

    // MARK: – PreviewUIView

    final class PreviewUIView: UIView {

        override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }

        var previewLayer: AVCaptureVideoPreviewLayer {
            layer as! AVCaptureVideoPreviewLayer
        }

        var session: AVCaptureSession? {
            get { previewLayer.session }
            set { previewLayer.session = newValue }
        }

        override func layoutSubviews() {
            super.layoutSubviews()
            previewLayer.frame = bounds
            previewLayer.videoGravity = .resizeAspectFill
            // Rotate to match device orientation
            if let connection = previewLayer.connection, connection.isVideoRotationAngleSupported(90) {
                connection.videoRotationAngle = 90
            }
        }
    }
}
