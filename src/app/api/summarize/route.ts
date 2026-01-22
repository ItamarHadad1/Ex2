import { NextResponse } from 'next/server'

/**
 * In-memory cache for summaries
 * Key: text hash (simple hash of the text)
 * Value: { summary: string, timestamp: number }
 */
const cache = new Map<string, { summary: string; timestamp: number }>()

// Cache duration: 5 minutes (300,000 milliseconds)
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Simple hash function for cache keys
 */
function hashText(text: string): string {
  // Simple hash - in production, consider using crypto.createHash
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of Array.from(cache.entries())) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}

/**
 * Summarize text using LLM API
 * Supports OpenAI, Anthropic, and Groq
 */
async function summarizeWithLLM(
  text: string,
  apiKey: string,
  provider: string = 'openai'
): Promise<string> {
  const prompt = `Summarize the following text in up to 3 lines. Be concise and informative:\n\n${text}`

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(error.error?.message || 'OpenAI API error')
      }

      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || 'Summary not available'
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          messages: [
            { role: 'user', content: prompt },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(error.error?.message || 'Anthropic API error')
      }

      const data = await response.json()
      return data.content[0]?.text?.trim() || 'Summary not available'
    } else if (provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(error.error?.message || 'Groq API error')
      }

      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || 'Summary not available'
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error)
    throw error
  }
}

/**
 * POST /api/summarize
 * Summarize text using LLM API with caching
 * 
 * Request body:
 * {
 *   text: string - Text to summarize
 *   apiKey?: string - API key (optional, can be provided by client)
 *   provider?: string - Provider name: 'openai', 'anthropic', or 'groq'
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, apiKey, provider = 'openai' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Check cache first
    cleanExpiredCache()
    const cacheKey = hashText(text)
    const cached = cache.get(cacheKey)
    
    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < CACHE_DURATION) {
        return NextResponse.json({
          summary: cached.summary,
          cached: true,
        })
      }
    }

    // If no API key provided, return error
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please set it in Settings.' },
        { status: 400 }
      )
    }

    // Call LLM API
    const summary = await summarizeWithLLM(text, apiKey, provider)

    // Store in cache
    cache.set(cacheKey, {
      summary,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      summary,
      cached: false,
    })
  } catch (error) {
    console.error('Error in summarize API:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to summarize text',
      },
      { status: 500 }
    )
  }
}