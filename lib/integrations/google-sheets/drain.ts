import { createClient } from '@supabase/supabase-js'
import { createGoogleSheetsAdapterFromEnv } from './client'
import { processSheetSyncOutbox } from './sync'
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
export async function drainGoogleSheetsOutbox(batchSize = 10): Promise<BatchSyncSummary> {
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

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || localEnv.GOOGLE_SHEETS_SPREADSHEET_ID
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

  const sheetName = process.env.GOOGLE_SHEETS_REGISTRATION_TAB || localEnv.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'

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
