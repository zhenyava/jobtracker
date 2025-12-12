import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from './page'

// Mock the Supabase client
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth.mockResolvedValue({ error: null }),
    },
  }),
}))

describe('LoginPage', () => {
  it('renders the welcome message', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeDefined()
    expect(screen.getByText('Sign in to your Job Tracker account')).toBeDefined()
  })

  it('renders the google login button', () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /sign in with google/i })
    expect(button).toBeDefined()
  })

  it('calls signInWithOAuth when button is clicked', () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /sign in with google/i })
    
    fireEvent.click(button)
    
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback?next=/dashboard'),
      })
    }))
  })
})
