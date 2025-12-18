import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createJobProfile, getJobProfiles } from './profile'
import { revalidatePath } from 'next/cache'

// Mock dependencies
const mockSingle = vi.fn()
const mockSelectBuilder = vi.fn(() => ({
  single: mockSingle
}))
const mockInsert = vi.fn(() => ({
  select: mockSelectBuilder
}))
const mockOrder = vi.fn()
const mockSelect = vi.fn(() => ({
  order: mockOrder
}))
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
}))
const mockGetUser = vi.fn()
const mockAuth = {
  getUser: mockGetUser,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: mockAuth,
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Profile Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default success mocks
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    // Default insert response chain
    mockSingle.mockResolvedValue({ 
      data: { id: 'p-1', name: 'Frontend', user_id: 'user-123' }, 
      error: null 
    })
    
    // Default select response
    mockOrder.mockResolvedValue({ 
      data: [
        { id: 'p-1', name: 'Frontend', user_id: 'user-123' },
        { id: 'p-2', name: 'Backend', user_id: 'user-123' }
      ],
      error: null 
    })
  })

  describe('createJobProfile', () => {
    it('should create a profile successfully', async () => {
      // Setup mock specific for this test
      mockSingle.mockResolvedValue({ data: { id: 'p-1', name: 'Frontend', user_id: 'user-123' }, error: null })

      const result = await createJobProfile('Frontend')

      expect(mockGetUser).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalledWith('job_profiles')
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Frontend',
        user_id: 'user-123',
      })
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(result.success).toBe(true)
    })

    it('should validate input length', async () => {
      const result = await createJobProfile('')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: 'No session' })

      const result = await createJobProfile('Frontend')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('getJobProfiles', () => {
    it('should return profiles for user', async () => {
      const result = await getJobProfiles()

      expect(mockGetUser).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalledWith('job_profiles')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })
})
