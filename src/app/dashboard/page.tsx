import { getApplications } from '@/actions/application'
import { getJobProfiles } from '@/actions/profile'
import { ApplicationStatusSelect } from '@/components/application-status-select'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  
  // 1. Fetch Profiles first
  const profilesRes = await getJobProfiles()
  const profiles = profilesRes.data || []
  
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

  // 2. Fetch Applications for active profile
  const applicationsRes = await getApplications(profileId)
  const applications = applicationsRes.data || []

  const activeProfile = profiles.find(p => p.id === profileId)

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{activeProfile?.name || 'Dashboard'}</h1>
        <p className="text-muted-foreground">Manage your applications for this profile.</p>
      </header>

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
        
        {applications.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
            <p className="text-muted-foreground">No applications for this profile yet.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Company</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[180px]">Status</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Applied</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold">{app.company_name}</span>
                          {app.location && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="mr-1 h-3 w-3" />
                              {app.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <ApplicationStatusSelect 
                          id={app.id} 
                          currentStatus={app.status} 
                        />
                      </td>
                      <td className="p-4 align-middle capitalize text-muted-foreground">
                        {app.work_type}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDate(app.applied_at)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link 
                          href={app.job_url} 
                          target="_blank"
                          className="text-blue-600 hover:underline text-xs font-medium inline-flex items-center"
                        >
                          View Job
                          <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
