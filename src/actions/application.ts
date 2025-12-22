'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  profile_id: string
}

export async function getApplications(profileId: string): Promise<{ success: boolean; data?: JobApplication[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('job_applications' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
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

export async function updateApplicationStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('job_applications' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating application status:', error)
      return { success: false, error: 'Failed to update status' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}
