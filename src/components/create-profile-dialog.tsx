'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createJobProfile } from '@/actions/profile'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CreateProfileDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateProfileDialog({ trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreateProfileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await createJobProfile(name)

    if (res.success && res.data) {
      setName('')
      if (onOpenChange) onOpenChange(false)
      // Redirect to new profile
      router.push(`/dashboard?profileId=${res.data.id}`)
    } else {
      setError(res.error || 'Failed to create profile')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Job Profile</DialogTitle>
          <DialogDescription>
            Give your profile a clear name to organize your applications.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Senior Frontend Developer" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" disabled={loading || !name.trim()} className="w-full">
            {loading ? 'Creating...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
