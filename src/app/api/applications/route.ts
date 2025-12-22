import { createClient } from '@/lib/supabase/server'
import { createApplicationSchema } from '@/lib/validators/application'
import { NextResponse } from 'next/server'

// Helper to set CORS headers
function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 204 })
  setCorsHeaders(response, origin)
  return response
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const response = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
      setCorsHeaders(response, origin)
      return response
    }

    const body = await request.json()
    const validationResult = createApplicationSchema.safeParse(body)

    if (!validationResult.success) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Validation Error', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
      setCorsHeaders(response, origin)
      return response
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
      const response = NextResponse.json(
        { success: false, error: 'Invalid Profile ID' },
        { status: 400 }
      )
      setCorsHeaders(response, origin)
      return response
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
        status: 'hr_screening', // Default status
        applied_at: new Date().toISOString(),
      })
      .select()
      .single()


    if (error) {
      console.error('Error inserting application:', error)
      const response = NextResponse.json(
        { success: false, error: 'Database Error' },
        { status: 500 }
      )
      setCorsHeaders(response, origin)
      return response
    }

    const response = NextResponse.json({ success: true, data })
    setCorsHeaders(response, origin)
    return response

  } catch (error) {
    console.error('Unexpected error:', error)
    const response = NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
    setCorsHeaders(response, origin)
    return response
  }
}
