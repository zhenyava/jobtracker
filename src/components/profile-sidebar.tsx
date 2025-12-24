'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CreateProfileDialog } from './create-profile-dialog'
import { Briefcase, LogOut, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { signOutAction } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RenameProfileDialog } from './rename-profile-dialog'
import { useState } from 'react'
import { DeleteProfileDialog } from './delete-profile-dialog'

// Define type locally since we don't have shared type package yet for DB entities across components
interface Profile {
  id: string
  name: string
}

export function ProfileSidebar({ profiles }: { profiles: Profile[] }) {
  const searchParams = useSearchParams()
  const activeProfileId = searchParams.get('profileId')
  const [profileToRename, setProfileToRename] = useState<Profile | null>(null)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)

  return (
    <div className="w-64 border-r h-full bg-muted/10 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-semibold text-sm">Job Profiles</span>
        <CreateProfileDialog />
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {profiles.map((profile) => (
          <div key={profile.id} className="group relative flex items-center">
            <Link
              href={`/dashboard?profileId=${profile.id}`}
              className={cn(
                "flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                activeProfileId === profile.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.name}</span>
            </Link>
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setProfileToRename(profile)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setProfileToDelete(profile)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="text-xs text-center text-muted-foreground p-4">
            No profiles yet.
          </div>
        )}
      </div>

      {profileToRename && (
        <RenameProfileDialog
          profileId={profileToRename.id}
          currentName={profileToRename.name}
          open={!!profileToRename}
          onOpenChange={(open) => !open && setProfileToRename(null)}
        />
      )}

      {profileToDelete && (
        <DeleteProfileDialog
          profileId={profileToDelete.id}
          profileName={profileToDelete.name}
          open={!!profileToDelete}
          onOpenChange={(open) => !open && setProfileToDelete(null)}
        />
      )}

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
