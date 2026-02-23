import type { Context, Next } from 'hono'
import type { Env } from '../index'

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response> {
  const appToken = c.req.header('X-App-Token')

  if (!appToken || appToken !== c.env.APP_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return next()
}
