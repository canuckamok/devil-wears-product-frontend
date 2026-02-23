const MODERATION_URL = 'https://api.openai.com/v1/moderations'
const MODERATION_MODEL = 'omni-moderation-latest'

/**
 * Moderate a text string.
 * Returns true if safe, false if flagged or if the API is unreachable (fail-safe).
 * Never throws — always returns a boolean.
 */
export async function moderateText(text: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODERATION_MODEL,
        input: text,
      }),
    })

    if (!response.ok) {
      console.error('Moderation API non-OK status:', response.status)
      return false // fail-safe
    }

    const data = (await response.json()) as ModerationResponse
    return !data.results[0].flagged
  } catch (err) {
    console.error('Moderation API error:', (err as Error).message)
    return false // fail-safe
  }
}

/**
 * Moderate a base64-encoded image.
 * Uses omni-moderation-latest which supports image inputs.
 * Returns true if safe, false if flagged or unreachable.
 */
export async function moderateImage(
  imageBase64: string,
  apiKey: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<boolean> {
  try {
    const response = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODERATION_MODEL,
        input: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Image moderation API non-OK status:', response.status)
      return false // fail-safe
    }

    const data = (await response.json()) as ModerationResponse
    return !data.results[0].flagged
  } catch (err) {
    console.error('Image moderation API error:', (err as Error).message)
    return false // fail-safe
  }
}

interface ModerationResponse {
  results: Array<{
    flagged: boolean
    categories: Record<string, boolean>
    category_scores: Record<string, number>
  }>
}
