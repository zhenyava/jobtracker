import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('API /me check. User found:', !!user)

  // Get the origin of the request (e.g., chrome-extension://...)
  const origin = request.headers.get('origin')

  const responseData = user 
    ? { authenticated: true, user }
    : { authenticated: false, user: null }

  const response = NextResponse.json(responseData)

  // Allow access from extensions
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 204 })

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}