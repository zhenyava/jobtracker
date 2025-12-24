'use client'

import { deleteApplication, JobApplication, updateApplicationIndustry, updateApplicationStatus } from '@/actions/application'
import { EditableSelect } from '@/components/editable-select'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { INDUSTRY_OPTIONS, STATUS_OPTIONS } from '@/config/options'
import { MapPin, MoreHorizontal, Trash } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

interface ApplicationsTableProps {
  applications: JobApplication[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteApplication(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete application')
      } else {
        toast.success('Application deleted')
      }
    } catch {
      toast.error('Failed to delete application')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
        <p className="text-muted-foreground">No applications for this profile yet.</p>
      </div>
    )
  }

  return (
    <>
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
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th>
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
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setDeleteId(app.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this job application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
