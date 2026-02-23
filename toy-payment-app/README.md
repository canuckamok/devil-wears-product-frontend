# Toy Store — Toy Payment Terminal App

A satirical toy payment terminal for young children (ages 2–6). Scan real household items, build a cart with animated pixel art sprites, and "pay" by tapping any NFC card.

**Platform:** iOS (SwiftUI, iOS 16+)
**Backend:** Cloudflare Worker (TypeScript)
**App Store status:** Pre-release / development

---

## Repository Layout

```
toy-payment-app/
├── MODELS.md          # AI model decisions and cost analysis
├── backend/           # Cloudflare Worker proxy (keep API keys off device)
│   ├── README.md      # Full deployment guide
│   ├── wrangler.toml
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── classify.ts       # POST /classify (Gemini 2.0 Flash vision)
│       │   ├── generate-sprite.ts # POST /generate-sprite (gpt-image-1)
│       │   └── moderate.ts       # POST /moderate (omni-moderation-latest)
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── rateLimit.ts
│       └── utils/
│           ├── moderation.ts
│           └── pricing.ts
└── ios/
    ├── README.md      # iOS setup guide
    ├── project.yml    # XcodeGen config (run `xcodegen generate`)
    └── ToyPayment/
        ├── App/
        │   ├── ToyPaymentApp.swift
        │   └── AppConfig.swift   # ← update BackendBaseURL here
        ├── Models/
        ├── ViewModels/
        ├── Views/
        ├── Services/
        ├── Resources/Sprites/
        │   └── SpriteManifest.json
        ├── Info.plist
        └── ToyPayment.entitlements
```

---

## Quick Start

**Step 1 — Deploy backend:**
```bash
cd backend && npm install && npm run deploy
```
See `backend/README.md` for full instructions including secret setup.

**Step 2 — Build iOS app:**
```bash
cd ios && xcodegen generate && open ToyPayment.xcodeproj
```
See `ios/README.md` for model download, sprite assets, and sound setup.

---

## AI Models Used

| Task | Model | Cost |
|------|-------|------|
| Vision classification | Gemini 2.0 Flash | $0.08/1M tokens |
| Pixel art sprite generation | OpenAI gpt-image-1 | ~$0.011/image (cached) |
| Content moderation | OpenAI omni-moderation-latest | Free |
| On-device vision | Apple MobileNetV2 (Core ML) | Free |

Full rationale in `MODELS.md`.

---

## Build Order (as implemented)

1. ✅ Cloudflare Worker scaffold (all three endpoints, rate limiting, auth)
2. ✅ iOS scaffold: MVVM, AppConfig, ContentView, navigation
3. ✅ Barcode scanning → product lookup → cart
4. ✅ Local sprite library + SpriteManifest + cart UI
5. ✅ NFC detection + celebration animation + receipt screen
6. ✅ Backend wired: classify, generate-sprite, moderate
7. 🔲 Sound assets (bundle .wav files per ios/README.md)
8. 🔲 Sprite assets (download Kenney.nl CC0 PNGs per ios/README.md)
9. 🔲 Core ML model (download MobileNetV2 from Apple per ios/README.md)
10. 🔲 Set Apple Developer Team ID in project.yml → xcodegen regenerate

---

## Out of Scope (v1)

- Parent dashboard or admin settings
- Editable item names or prices
- Purchase history or session logging
- Parental PIN or content controls UI
- User accounts of any kind
- In-app purchases or subscriptions
