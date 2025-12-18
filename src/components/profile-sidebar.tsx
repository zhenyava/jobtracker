'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CreateProfileDialog } from './create-profile-dialog'
import { Briefcase, LogOut } from 'lucide-react'
import { signOutAction } from '@/actions/auth'

// Define type locally since we don't have shared type package yet for DB entities across components
interface Profile {
  id: string
  name: string
}

export function ProfileSidebar({ profiles }: { profiles: Profile[] }) {
  const searchParams = useSearchParams()
  const activeProfileId = searchParams.get('profileId')

  return (
    <div className="w-64 border-r h-full bg-muted/10 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-semibold text-sm">Job Profiles</span>
        <CreateProfileDialog />
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {profiles.map((profile) => (
          <Link 
            key={profile.id} 
            href={`/dashboard?profileId=${profile.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
              activeProfileId === profile.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span className="truncate">{profile.name}</span>
          </Link>
        ))}
        {profiles.length === 0 && (
          <div className="text-xs text-center text-muted-foreground p-4">
            No profiles yet.
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => signOutAction()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
