import { getApplications, updateApplicationIndustry, updateApplicationStatus } from '@/actions/application'
import { getJobProfiles } from '@/actions/profile'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { EditableSelect } from '@/components/editable-select'
import { Button } from '@/components/ui/button'
import { INDUSTRY_OPTIONS, STATUS_OPTIONS } from '@/config/options'
import { Briefcase, MapPin } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[280px]">Company</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[200px]">Industry</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[180px]">Status</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[120px]">Work Type</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[120px]">Applied</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-[80px]">URL</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold truncate max-w-[260px]" title={app.company_name}>
                            {app.company_name}
                          </span>
                          {app.location && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1 truncate max-w-[260px]">
                              <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                              {app.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <EditableSelect 
                          initialValue={app.industry || ''}
                          options={INDUSTRY_OPTIONS}
                          onUpdate={updateApplicationIndustry.bind(null, app.id)}
                          placeholder="Select industry"
                        />
                      </td>
                      <td className="p-4 align-middle">
                        <EditableSelect 
                          initialValue={app.status}
                          options={STATUS_OPTIONS}
                          onUpdate={updateApplicationStatus.bind(null, app.id)}
                          placeholder="Select status"
                          className="min-w-[140px]"
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
                          Link
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