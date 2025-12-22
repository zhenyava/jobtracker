'use client'

import { updateApplicationStatus } from '@/actions/application'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface ApplicationStatusSelectProps {
  id: string
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: 'hr_screening', label: 'HR Screening', color: 'bg-blue-100 text-blue-700 border-blue-200 focus:bg-blue-100 focus:text-blue-700' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-700 border-green-200 focus:bg-green-100 focus:text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200 focus:bg-red-100 focus:text-red-700' },
  { value: 'not_responded', label: 'Not Responded', color: 'bg-gray-100 text-gray-700 border-gray-200 focus:bg-gray-100 focus:text-gray-700' },
  { value: 'interview_1', label: '1st Interview', color: 'bg-purple-100 text-purple-700 border-purple-200 focus:bg-purple-100 focus:text-purple-700' },
  { value: 'interview_2', label: '2nd Interview', color: 'bg-purple-100 text-purple-700 border-purple-200 focus:bg-purple-100 focus:text-purple-700' },
]

export function ApplicationStatusSelect({ id, currentStatus }: ApplicationStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleValueChange = (newStatus: string) => {
    setStatus(newStatus) // Optimistic update
    
    startTransition(async () => {
      const result = await updateApplicationStatus(id, newStatus)
      if (!result.success) {
        setStatus(currentStatus)
        console.error('Failed to update status:', result.error)
      }
    })
  }

  const activeOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0]
  
  // Extract base colors for trigger, removing focus/hover states
  const triggerColorClass = activeOption.color.split(' ').filter(c => !c.startsWith('focus:') && !c.startsWith('hover:')).join(' ')

  return (
    <Select value={status} onValueChange={handleValueChange} disabled={isPending}>
      <SelectTrigger 
        className={cn(
          "w-full min-w-[140px] h-8 rounded-full border px-3 text-xs font-medium transition-colors focus:ring-offset-0",
          triggerColorClass,
          "focus:ring-2 focus:ring-ring focus:ring-offset-2" // Restore focus ring
        )}
        // If pending, show spinner instead of default chevron
        icon={isPending ? <Loader2 className="h-3 w-3 animate-spin opacity-50" /> : undefined}
      >
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={cn(
              "text-xs font-medium my-1 cursor-pointer", 
              option.color
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
