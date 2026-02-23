import type { Context } from 'hono'
import type { Env } from '../index'
import { moderateText } from '../utils/moderation'

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations'
const IMAGE_MODEL = 'gpt-image-1'

interface GenerateSpriteRequestBody {
  item_name: string
  category: string
}

interface OpenAIImageResponse {
  data: Array<{
    b64_json: string
  }>
}

export async function generateSpriteHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  let body: GenerateSpriteRequestBody
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { item_name, category } = body

  if (!item_name || typeof item_name !== 'string') {
    return c.json({ error: 'item_name (string) is required' }, 400)
  }

  const safeItemName = item_name.trim().slice(0, 100) // cap length

  // Step 1: Content moderation on item name — fail-safe
  const isSafe = await moderateText(safeItemName, c.env.OPENAI_API_KEY)
  if (!isSafe) {
    return c.json({ safe: false })
  }

  // Step 2: Check sprite cache (never regenerate the same item)
  const cacheKey = buildCacheKey(safeItemName, category)
  const cached = await c.env.SPRITE_CACHE.get(cacheKey, 'text')
  if (cached !== null) {
    return c.json({ safe: true, image_base64: cached })
  }

  // Step 3: Generate sprite via OpenAI GPT Image 1
  let imageBase64: string
  try {
    imageBase64 = await generatePixelArtSprite(safeItemName, category, c.env.OPENAI_API_KEY)
  } catch (err) {
    console.error('Sprite generation failed:', (err as Error).message)
    return c.json({ error: 'Image generation service unavailable' }, 503)
  }

  // Step 4: Cache indefinitely (sprites are deterministic by name — no need to expire)
  await c.env.SPRITE_CACHE.put(cacheKey, imageBase64)

  return c.json({ safe: true, image_base64: imageBase64 })
}

function buildCacheKey(itemName: string, category: string): string {
  // Simple, stable key from name + category
  const normalized = `${itemName}:${category ?? 'other'}`
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, '_')
  return `sprite:${normalized}`
}

async function generatePixelArtSprite(
  itemName: string,
  category: string,
  apiKey: string
): Promise<string> {
  const categoryHint = getCategoryStyleHint(category)

  const prompt =
    `Simple pixel art sprite of ${itemName}. ` +
    `8-bit style, cheerful, clean. ` +
    `${categoryHint}` +
    `Transparent background. ` +
    `Single object centered in frame, no background scenery, no text. ` +
    `Bold outlines, saturated friendly colors. ` +
    `Suitable for a young children's store app.`

  const response = await fetch(OPENAI_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: '1024x1024',
      output_format: 'png', // supports alpha channel
      quality: 'low', // 'low' is ~$0.011/image vs 'high' ~$0.040 — fine for 64px display
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI Images API ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as OpenAIImageResponse
  const b64 = data.data[0]?.b64_json

  if (!b64) {
    throw new Error('OpenAI returned no image data')
  }

  return b64
}

function getCategoryStyleHint(category: string): string {
  const hints: Record<string, string> = {
    fresh_produce: 'Bright round fruit or vegetable shape. ',
    packaged_snack: 'Small rectangular or bag-shaped package. ',
    cereal_pasta_canned: 'Box or can shape, label facing forward. ',
    stuffed_animal_small: 'Cute fluffy plush toy animal, rounded and soft-looking. ',
    stuffed_animal_large: 'Large cute plush toy animal, front-facing. ',
    childrens_book: 'Rectangular book with colorful cover, slightly tilted. ',
    toy: 'Fun colorful toy shape. ',
    board_game: 'Square box with colorful top. ',
    clothing: 'Flat front-facing clothing item. ',
    household_item: 'Simple everyday household object. ',
  }
  return hints[category] ?? ''
}
