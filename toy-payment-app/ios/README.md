# Toy Store — iOS App

A toy payment terminal app for young children (ages 2–6). Scans real-world items, builds a cart with pixel art sprites, and accepts "payment" via any NFC card tap.

## Requirements

- Xcode 16+
- iOS 16+ deployment target
- Apple Developer account (for NFC entitlement — requires paid membership)
- XcodeGen: `brew install xcodegen`

## Setup

### 1. Generate the Xcode project

```bash
cd toy-payment-app/ios
xcodegen generate
open ToyPayment.xcodeproj
```

### 2. Configure the backend URL

In `ToyPayment/App/AppConfig.swift`:

```swift
static let backendBaseURL = "https://toy-payment-proxy.YOUR_SUBDOMAIN.workers.dev"
```

See `../backend/README.md` for how to get this URL.

### 3. Set the App Token

In `AppConfig.swift`, replace the `encoded` bytes array with the XOR-encoded version of your `APP_TOKEN` secret (run the Python snippet in the backend README).

### 4. Download the Core ML model

The app uses MobileNetV2 for on-device vision classification. Download it from:
https://developer.apple.com/machine-learning/models/

Look for **MobileNetV2** under "Image Classification". Download the `.mlmodel` file and drag it into the Xcode project under `ToyPayment/`.

If you skip this step, the app gracefully falls back to cloud classification for all items — it still works, it's just slower and costs a tiny amount per scan.

### 5. Add sprite assets

Sprites are CC0 pixel art from [Kenney.nl](https://kenney.nl/assets):

**Recommended packs:**
- [Pixel Platformer](https://kenney.nl/assets/pixel-platformer) — food, items, boxes
- [Food Kit](https://kenney.nl/assets/food-kit) — produce and packaged food
- [Animal Pack Redux](https://kenney.nl/assets/animal-pack-redux) — toy animals

Download and add PNGs to `ToyPayment/Resources/Sprites/` using the filenames listed in `SpriteManifest.json`.

**Alternatively:** Leave this empty and let the app generate sprites via the backend — it will cache them after the first scan of each item type.

### 6. Add sound assets

Add `.wav` files to `ToyPayment/Resources/Sounds/`:

| Filename | Description | Freesound ID (CC0) |
|---|---|---|
| `scan_beep.wav` | Supermarket scanner beep | [freesound.org/s/21101](https://freesound.org/s/21101/) |
| `card_approved.wav` | Card terminal approval beep | [freesound.org/s/398937](https://freesound.org/s/398937/) |
| `celebration.wav` | Cartoony celebration fanfare | [freesound.org/s/456965](https://freesound.org/s/456965/) |

Any CC0 `.wav` file at those filenames will work. The app degrades silently (no crash) if sounds are missing.

### 7. Set your Team ID

In `project.yml`, replace `YOUR_TEAM_ID` with your Apple Developer Team ID, then regenerate:

```bash
xcodegen generate
```

### 8. Build and run

Connect an iPhone (NFC requires a real device — simulator does not support CoreNFC or camera).

Select your device in Xcode and press **Run** (⌘R).

---

## Architecture

```
Views (SwiftUI)
  └── ViewModels (@MainActor, ObservableObject)
        ├── ScanViewModel — orchestrates the 5-step scan pipeline
        ├── CartViewModel — cart state (items, totals)
        ├── CheckoutViewModel — NFC session management
        └── AppViewModel — navigation / screen state
Services
  ├── BarcodeService — AVCaptureSession, barcode detection, frame capture
  ├── VisionService — Core ML / MobileNetV2 on-device classification
  ├── ProductLookupService — Open Food Facts + UPCitemdb barcode APIs
  ├── NFCService — CoreNFC NFCTagReaderSession (any tag type)
  ├── SpriteService — 3-level sprite resolution (local → disk cache → backend)
  ├── SoundService — AVAudioPlayer for bundled .wav files
  └── NetworkService — all backend proxy calls (single URLSession)
```

## Scan Pipeline

1. **Barcode** (AVFoundation) → product lookup (Open Food Facts → UPCitemdb)
2. **Local vision** (Vision + MobileNetV2) if confidence ≥ 0.75 → done
3. **Cloud vision** (backend /classify → Gemini 2.0 Flash) if local confidence low
4. Every item name passes **moderation** server-side before display
5. Sprite resolved: local bundle → disk cache → backend /generate-sprite (gpt-image-1)

## Offline behavior

- Barcode lookup: gracefully fails, falls through to vision
- Local vision: always available (on-device model)
- Cloud endpoints: gracefully skipped if unreachable
- Sprite generation: shows emoji placeholder if backend unreachable
- Cart and checkout: fully functional without internet

## COPPA Compliance

- No user accounts, no login, no onboarding
- No analytics SDKs, no tracking, no advertising identifiers
- No purchase history or session logging
- No in-app purchases
