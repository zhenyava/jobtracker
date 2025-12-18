import { getJobProfiles } from '@/actions/profile'
import { ProfileSidebar } from '@/components/profile-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: profiles } = await getJobProfiles()

  return (
    <div className="flex h-screen w-full">
      <ProfileSidebar profiles={profiles || []} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
