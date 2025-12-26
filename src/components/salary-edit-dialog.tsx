'use client'

import { updateApplicationSalary } from '@/actions/application'
import { CURRENCY_OPTIONS, SALARY_PERIOD_OPTIONS, SALARY_TYPE_OPTIONS } from '@/config/options'
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

interface SalaryEditDialogProps {
  id: string
  initialMin?: number | null
  initialMax?: number | null
  initialCurrency?: string | null
  initialType?: string | null
  initialPeriod?: string | null
}

export function SalaryEditDialog({
  id,
  initialMin,
  initialMax,
  initialCurrency,
  initialType,
  initialPeriod,
}: SalaryEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [min, setMin] = useState<string>(initialMin?.toString() || '')
  const [max, setMax] = useState<string>(initialMax?.toString() || '')
  const [isRange, setIsRange] = useState(!!(initialMax && initialMin !== initialMax))
  const [currency, setCurrency] = useState<string>(initialCurrency || 'EUR')
  const [type, setType] = useState<string>(initialType || 'gross')
  const [period, setPeriod] = useState<string>(initialPeriod || 'year')

  const isInteger = (val: string) => /^\d+$/.test(val)

  const minError = min && !isInteger(min)
  const maxError = isRange && max && !isInteger(max)
  const hasError = minError || maxError

  const handleSave = async () => {
    if (hasError) return

    setLoading(true)
    try {
      const minNum = parseInt(min, 10)
      const minVal = !isNaN(minNum) ? minNum : null

      let maxVal = null
      if (isRange && max) {
        const maxNum = parseInt(max, 10)
        maxVal = !isNaN(maxNum) ? maxNum : null
      }

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
                className={minError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {minError && <span className="text-xs text-red-500">Integers only</span>}
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
                  className={maxError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {maxError && <span className="text-xs text-red-500">Integers only</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="salary-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="salary-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="salary-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary-period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="salary-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !!hasError}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
