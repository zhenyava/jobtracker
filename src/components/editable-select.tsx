'use client'

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

export interface SelectOption {
  value: string
  label: string
  color?: string
}

interface EditableSelectProps {
  initialValue?: string
  options: (SelectOption | string)[]
  onUpdate: (newValue: string) => Promise<{ success: boolean; error?: string }>
  placeholder?: string
  className?: string
}

export function EditableSelect({ 
  initialValue = '', 
  options, 
  onUpdate, 
  placeholder = "Select...",
  className,
}: EditableSelectProps) {
  const [value, setValue] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  // Normalize options to object format
  const normalizedOptions: SelectOption[] = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Add current value to options if missing (for Industry free text support in future)
  if (value && !normalizedOptions.find(o => o.value === value)) {
    normalizedOptions.push({ value, label: value })
    normalizedOptions.sort((a, b) => a.label.localeCompare(b.label))
  }

  const handleValueChange = (newValue: string) => {
    if (newValue === value) return
    
    setValue(newValue) // Optimistic update
    
    startTransition(async () => {
      const result = await onUpdate(newValue)
      if (!result.success) {
        setValue(initialValue)
        console.error('Failed to update:', result.error)
      }
    })
  }

  const activeOption = normalizedOptions.find(opt => opt.value === value)
  
  // Extract base colors for trigger if color is provided
  // If no color, use transparent/minimal style
  const triggerColorClass = activeOption?.color 
    ? activeOption.color.split(' ').filter(c => !c.startsWith('focus:') && !c.startsWith('hover:')).join(' ')
    : "border-transparent hover:border-input focus:border-input bg-transparent hover:bg-muted/50"

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={isPending}>
      <SelectTrigger 
        className={cn(
          "h-8 text-xs font-medium transition-colors px-2", 
          // If colored, add padding and border. If not, simpler look.
          activeOption?.color ? "rounded-full border px-3" : "px-2",
          triggerColorClass,
          activeOption?.color ? "focus:ring-2 focus:ring-ring focus:ring-offset-2" : "",
          !value && "text-muted-foreground",
          className
        )}
        icon={isPending ? <Loader2 className="h-3 w-3 animate-spin opacity-50" /> : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {normalizedOptions.map((option) => (
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
