import { createClient } from '@/utils/supabase/server'

export async function getVerifiedUser() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    return error ? null : data.user
  } catch {
    return null
  }
}
