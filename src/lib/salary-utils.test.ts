import { formatSalary } from './salary-utils'

describe('formatSalary', () => {
  it('should return "Empty" when min and max are missing', () => {
    expect(formatSalary(null, null, 'USD', 'gross', 'year')).toBe('Empty')
    expect(formatSalary(undefined, undefined, 'USD', 'gross', 'year')).toBe('Empty')
  })

  it('should format single value correctly', () => {
    expect(formatSalary(65000, null, 'USD', 'gross', 'year')).toBe('65000 $ gross year')
    expect(formatSalary(65000, 65000, 'USD', 'gross', 'year')).toBe('65000 $ gross year')
  })

  it('should format range correctly', () => {
    expect(formatSalary(70000, 90000, 'EUR', 'gross', 'year')).toBe('70000 - 90000 € gross year')
  })

  it('should format correctly with missing optional fields', () => {
    expect(formatSalary(5000, null, 'USD', 'net', 'month')).toBe('5000 $ net month')
    expect(formatSalary(5000, null, null, null, null)).toBe('5000')
  })

  it('should handle max only (though unusual)', () => {
    expect(formatSalary(null, 80000, 'EUR', null, null)).toBe('80000 €')
  })

  it('should handle custom currency code if not mapped', () => {
    expect(formatSalary(100, null, 'GBP', null, null)).toBe('100 GBP')
  })
})
