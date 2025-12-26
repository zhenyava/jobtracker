import { CURRENCY_OPTIONS } from '@/config/options'

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
  type: string | null | undefined,
  period: string | null | undefined
): string {
  if (!min && !max) {
    return 'Empty'
  }

  const currencyOption = CURRENCY_OPTIONS.find(opt => opt.value === currency)
  const currencySymbol = currencyOption ? currencyOption.symbol : (currency || '')
  const periodText = period || ''
  const typeText = type || ''

  let amount = ''
  if (min && max && min !== max) {
    amount = `${min} - ${max}`
  } else if (min) {
    amount = `${min}`
  } else if (max) {
    amount = `${max}`
  }

  // Format: [range / single] [currency] [gross / net] [year / month]
  // Join parts with space, filtering out empty strings
  return [amount, currencySymbol, typeText, periodText].filter(Boolean).join(' ')
}
