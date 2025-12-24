'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteJobProfile } from '@/actions/profile'
import { Button } from './ui/button'

interface DeleteProfileDialogProps {
  profileId: string
  profileName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProfileDialog({ profileId, profileName, open, onOpenChange }: DeleteProfileDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await deleteJobProfile(profileId)

      if (res.success) {
        onOpenChange(false)
      } else {
        setError(res.error || 'Failed to delete profile')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete &quot;{profileName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the profile and{' '}
            <strong className="font-bold text-red-500">all associated job applications.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} asChild>
            <Button variant="destructive" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
