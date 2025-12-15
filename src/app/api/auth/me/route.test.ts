import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
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

describe('GET /api/auth/me', () => {
  it('returns authenticated: false when no user found', async () => {
    // Setup Mock
    mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' })

    const req = new NextRequest('http://localhost:3000/api/auth/me')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ authenticated: false, user: null })
  })

  it('returns authenticated: true and user data when logged in', async () => {
    // Setup Mock
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const req = new NextRequest('http://localhost:3000/api/auth/me')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ authenticated: true, user: mockUser })
  })
})
