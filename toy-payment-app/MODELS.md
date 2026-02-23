# AI Model Decisions

Researched February 2026. All pricing current as of that date.

---

## Vision Classification — POST /classify

**Chosen: Google Gemini 2.0 Flash** (`gemini-2.0-flash` via Google AI Generative Language API)

**Why:**
- Cheapest multimodal vision API available: **$0.08/1M input tokens, $0.30/1M output tokens**
- Excellent at identifying everyday household objects, food, toys — exactly our use case
- JSON mode (`response_mime_type: "application/json"`) makes structured extraction reliable
- No per-image pricing, purely token-based — predictable cost
- Free tier: 15 requests/minute, 1M tokens/day (plenty for a children's toy app)

**Rejected alternatives:**
- GPT-4o: $2.50/1M input tokens — 30× more expensive for same capability on simple object ID
- Claude Sonnet: $3.00/1M input tokens — overkill for this use case
- Google Cloud Vision API: Good but requires a different auth flow; Gemini Flash does the same job via one API

---

## Image Generation (Pixel Art Sprites) — POST /generate-sprite

**Chosen: OpenAI GPT Image 1** (`gpt-image-1` via OpenAI Images API)

**Why:**
- Replaced DALL-E entirely in late 2025; #1 on image quality leaderboards as of early 2026
- Native **transparent PNG output** (`output_format: "png"`) — critical for sprite-on-card UI
- Clean, simple REST API; no separate hosting infrastructure needed
- Pricing: ~$0.040/image at 1024×1024 — cost is negligible given sprite caching (same item never regenerated)
- Reliably follows style prompts: "8-bit pixel art, transparent background" produces consistent results

**Rejected alternatives:**
- FLUX.2 via external API (fal.ai, Replicate): Good quality but requires a third API vendor, more complex auth
- Cloudflare Workers AI (FLUX.1 Schnell): Available via bindings, but limited control over output format and transparent backgrounds are unreliable
- DALL-E 2: Explicitly excluded by spec; deprecated
- Stable Diffusion via ModelsLab: Good pixel art via LoRA but requires pipeline setup; adds latency and complexity

---

## Content Moderation — POST /moderate + inline in /classify and /generate-sprite

**Chosen: OpenAI omni-moderation-latest**

**Why:**
- **Free** — no cost at any volume
- Supports both text and image moderation in one model (text-moderation-* models deprecated October 27, 2025)
- 42% more accurate than previous generation (per OpenAI's own benchmarks)
- Built on GPT-4o; handles multilingual content well
- Fail-safe approach: if API is unreachable, we reject the content (never permit unknown content to reach children)

---

## Local iOS Vision Model

**Chosen: MobileNetV2 (Core ML)** via Apple's Vision framework

**Why:**
- Ships with iOS, zero network cost, runs in < 100ms on device
- 1,000-class ImageNet classification covers: bananas, apples, bottles, boxes, toys, clothing, books
- Confidence threshold: 0.75 (per spec) — escalate to cloud only when confidence is low
- No privacy concerns: images never leave device for common items

**Source:** Download from [Apple Core ML Models](https://developer.apple.com/machine-learning/models/) or via `coremltools` conversion.

---

## Cost Estimate (Toy App at Scale)

Assuming 1,000 scans/day (generous estimate for a children's toy app):
- Vision (20% needing cloud): 200 × ~$0.0002 = **$0.04/day**
- Sprite generation (cached after first gen, assume 50 unique items/day): 50 × $0.04 = **$2.00/day**
- Moderation: **$0.00** (free)

Total: ~**$2/day** at 1,000 scans/day. Negligible.
