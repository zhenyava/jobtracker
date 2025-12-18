import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
const mockGetUser = vi.fn()
const mockOrder = vi.fn()
const mockSelect = vi.fn(() => ({
  order: mockOrder
}))
const mockFrom = vi.fn(() => ({
  select: mockSelect
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

describe('GET /api/profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for guests', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' })
    
    const req = new NextRequest('http://localhost/api/profiles')
    const res = await GET(req)
    
    expect(res.status).toBe(401)
  })

  it('returns list for user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null })
    mockOrder.mockResolvedValue({ 
      data: [{ id: 'p-1', name: 'Dev' }], 
      error: null 
    })
    
    const req = new NextRequest('http://localhost/api/profiles')
    const res = await GET(req)
    
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual([{ id: 'p-1', name: 'Dev' }])
  })
})
