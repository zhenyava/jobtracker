'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

async function getAuthenticatedClient() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return { supabase, user }
}

export async function getApplications(profileId: string): Promise<{ success: boolean; data?: JobApplication[]; error?: string }> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return { success: false, error: 'Unauthorized' }
    const { supabase, user } = auth

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

    return { success: true, data: data as unknown as JobApplication[] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}

async function updateApplication(
  id: string, 
  data: Partial<Pick<JobApplication, 'status' | 'industry'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return { success: false, error: 'Unauthorized' }
    const { supabase, user } = auth

    const { error } = await supabase
      .from('job_applications' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error(`Error updating application ${id}:`, error)
      return { success: false, error: 'Failed to update application' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}

export async function updateApplicationStatus(id: string, status: string) {
  return updateApplication(id, { status })
}

export async function updateApplicationIndustry(id: string, industry: string) {
  return updateApplication(id, { industry })
}

export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth) return { success: false, error: 'Unauthorized' }
    const { supabase, user } = auth

    const { error } = await supabase
      .from('job_applications' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error(`Error deleting application ${id}:`, error)
      return { success: false, error: 'Failed to delete application' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}