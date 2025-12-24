import { getApplications } from '@/actions/application'
import { getJobProfiles } from '@/actions/profile'
import { ApplicationsTable } from '@/components/applications-table'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  
  // 1. Fetch Profiles first
  const profilesRes = await getJobProfiles()
  
  if (!profilesRes.success) {
    return (
      <div className="p-8">
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold">Error loading profiles</h2>
          <p className="text-sm">{profilesRes.error || 'Please try again later.'}</p>
        </div>
      </div>
    )
  }

  const profiles = profilesRes.data || []
  const hasProfiles = profiles.length > 0
  const profileId = resolvedSearchParams.profileId

  // Zero State
  if (!hasProfiles) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">You have no profiles yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Create a profile (e.g., &#39;Senior React Developer&#39;) to start tracking your job applications.
          </p>
        </div>
        <CreateProfileDialog 
          trigger={<Button size="lg">Create Profile</Button>}
        />
      </div>
    )
  }

  // Redirect if no profile selected
  if (!profileId) {
    redirect(`/dashboard?profileId=${profiles[0].id}`)
  }

  // 2. Fetch Applications for active profile
  const applicationsRes = await getApplications(profileId)
  
  if (!applicationsRes.success) {
    console.error('Failed to load applications:', applicationsRes.error)
    // We'll show an error banner but keep the page layout if possible
  }

  const applications = applicationsRes.data || []
  const activeProfile = profiles.find(p => p.id === profileId)

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{activeProfile?.name || 'Dashboard'}</h1>
        <p className="text-muted-foreground">Manage your applications for this profile.</p>
      </header>

      {!applicationsRes.success && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
          <p className="text-sm font-medium">Failed to load applications. Showing cached or empty data.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Applications</div>
          <div className="text-2xl font-bold mt-2">{applications.length}</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Applications</h2>
        
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  )
}