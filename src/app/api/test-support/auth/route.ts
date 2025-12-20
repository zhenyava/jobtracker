import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

const DEFAULT_TEST_USER_EMAIL = 'test@example.com'
const DEFAULT_TEST_USER_PASSWORD = 'password123'

export async function POST(request: NextRequest) {
  if (process.env.E2E_TESTING !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables for E2E' },
      { status: 500 },
    )
  }

  const payload = await request.json().catch(() => ({}))
  const email: string =
    payload.email ?? process.env.TEST_USER_EMAIL ?? DEFAULT_TEST_USER_EMAIL
  const password: string =
    payload.password ??
    process.env.TEST_USER_PASSWORD ??
    DEFAULT_TEST_USER_PASSWORD

  const adminClient = createSupabaseClient<Database>(
    supabaseUrl,
    serviceRoleKey,
  )

  const { data: usersData, error: listError } =
    await adminClient.auth.admin.listUsers()

  if (listError) {
    return NextResponse.json(
      { error: `Failed to list users: ${listError.message}` },
      { status: 500 },
    )
  }

  const existingUser = usersData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  )

  const user =
    existingUser ??
    (
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
    ).data.user

  if (!user) {
    return NextResponse.json(
      { error: 'Unable to create or fetch test user' },
      { status: 500 },
    )
  }

  if (existingUser) {
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password, email_confirm: true },
    )

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to sync test user password: ${updateError.message}` },
        { status: 500 },
      )
    }
  }

  const { error: cleanupError } = await adminClient
    .from('job_profiles')
    .delete()
    .eq('user_id', user.id)

  if (cleanupError) {
    return NextResponse.json(
      { error: `Failed to clean profiles: ${cleanupError.message}` },
      { status: 500 },
    )
  }

  const response = NextResponse.json({ ok: true, userId: user.id })

  const serverClient = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data: sessionData, error: sessionError } =
    await serverClient.auth.signInWithPassword({
      email,
      password,
    })

  if (sessionError || !sessionData.session) {
    return NextResponse.json(
      { error: sessionError?.message ?? 'Failed to sign in test user' },
      { status: 500 },
    )
  }

  return response
}
