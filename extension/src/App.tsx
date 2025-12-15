import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000'

interface User {
  email: string
}

function App() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      // credentials: 'include' is CRITICAL to send cookies
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      })
      
      if (!res.ok) throw new Error('Network response was not ok')
      
      const data = await res.json()
      setAuthenticated(data.authenticated)
      setUser(data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    // Open login page in new tab
    window.open(`${API_URL}/login`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex h-64 w-80 items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-64 w-80 flex-col bg-white p-4 font-sans text-gray-900 shadow-md">
      <header className="mb-4 flex items-center justify-between border-b pb-2">
        <h1 className="text-lg font-bold text-blue-600">Job Tracker</h1>
        {authenticated && (
          <div className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        {!authenticated ? (
          <>
            <p className="text-sm text-gray-600">
              You are not logged in. Please sign in to track jobs.
            </p>
            <button
              onClick={handleLogin}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-900">
                {user?.email}
              </p>
              <p className="text-xs text-green-600">
                Ready to track
              </p>
            </div>
            
            <button
              disabled
              className="mt-2 w-full cursor-not-allowed rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
            >
              Parse Job (Coming Soon)
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default App