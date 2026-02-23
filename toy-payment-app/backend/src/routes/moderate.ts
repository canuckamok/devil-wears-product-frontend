import type { Context } from 'hono'
import type { Env } from '../index'
import { moderateText } from '../utils/moderation'

interface ModerateRequestBody {
  text: string
}

export async function moderateHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  let body: ModerateRequestBody
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { text } = body

  if (!text || typeof text !== 'string') {
    return c.json({ error: 'text (string) is required' }, 400)
  }

  const isSafe = await moderateText(text.trim().slice(0, 500), c.env.OPENAI_API_KEY)
  return c.json({ safe: isSafe })
}
