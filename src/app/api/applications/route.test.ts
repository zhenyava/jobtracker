import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()
const mockEq = vi.fn()

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
    
    // Setup Generic Mock Chain
    // These defaults help simple tests pass without complex setup
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert
    })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockSingle.mockResolvedValue({ data: null, error: null })
  })

  const validPayload = {
    profileId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
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

  it('returns 400 if validation fails (missing profileId)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { profileId, ...invalidPayload } = validPayload
    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(invalidPayload)
    })

    const res = await POST(req)
    const json = await res.json()
    
    expect(res.status).toBe(400)
    expect(json.error).toBe('Validation Error')
  })

  it('returns 400 if profile does not belong to user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    // Mock Profile Check Failure (return null)
    // We override the default mockSingle behavior for this test
    const mockProfileChain: Record<string, unknown> = {}
    mockProfileChain.select = vi.fn().mockReturnValue(mockProfileChain)
    mockProfileChain.eq = vi.fn().mockReturnValue(mockProfileChain)
    mockProfileChain.single = vi.fn().mockResolvedValue({ data: null, error: 'Not found' })

    mockFrom.mockImplementation((table) => {
      if (table === 'job_profiles') return mockProfileChain
      return {}
    })

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates application successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    const mockCreatedApp = { id: 'app-1', ...validPayload, user_id: 'user-123' }
    
    // Mock Profile Check Success
    const mockProfileChain: Record<string, unknown> = {}
    mockProfileChain.select = vi.fn().mockReturnValue(mockProfileChain)
    mockProfileChain.eq = vi.fn().mockReturnValue(mockProfileChain)
    mockProfileChain.single = vi.fn().mockResolvedValue({ data: { id: 'profile-123' }, error: null })

    // Mock Insert Success
    const mockInsertChain: Record<string, unknown> = {}
    mockInsertChain.insert = vi.fn().mockReturnValue(mockInsertChain)
    mockInsertChain.select = vi.fn().mockReturnValue(mockInsertChain)
    mockInsertChain.single = vi.fn().mockResolvedValue({ data: mockCreatedApp, error: null })

    mockFrom.mockImplementation((table) => {
      if (table === 'job_profiles') return mockProfileChain
      if (table === 'job_applications') return mockInsertChain
      return {}
    })

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockCreatedApp)
  })
})