import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { headline, bio, githubUrl, linkedinUrl, portfolioUrl, username } = body

    const { data, error } = await supabase.rpc('update_student_profile', {
      p_headline: headline !== undefined ? headline : null,
      p_bio: bio !== undefined ? bio : null,
      p_github_url: githubUrl !== undefined ? githubUrl : null,
      p_linkedin_url: linkedinUrl !== undefined ? linkedinUrl : null,
      p_portfolio_url: portfolioUrl !== undefined ? portfolioUrl : null,
      p_username: username !== undefined ? username : null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
