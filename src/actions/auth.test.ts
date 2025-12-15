import { describe, it, expect, vi } from 'vitest'
import { signOutAction } from './auth'
import { redirect } from 'next/navigation'

// Mock dependencies
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('signOutAction', () => {
  it('calls supabase signOut and redirects to login', async () => {
    await signOutAction()
    
    expect(mockSignOut).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
