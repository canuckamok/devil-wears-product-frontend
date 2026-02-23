# Toy Payment Proxy — Cloudflare Worker

Backend proxy that keeps all third-party API keys off the iOS device.

## Architecture

```
iOS App → X-App-Token → Cloudflare Worker → Gemini 2.0 Flash (vision)
                                           → OpenAI gpt-image-1 (sprite gen)
                                           → OpenAI omni-moderation-latest (free)
                                           → Cloudflare KV (sprite cache + rate limiting)
```

**Rate limiting:** 60 requests/IP/minute via Cloudflare KV.
**Auth:** Static `X-App-Token` header prevents casual abuse.
**Data policy:** Never logs image data or item names — minimal retention.

---

## Prerequisites

- Node.js 18+
- A Cloudflare account (free tier is sufficient)
- OpenAI API key (for moderation + image generation)
- Google AI API key (for Gemini 2.0 Flash vision)

---

## Deploy

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Install dependencies

```bash
cd toy-payment-app/backend
npm install
```

### 3. Create KV namespaces

```bash
# Sprite cache (stores generated sprite images indefinitely)
wrangler kv:namespace create SPRITE_CACHE
wrangler kv:namespace create SPRITE_CACHE --preview

# Rate limiting (short TTL counters)
wrangler kv:namespace create RATE_LIMIT_KV
wrangler kv:namespace create RATE_LIMIT_KV --preview
```

Copy the `id` values into `wrangler.toml`, replacing the `REPLACE_WITH_YOUR_*` placeholders.

### 4. Set secrets

```bash
wrangler secret put OPENAI_API_KEY
# paste your OpenAI API key when prompted

wrangler secret put GOOGLE_AI_API_KEY
# paste your Google AI API key when prompted

wrangler secret put APP_TOKEN
# choose any random string, e.g.: openssl rand -hex 32
# copy this string — you'll need it for the iOS app
```

### 5. Deploy

```bash
npm run deploy
```

Wrangler will print your worker URL, e.g.:
`https://toy-payment-proxy.YOUR_SUBDOMAIN.workers.dev`

### 6. Update iOS app

In `ToyPayment/App/AppConfig.swift`, update:

```swift
static let backendBaseURL = "https://toy-payment-proxy.YOUR_SUBDOMAIN.workers.dev"
```

Also update the obfuscated `appToken` constant. Run the helper:

```bash
python3 - <<'EOF'
import sys
token = input("Enter your APP_TOKEN: ")
key = 0x5A
encoded = [b ^ key for b in token.encode()]
print("Encoded bytes:", encoded)
EOF
```

Replace the `encoded` array in `AppConfig.swift` with the output.

---

## Local Development

```bash
npm run dev
# Worker runs at http://localhost:8787
```

In AppConfig.swift, temporarily set:
```swift
static let backendBaseURL = "http://localhost:8787"
```

Use a tool like curl or Postman to test endpoints:

```bash
# Health check (no auth needed)
curl http://localhost:8787/health

# Moderation check
curl -X POST http://localhost:8787/moderate \
  -H "Content-Type: application/json" \
  -H "X-App-Token: your_token" \
  -d '{"text": "red apple"}'

# Sprite generation
curl -X POST http://localhost:8787/generate-sprite \
  -H "Content-Type: application/json" \
  -H "X-App-Token: your_token" \
  -d '{"item_name": "Red Apple", "category": "fresh_produce"}'
```

---

## Endpoints

### `GET /health`
No auth required. Returns `{ "status": "ok" }`.

### `POST /classify`
**Auth:** `X-App-Token` header required.
**Body:** `{ "image_base64": "..." }`
**Response (safe):** `{ "safe": true, "item_name": "...", "category": "...", "suggested_price": 2.99, "confidence": 0.91 }`
**Response (unsafe):** `{ "safe": false }`

Vision model: **Gemini 2.0 Flash** — $0.08/1M tokens.

### `POST /generate-sprite`
**Auth:** `X-App-Token` header required.
**Body:** `{ "item_name": "Red Apple", "category": "fresh_produce" }`
**Response (safe):** `{ "safe": true, "image_base64": "..." }` (PNG with alpha channel, base64)
**Response (unsafe):** `{ "safe": false }`

Sprites are cached indefinitely in KV. Same item = same cost = $0 after first generation.
Image model: **OpenAI gpt-image-1** — ~$0.011/image at `low` quality.

### `POST /moderate`
**Auth:** `X-App-Token` header required.
**Body:** `{ "text": "..." }`
**Response:** `{ "safe": true }` or `{ "safe": false }`

Moderation model: **OpenAI omni-moderation-latest** — free.

---

## Cost Estimate

At 1,000 scans/day:
- Vision (20% cloud fallback): 200 × ~$0.0002 = **$0.04/day**
- Sprites (50 unique items, cached after first): 50 × $0.011 = **$0.55/day** first day, **$0/day** after
- Moderation: **$0.00** (free)

Monthly ceiling: **~$2–5/month** for a toy app used by one family.

---

## Updating

```bash
# Edit code, then:
npm run deploy
```

Changes take effect in seconds with zero downtime.
