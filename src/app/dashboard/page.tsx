import { getJobProfiles } from '@/actions/profile'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const { data: profiles } = await getJobProfiles()
  
  const hasProfiles = profiles && profiles.length > 0
  const profileId = resolvedSearchParams.profileId

  // Zero State
  if (!hasProfiles) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">You have no profiles yet</h2>
          <p className="text-muted-foreground max-w-sm">
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

  const activeProfile = profiles.find(p => p.id === profileId)

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{activeProfile?.name || 'Dashboard'}</h1>
        <p className="text-muted-foreground">Manage your applications for this profile.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder for future stats */}
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow">
          <div className="font-semibold">Total Applications</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </div>
  )
}
