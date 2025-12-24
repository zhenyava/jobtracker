'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createProfileSchema = z.object({
  name: z.string().min(1, 'String must contain at least 1 character').max(50, 'Name too long'),
})

export async function createJobProfile(name: string) {
  const result = createProfileSchema.safeParse({ name })
  if (!result.success) {
    return {
      success: false,
      error: result.error.format().name?._errors[0] || 'Invalid input',
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_profiles')
    .insert({
      user_id: user.id,
      name: result.data.name,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function renameJobProfile(profileId: string, newName: string) {
  const result = createProfileSchema.safeParse({ name: newName })
  if (!result.success) {
    return {
      success: false,
      error: result.error.format().name?._errors[0] || 'Invalid input',
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_profiles')
    .update({ name: result.data.name })
    .eq('id', profileId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function getJobProfiles() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
