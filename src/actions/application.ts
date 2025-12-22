'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Temporary type definition until we generate DB types
export interface JobApplication {
  id: string
  company_name: string
  job_url: string
  status: string
  applied_at: string
  work_type: string
  location?: string
  industry?: string
  match_score?: number
}

export async function getApplications(): Promise<{ success: boolean; data?: JobApplication[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('job_applications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      return { success: false, error: 'Failed to fetch applications' }
    }

    return { success: true, data: data as JobApplication[] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}
