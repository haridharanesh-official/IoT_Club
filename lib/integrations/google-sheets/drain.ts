import { createClient } from '@supabase/supabase-js'
import { createGoogleSheetsAdapterFromEnv } from './client'
import { processSheetSyncOutbox, syncSingleApplication } from './sync'
import type { BatchSyncSummary } from './types'

/**
 * Reusable server-only function to drain the Google Sheets outbox.
 *
 * Requirements:
 * - Uses server-side Supabase service credentials.
 * - Uses HttpGoogleSheetsAdapter via createGoogleSheetsAdapterFromEnv().
 * - Uses GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SHEETS_REGISTRATION_TAB.
 * - Processes bounded batches.
 * - Catches and reports Google API failures without throwing.
 * - NEVER rolls back database transactions or membership status changes.
 * - Never exposes credentials or secrets to client bundles.
 */
function getServiceConfig() {
  const { existsSync, readFileSync } = require('node:fs')
  let localEnv: Record<string, string> = {}
  if ((!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) && existsSync('.env.local')) {
    try {
      localEnv = Object.fromEntries(
        readFileSync('.env.local', 'utf8')
          .split(/\r?\n/)
          .filter((line: string) => line.includes('=') && !line.startsWith('#'))
          .map((line: string) => {
            const at = line.indexOf('=')
            return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
          })
      )
    } catch {
      // ignore
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || localEnv.GOOGLE_SHEETS_SPREADSHEET_ID
  const sheetName = process.env.GOOGLE_SHEETS_REGISTRATION_TAB || localEnv.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'

  return { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName }
}

/**
 * Reusable server-only function to drain the Google Sheets outbox.
 *
 * Requirements:
 * - Uses server-side Supabase service credentials.
 * - Uses HttpGoogleSheetsAdapter via createGoogleSheetsAdapterFromEnv().
 * - Uses GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SHEETS_REGISTRATION_TAB.
 * - Processes bounded batches.
 * - Catches and reports Google API failures without throwing.
 * - NEVER rolls back database transactions or membership status changes.
 * - Never exposes credentials or secrets to client bundles.
 */
export async function drainGoogleSheetsOutbox(batchSize = 10): Promise<BatchSyncSummary> {
  const { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName } = getServiceConfig()

  if (!serviceRoleKey) {
    const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY is required to drain sheet sync outbox.'
    console.error('[drainGoogleSheetsOutbox] Configuration error:', errorMsg)
    return {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      error: errorMsg,
      details: [],
    }
  }

  if (!spreadsheetId) {
    const errorMsg = 'GOOGLE_SHEETS_SPREADSHEET_ID is not configured.'
    console.error('[drainGoogleSheetsOutbox] Configuration error:', errorMsg)
    return {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      error: errorMsg,
      details: [],
    }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const adapter = createGoogleSheetsAdapterFromEnv()
    const config = { spreadsheetId, sheetName }

    return await processSheetSyncOutbox(supabase, adapter, config, batchSize)
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err)
    const sanitized = rawMsg.replace(/(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi, '[REDACTED]')
    console.error('[drainGoogleSheetsOutbox] Execution failure:', sanitized)

    return {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      error: sanitized,
      details: [],
    }
  }
}

/**
 * Scoped helper to synchronize ONLY the current authenticated student's own application.
 *
 * Guarantees:
 * - Scoped strictly to the provided userId.
 * - Does NOT process or touch other applicants' outbox records.
 * - Does NOT drain the global queue.
 * - Catches and logs Google Sheets errors without throwing.
 * - Safe for best-effort background trigger after student registration.
 */
export async function syncSelfApplication(userId: string): Promise<{
  success: boolean
  registrationId?: string
  error?: string
}> {
  const { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName } = getServiceConfig()

  if (!serviceRoleKey) {
    const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY is required to sync application.'
    return { success: false, error: errorMsg }
  }

  if (!spreadsheetId) {
    const errorMsg = 'GOOGLE_SHEETS_SPREADSHEET_ID is not configured.'
    return { success: false, error: errorMsg }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: application, error: appErr } = await supabase
      .from('membership_applications')
      .select('id, registration_id')
      .eq('user_id', userId)
      .single()

    if (appErr || !application) {
      return { success: false, error: `Application not found for user: ${appErr?.message || 'None'}` }
    }

    // Concurrency guard: atomically claim job from PENDING/FAILED to SYNCING
    const { data: claimedRows, error: claimErr } = await supabase
      .from('sheet_sync_logs')
      .update({
        sync_status: 'SYNCING',
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('entity_type', 'MEMBERSHIP_APPLICATION')
      .eq('entity_id', application.id)
      .in('sync_status', ['PENDING', 'FAILED'])
      .select('id')

    if (claimErr || !claimedRows || claimedRows.length === 0) {
      // Job is already claimed by background worker or already SYNCED
      return { success: true, registrationId: application.registration_id }
    }

    const adapter = createGoogleSheetsAdapterFromEnv()
    const config = { spreadsheetId, sheetName }

    const result = await syncSingleApplication(supabase, adapter, config, application.id)
    return {
      success: result.success,
      registrationId: result.registrationId || application.registration_id,
      error: result.error,
    }
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err)
    const sanitized = rawMsg.replace(/(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi, '[REDACTED]')
    console.error('[syncSelfApplication] Execution failure:', sanitized)
    return {
      success: false,
      error: sanitized,
    }
  }
}
