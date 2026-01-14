'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function DevAutoLogin() {
  const [status, setStatus] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Double check to ensure this never runs in production builds
    if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_E2E_TESTING === 'true') return

    const loginDevUser = async () => {
      const supabase = createClient()
      
      // 1. Check if already logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return

      setStatus('Dev: Auto-logging in...')

      const email = 'developer@local.com'
      const password = 'dev-password-123'

      // 2. Try Login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        setStatus('Dev: Logged in')
        router.refresh()
        return
      }

      // 3. If login failed, try Sign Up
      // We assume failure means user doesn't exist.
      // In a real app, we might check error.message/status, but for local dev this is fine.
      setStatus('Dev: Creating account...')
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        console.error('Dev auto-login failed:', signUpError)
        setStatus('Dev: Login Error (Check Console)')
      } else {
        setStatus('Dev: Account created')
        router.refresh()
      }
    }

    loginDevUser()
  }, [router])

  // Don't render anything if not in dev or no status update needed
  if (process.env.NODE_ENV !== 'development' || !status) return null

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-mono shadow-lg z-[9999] opacity-90 pointer-events-none transition-opacity">
      {status}
    </div>
  )
}
