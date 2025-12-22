import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { AI_CONFIG } from '@/config/ai'

const analyzeJobSchema = z.object({
  text: z.string().min(1),
})

const jobOutputSchema = z.object({
  description: z.string(),
  company: z.string(),
  country: z.string(),
  industry: z.string(),
  format: z.string(),
  position: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate Input
    const body = await request.json()
    const result = analyzeJobSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // 3. Call OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: AI_CONFIG.systemPrompt,
        },
        { role: 'user', content: result.data.text },
      ],
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const rawData = JSON.parse(content)
    
    // 4. Validate Output Structure
    const validation = jobOutputSchema.safeParse(rawData)
    
    if (!validation.success) {
      console.error('LLM Output Validation Failed:', validation.error)
      throw new Error('LLM returned invalid data structure')
    }

    return NextResponse.json(validation.data)
  } catch (error) {
    console.error('Analyze Job Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze job' },
      { status: 500 }
    )
  }
}
