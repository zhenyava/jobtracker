'use client'

import { updateApplicationSalary } from '@/actions/application'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatSalary } from '@/lib/salary-utils'
import { useState } from 'react'

interface SalaryEditPopoverProps {
  id: string
  initialMin?: number | null
  initialMax?: number | null
  initialCurrency?: string | null
  initialType?: string | null
  initialPeriod?: string | null
}

export function SalaryEditPopover({
  id,
  initialMin,
  initialMax,
  initialCurrency,
  initialType,
  initialPeriod,
}: SalaryEditPopoverProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [min, setMin] = useState<string>(initialMin?.toString() || '')
  const [max, setMax] = useState<string>(initialMax?.toString() || '')
  const [isRange, setIsRange] = useState(!!(initialMax && initialMin !== initialMax))
  const [currency, setCurrency] = useState<string>(initialCurrency || 'EUR')
  const [type, setType] = useState<string>(initialType || 'gross')
  const [period, setPeriod] = useState<string>(initialPeriod || 'year')

  const handleSave = async () => {
    setLoading(true)
    try {
      const minVal = min ? parseFloat(min) : null
      const maxVal = isRange && max ? parseFloat(max) : null

      const result = await updateApplicationSalary(id, {
        salary_min: minVal,
        salary_max: maxVal,
        salary_currency: currency,
        salary_type: type,
        salary_period: period,
      })

      if (result.success) {
        setOpen(false)
      } else {
        console.error('Failed to update salary:', result.error)
      }
    } catch (error) {
      console.error('Error updating salary:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayValue = formatSalary(
    initialMin,
    initialMax,
    initialCurrency,
    initialType,
    initialPeriod
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="cursor-pointer hover:bg-muted/50 p-2 rounded-md min-w-[100px] min-h-[32px] flex items-center text-sm"
          role="button"
          tabIndex={0}
        >
          {displayValue}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Salary</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="range-mode"
              checked={isRange}
              onCheckedChange={setIsRange}
            />
            <Label htmlFor="range-mode">Range</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={isRange ? 'grid gap-2' : 'grid gap-2 col-span-2'}>
              <Label htmlFor="min">{isRange ? 'Min Amount' : 'Amount'}</Label>
              <Input
                id="min"
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>
            {isRange && (
              <div className="grid gap-2">
                <Label htmlFor="max">Max Amount</Label>
                <Input
                  id="max"
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder="e.g. 60000"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">Gross</SelectItem>
                  <SelectItem value="net">Net</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
