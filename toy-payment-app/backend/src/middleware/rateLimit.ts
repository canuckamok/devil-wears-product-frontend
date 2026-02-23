import type { Context, Next } from 'hono'
import type { Env } from '../index'

const REQUESTS_PER_MINUTE = 60
const WINDOW_SECONDS = 60

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response> {
  const ip =
    c.req.header('CF-Connecting-IP') ??
    c.req.header('X-Forwarded-For') ??
    'unknown'

  // Sliding window bucket keyed by IP + current minute
  const bucket = Math.floor(Date.now() / (WINDOW_SECONDS * 1000))
  const key = `rl:${ip}:${bucket}`

  try {
    const raw = await c.env.RATE_LIMIT_KV.get(key)
    const count = raw !== null ? parseInt(raw, 10) : 0

    if (count >= REQUESTS_PER_MINUTE) {
      return c.json({ error: 'Rate limit exceeded. Try again in a minute.' }, 429)
    }

    // Atomic increment with 2-minute TTL (covers current and next window)
    await c.env.RATE_LIMIT_KV.put(key, String(count + 1), {
      expirationTtl: WINDOW_SECONDS * 2,
    })
  } catch (err) {
    // KV unavailable — fail open to avoid outage, log the incident
    console.error('Rate limit KV error:', (err as Error).message)
  }

  return next()
}
