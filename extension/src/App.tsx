import { useEffect, useState } from 'react'
import { Readability } from '@mozilla/readability'

const API_URL = 'http://localhost:3000'

interface User {
  email: string
}

interface Profile {
  id: string
  name: string
}

interface JobData {
  url: string
  description: string
  company: string
  country: string
  industry: string
  format: string
  position: string
}

type AnalysisStatus = 'idle' | 'analyzing' | 'review' | 'error'

function App() {
  // Auth State
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Profile State
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  
  // Analysis State
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadPersistedState()
  }, [])

  const loadPersistedState = async () => {
    const result = await chrome.storage.local.get(['jobAnalysisStatus', 'jobAnalysisData'])
    if (result.jobAnalysisStatus) {
      setStatus(result.jobAnalysisStatus as AnalysisStatus)
    }
    if (result.jobAnalysisData) {
      setJobData(result.jobAnalysisData as JobData)
    }
  }

  const persistState = (newStatus: AnalysisStatus, newData: JobData | null) => {
    setStatus(newStatus)
    setJobData(newData)
    chrome.storage.local.set({
      jobAnalysisStatus: newStatus,
      jobAnalysisData: newData
    })
  }

  const checkAuth = async () => {
    try {
      setAuthLoading(true)
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
      setAuthLoading(false)
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

  const handleAnalyze = async () => {
    persistState('analyzing', null)
    setErrorMsg(null)

    try {
      // 1. Get Active Tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) throw new Error('No active tab')
      const tabUrl = tab.url || ''

      // 2. Inject Script to get HTML
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      })

      const html = injectionResults[0].result
      if (!html) throw new Error('Failed to get page content')

      // 3. Parse with Readability
      const doc = new DOMParser().parseFromString(html, "text/html")
      const reader = new Readability(doc)
      const article = reader.parse()
      
      const cleanText = article?.textContent || doc.body.innerText

      // 4. Send to LLM
      const res = await fetch(`${API_URL}/api/analyze-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText.substring(0, 15000) }), // Limit length
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Analysis failed')

      const apiData = await res.json()
      const finalData: JobData = { ...apiData, url: tabUrl }
      
      persistState('review', finalData)
      
    } catch (err: any) {
      console.error('Analysis Error:', err)
      setErrorMsg(err.message || 'Failed to analyze')
      persistState('idle', null)
    }
  }

  const handleApply = () => {
    console.log('Applying with:', { profileId: selectedProfileId, ...jobData })
    // Placeholder for DB insertion
    alert('Application simulated! Check console.')
  }

  const handleReset = () => {
    persistState('idle', null)
    setErrorMsg(null)
  }

  // --- Renders ---

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex h-full flex-col bg-white p-4 font-sans text-gray-900">
        <header className="mb-4 border-b pb-2">
          <h1 className="text-lg font-bold text-blue-600">Job Tracker</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-gray-600">
              Please sign in to track jobs.
            </p>
            <button
              onClick={handleLogin}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-white p-4 font-sans text-gray-900">
      <header className="mb-4 flex items-center justify-between border-b pb-2">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-blue-600">Job Tracker</h1>
          {user && <span className="text-xs text-gray-500">{user.email}</span>}
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500" title="Connected" />
      </header>

      <main className="flex flex-1 flex-col gap-4">
        {/* Profile Selector */}
        <div className="w-full">
            <label className="text-xs font-semibold text-gray-700 ml-1">Profile</label>
            <select 
              value={selectedProfileId} 
              onChange={handleProfileChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
        </div>

        {/* Status: Idle / Error */}
        {(status === 'idle' || status === 'error') && (
          <div className="mt-4 flex flex-col gap-2">
            {errorMsg && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-600 border border-red-200">
                Error: {errorMsg}
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!selectedProfileId}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Analyze Job
            </button>
          </div>
        )}

        {/* Status: Analyzing */}
        {status === 'analyzing' && (
           <div className="flex flex-1 flex-col items-center justify-center gap-3">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
             <p className="text-sm text-gray-600">Analyzing job details...</p>
             <p className="text-xs text-gray-400">You can close this popup.</p>
           </div>
        )}

        {/* Status: Review */}
        {status === 'review' && jobData && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-800 border-b pb-1">Review Details</h2>
            
            <div className="grid gap-2">
              <Input label="URL" value={jobData.url} onChange={v => setJobData({...jobData, url: v})} />
              <Input label="Position" value={jobData.position} onChange={v => setJobData({...jobData, position: v})} />
              <Input label="Company" value={jobData.company} onChange={v => setJobData({...jobData, company: v})} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Location" value={jobData.country} onChange={v => setJobData({...jobData, country: v})} />
                <Input label="Format" value={jobData.format} onChange={v => setJobData({...jobData, format: v})} />
              </div>
               <Input label="Industry" value={jobData.industry} onChange={v => setJobData({...jobData, industry: v})} />
               
               <div>
                 <label className="text-xs font-semibold text-gray-700">Description Summary</label>
                 <textarea 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-xs h-24"
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                 />
               </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleApply}
                className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Input({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <input 
        type="text"
        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default App
