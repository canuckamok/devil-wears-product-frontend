import { Hono } from 'hono'
import { classifyHandler } from './routes/classify'
import { generateSpriteHandler } from './routes/generate-sprite'
import { moderateHandler } from './routes/moderate'
import { rateLimitMiddleware } from './middleware/rateLimit'
import { authMiddleware } from './middleware/auth'

export interface Env {
  SPRITE_CACHE: KVNamespace
  RATE_LIMIT_KV: KVNamespace
  OPENAI_API_KEY: string
  GOOGLE_AI_API_KEY: string
  APP_TOKEN: string
}

const app = new Hono<{ Bindings: Env }>()

// Health check — no auth required
app.get('/health', (c) => c.json({ status: 'ok', ts: Date.now() }))

// All API routes require auth + rate limiting
app.use('/classify', rateLimitMiddleware)
app.use('/generate-sprite', rateLimitMiddleware)
app.use('/moderate', rateLimitMiddleware)
app.use('/classify', authMiddleware)
app.use('/generate-sprite', authMiddleware)
app.use('/moderate', authMiddleware)

app.post('/classify', classifyHandler)
app.post('/generate-sprite', generateSpriteHandler)
app.post('/moderate', moderateHandler)

// 404 catch-all
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler — never log image data
app.onError((err, c) => {
  console.error('Unhandled error:', err.message)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
