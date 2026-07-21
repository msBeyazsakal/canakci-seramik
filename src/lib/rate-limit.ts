const attempts = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 dakika

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS }
  }

  record.count++
  attempts.set(key, record)

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count)
  return {
    allowed: record.count <= MAX_ATTEMPTS,
    remaining,
    resetIn: record.resetAt - now,
  }
}

export function clearRateLimit(key: string) {
  attempts.delete(key)
}
