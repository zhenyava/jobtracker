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

  const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: '€',
    USD: '$',
  }

  const currencySymbol = currency ? (CURRENCY_SYMBOLS[currency] || currency) : ''
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
