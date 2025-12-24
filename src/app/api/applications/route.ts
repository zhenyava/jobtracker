import { createClient } from '@/lib/supabase/server'
import { createApplicationSchema } from '@/lib/validators/application'
import { DEFAULT_STATUS } from '@/config/options'
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server for extension
  process.env.NEXT_PUBLIC_EXTENSION_ORIGIN,
].filter(Boolean)

function createCorsResponse(body: unknown, init?: ResponseInit, origin?: string | null) {
  const response = NextResponse.json(body, init)
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  return createCorsResponse(null, { status: 204 }, origin)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createCorsResponse({ success: false, error: 'Unauthorized' }, { status: 401 }, origin)
    }

    const body = await request.json()
    const validationResult = createApplicationSchema.safeParse(body)

    if (!validationResult.success) {
      return createCorsResponse(
        { 
          success: false, 
          error: 'Validation Error', 
          details: validationResult.error.errors
        }, 
        { status: 400 }, 
        origin
      )
    }

    const { companyName, industry, jobUrl, description, location, workType, profileId } = validationResult.data

    // Verify profile ownership
    const { data: profile, error: profileError } = await supabase
      .from('job_profiles' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return createCorsResponse({ success: false, error: 'Invalid Profile ID' }, { status: 400 }, origin)
    }

    const { data, error } = await supabase
      .from('job_applications' as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert({
        user_id: user.id,
        profile_id: profileId,
        company_name: companyName,
        industry,
        job_url: jobUrl,
        description,
        location,
        work_type: workType,
        status: DEFAULT_STATUS,
        applied_at: new Date().toISOString(),
      })
      .select()
      .single()


    if (error) {
      console.error('Error inserting application:', error)
      return createCorsResponse({ success: false, error: 'Database Error' }, { status: 500 }, origin)
    }

    return createCorsResponse({ success: true, data }, { status: 200 }, origin)

  } catch (error) {
    console.error('Unexpected error:', error)
    return createCorsResponse({ success: false, error: 'Internal Server Error' }, { status: 500 }, origin)
  }
}