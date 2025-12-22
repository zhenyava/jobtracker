import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

describe('POST /api/applications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup generic mock chain for DB operations
    mockFrom.mockReturnValue({
      insert: mockInsert,
    })
    mockInsert.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      single: mockSingle,
    })
  })

  const validPayload = {
    companyName: 'Tech Corp',
    jobUrl: 'https://example.com/job',
    description: 'Great job',
    workType: 'remote',
    industry: 'IT'
  }

  it('returns 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' })

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })
    
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 if validation fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })

    const invalidPayload = { ...validPayload, jobUrl: 'not-a-url' }
    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(invalidPayload)
    })

    const res = await POST(req)
    const json = await res.json()
    
    expect(res.status).toBe(400)
    expect(json.error).toBe('Validation Error')
  })

  it('creates application successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    const mockCreatedApp = { id: 'app-1', ...validPayload, user_id: 'user-123' }
    mockSingle.mockResolvedValue({ data: mockCreatedApp, error: null })

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockCreatedApp)

    // Verify DB call
    expect(mockFrom).toHaveBeenCalledWith('job_applications')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-123',
      company_name: 'Tech Corp',
      status: 'hr_screening'
    }))
  })

  it('returns 500 if database insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
