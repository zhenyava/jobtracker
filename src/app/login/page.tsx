'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react' // Using Chrome icon as a placeholder for Google
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Construct the redirect URL to point to our callback route
    // window.location.origin handles localhost vs production automatically
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Job Tracker account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              'Redirecting...'
            ) : (
              <>
                 Sign in with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
