import { SelectOption } from "@/components/editable-select"

export const DEFAULT_STATUS = 'hr_screening'

export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'hr_screening', label: 'HR Screening', color: 'bg-blue-100 text-blue-700 border-blue-200 focus:bg-blue-100 focus:text-blue-700' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-700 border-green-200 focus:bg-green-100 focus:text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200 focus:bg-red-100 focus:text-red-700' },
  { value: 'not_responded', label: 'Not Responded', color: 'bg-gray-100 text-gray-700 border-gray-200 focus:bg-gray-100 focus:text-gray-700' },
  { value: 'interview_1', label: '1st Interview', color: 'bg-purple-100 text-purple-700 border-purple-200 focus:bg-purple-100 focus:text-purple-700' },
  { value: 'interview_2', label: '2nd Interview', color: 'bg-purple-100 text-purple-700 border-purple-200 focus:bg-purple-100 focus:text-purple-700' },
]

export const INDUSTRY_OPTIONS: string[] = [
  'Software / SaaS',
  'FinTech',
  'E-commerce',
  'Healthcare / MedTech',
  'EdTech',
  'Artificial Intelligence',
  'Cybersecurity',
  'Gaming / Entertainment',
  'Consulting / Agency',
  'Blockchain / Web3',
  'Other',
]
