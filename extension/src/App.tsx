import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000'

interface User {
  email: string
}

interface Profile {
  id: string
  name: string
}

function App() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      })
      
      if (!res.ok) throw new Error('Network response was not ok')
      
      const data = await res.json()
      setAuthenticated(data.authenticated)
      setUser(data.user)

      if (data.authenticated) {
        await fetchProfiles()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profiles`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch profiles')
      const data = await res.json()
      setProfiles(data)
      if (data.length > 0) {
        // Restore selection from storage or default to first
        const saved = localStorage.getItem('lastProfileId')
        const found = data.find((p: Profile) => p.id === saved)
        setSelectedProfileId(found ? found.id : data[0].id)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedProfileId(id)
    localStorage.setItem('lastProfileId', id)
  }

  const handleLogin = () => {
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

      <main className="flex flex-1 flex-col items-center gap-4 text-center">
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
            <div className="flex flex-col items-center gap-1 w-full">
              <p className="text-xs text-gray-500">Logged in as {user?.email}</p>
              
              <div className="w-full mt-2 text-left">
                <label className="text-xs font-semibold text-gray-700 ml-1">Select Profile</label>
                {profiles.length > 0 ? (
                  <select 
                    value={selectedProfileId} 
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 border"
                  >
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-red-500 mt-2 border p-2 rounded bg-red-50">
                    No profiles found. Create one on the dashboard.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1"></div>

            <button
              disabled={!selectedProfileId}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                selectedProfileId 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
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