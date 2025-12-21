import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

// Mock OpenAI
const mockCreateChatCompletion = vi.fn()
vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: mockCreateChatCompletion,
        },
      }
    },
  }
})

describe('POST /api/analyze-job', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' })

    const req = new NextRequest('http://localhost:3000/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify({ text: 'Some job description' }),
    })
    const res = await POST(req)
    
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 if text is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })

    const req = new NextRequest('http://localhost:3000/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify({}), // Missing text
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('calls OpenAI and returns parsed JSON on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })
    
    const mockResponse = {
      description: "A great job",
      company: "Tech Corp",
      country: "USA",
      industry: "SaaS",
      format: "remote",
      position: "Developer"
    }

    mockCreateChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockResponse),
          },
        },
      ],
    })

    const req = new NextRequest('http://localhost:3000/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify({ text: 'We are hiring a Developer at Tech Corp...' }),
    })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(mockResponse)
    expect(mockCreateChatCompletion).toHaveBeenCalled()
  })

  it('returns 500 if OpenAI fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })
    mockCreateChatCompletion.mockRejectedValue(new Error('OpenAI error'))

    const req = new NextRequest('http://localhost:3000/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify({ text: 'Job text' }),
    })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to analyze job')
  })
})
