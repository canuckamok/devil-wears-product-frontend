import type { Context } from 'hono'
import type { Env } from '../index'
import { getPriceForCategory } from '../utils/pricing'
import { moderateImage } from '../utils/moderation'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemini-2.0-flash'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
    }
    finishReason: string
  }>
}

interface ClassificationResult {
  item_name: string
  category: string
  confidence: number
}

interface ClassifyRequestBody {
  image_base64: string
  mime_type?: 'image/jpeg' | 'image/png' | 'image/webp'
}

export async function classifyHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  let body: ClassifyRequestBody
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { image_base64, mime_type = 'image/jpeg' } = body

  if (!image_base64 || typeof image_base64 !== 'string') {
    return c.json({ error: 'image_base64 (string) is required' }, 400)
  }

  // Step 1: Content moderation — fail-safe (reject if uncertain)
  const isSafe = await moderateImage(image_base64, c.env.OPENAI_API_KEY, mime_type)
  if (!isSafe) {
    return c.json({ safe: false })
  }

  // Step 2: Vision classification via Gemini 2.0 Flash
  let result: ClassificationResult
  try {
    result = await classifyWithGemini(image_base64, mime_type, c.env.GOOGLE_AI_API_KEY)
  } catch (err) {
    console.error('Gemini classification failed:', (err as Error).message)
    return c.json({ error: 'Classification service unavailable' }, 503)
  }

  // Step 3: Map category to price (deterministic by item name)
  const suggested_price = getPriceForCategory(result.category, result.item_name)

  return c.json({
    safe: true,
    item_name: result.item_name,
    category: result.category,
    suggested_price,
    confidence: result.confidence,
  })
}

async function classifyWithGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<ClassificationResult> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const systemPrompt = `You are a product identifier for a children's toy store app.
Identify the single main object visible in this image.
Respond ONLY with a JSON object — no markdown, no explanation.

Categories you must choose from:
- fresh_produce (fruits, vegetables)
- packaged_snack (chips, crackers, candy, granola bars)
- cereal_pasta_canned (cereal boxes, pasta boxes, canned goods)
- stuffed_animal_small (small plush toys, stuffed animals under ~30cm)
- stuffed_animal_large (large plush toys, stuffed animals over ~30cm)
- childrens_book (picture books, board books, story books)
- toy (action figures, dolls, vehicles, building sets, puzzles)
- board_game (board games, card games, game boxes)
- clothing (shirts, pants, shoes, hats, socks, jackets)
- household_item (cups, bottles, boxes, bags, containers, electronics)
- other (anything that doesn't fit the above)

JSON format:
{
  "item_name": "short, friendly name (2-4 words, e.g. 'Red Apple', 'Stuffed Bear', 'Lego Set')",
  "category": "one of the categories above",
  "confidence": 0.0
}

Set confidence to 0.0 if you cannot clearly identify a safe, everyday object.
Do not identify people, animals (non-toy), weapons, or anything inappropriate.`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
            { text: systemPrompt },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 200,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as GeminiResponse
  const rawText = data.candidates[0]?.content?.parts[0]?.text

  if (!rawText) {
    throw new Error('Gemini returned empty response')
  }

  const parsed = JSON.parse(rawText) as ClassificationResult

  // Validate the response structure
  if (
    typeof parsed.item_name !== 'string' ||
    typeof parsed.category !== 'string' ||
    typeof parsed.confidence !== 'number'
  ) {
    throw new Error('Gemini returned malformed JSON structure')
  }

  return parsed
}
