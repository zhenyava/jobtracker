'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { renameJobProfile } from '@/actions/profile'

interface RenameProfileDialogProps {
  profileId: string
  currentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenameProfileDialog({ profileId, currentName, open, onOpenChange }: RenameProfileDialogProps) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await renameJobProfile(profileId, name)

    if (res.success && res.data) {
      if (onOpenChange) onOpenChange(false)
      // No need to redirect if we're just renaming, but revalidatePath should handle the update
    } else {
      setError(res.error || 'Failed to rename profile')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Job Profile</DialogTitle>
          <DialogDescription>
            Enter a new name for your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-profile-name">Profile Name</Label>
            <Input
              id="rename-profile-name"
              placeholder="e.g. Senior Frontend Developer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="w-full sm:w-auto">
              {loading ? 'Renaming...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
