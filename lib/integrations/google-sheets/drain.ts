import { createClient } from '@supabase/supabase-js'
import { createGoogleSheetsAdapterFromEnv } from './client'
import {
  isPlausibleSpreadsheetId,
  normalizeSheetName,
  normalizeSpreadsheetId,
  spreadsheetIdFingerprint,
} from './config'
import { processSheetSyncOutbox, syncSingleApplication } from './sync'
import type { BatchSyncSummary } from './types'

function getServiceConfig() {
  const { existsSync, readFileSync } = require('node:fs')
  let localEnv: Record<string, string> = {}

  if (
    (!process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) &&
    existsSync('.env.local')
  ) {
    try {
      localEnv = Object.fromEntries(
        readFileSync('.env.local', 'utf8')
          .split(/\r?\n/)
          .filter((line: string) => line.includes('=') && !line.startsWith('#'))
          .map((line: string) => {
            const at = line.indexOf('=')
            return [
              line.slice(0, at).trim(),
              line.slice(at + 1).trim().replace(/^['"]|['"]$/g, ''),
            ]
          })
      )
    } catch {
      // ignore
    }
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    localEnv.NEXT_PUBLIC_SUPABASE_URL ||
    ''

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    localEnv.SUPABASE_SERVICE_ROLE_KEY

  const rawSpreadsheetId =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
    localEnv.GOOGLE_SHEETS_SPREADSHEET_ID

  const spreadsheetId = normalizeSpreadsheetId(rawSpreadsheetId)

  const sheetName = normalizeSheetName(
    process.env.GOOGLE_SHEETS_REGISTRATION_TAB ||
      localEnv.GOOGLE_SHEETS_REGISTRATION_TAB
  )

  return { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName }
}

function configurationError(
  spreadsheetId: string,
  serviceRoleKey?: string
): string | null {
  if (!serviceRoleKey) {
    return 'SUPABASE_SERVICE_ROLE_KEY is required for Google Sheets synchronization.'
  }

  if (!spreadsheetId) {
    return 'GOOGLE_SHEETS_SPREADSHEET_ID is not configured.'
  }

  if (!isPlausibleSpreadsheetId(spreadsheetId)) {
    return (
      'GOOGLE_SHEETS_SPREADSHEET_ID is malformed. ' +
      'Paste either the raw spreadsheet ID or the complete Google Sheets URL. ' +
      `Received target ${spreadsheetIdFingerprint(spreadsheetId)}.`
    )
  }

  return null
}

export async function drainGoogleSheetsOutbox(
  batchSize = 10
): Promise<BatchSyncSummary> {
  const { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName } =
    getServiceConfig()

  const configError = configurationError(spreadsheetId, serviceRoleKey)
  if (configError) {
    console.error('[drainGoogleSheetsOutbox] Configuration error:', configError)
    return {
      totalProcessed: 0,
      succeeded: 0,
      failed: 0,
      error: configError,
      details: [],
    }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey!, {
      auth: { persistSession: false },
    })

    const adapter = createGoogleSheetsAdapterFromEnv()
    const config = { spreadsheetId, sheetName }

    return await processSheetSyncOutbox(
      supabase,
      adapter,
      config,
      batchSize
    )
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err)
    const sanitized = rawMsg.replace(
      /(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi,
      '[REDACTED]'
    )

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

export async function syncSelfApplication(userId: string): Promise<{
  success: boolean
  registrationId?: string
  error?: string
}> {
  const { supabaseUrl, serviceRoleKey, spreadsheetId, sheetName } =
    getServiceConfig()

  const configError = configurationError(spreadsheetId, serviceRoleKey)
  if (configError) {
    return { success: false, error: configError }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey!, {
      auth: { persistSession: false },
    })

    const { data: application, error: appErr } = await supabase
      .from('membership_applications')
      .select('id, registration_id')
      .eq('user_id', userId)
      .single()

    if (appErr || !application) {
      return {
        success: false,
        error: `Application not found for user: ${appErr?.message || 'None'}`,
      }
    }

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

    if (claimErr) {
      return {
        success: false,
        registrationId: application.registration_id,
        error: `Unable to claim Google Sheets sync job: ${claimErr.message}`,
      }
    }

    if (!claimedRows || claimedRows.length === 0) {
      const { data: existing } = await supabase
        .from('sheet_sync_logs')
        .select('sync_status, error_message')
        .eq('entity_type', 'MEMBERSHIP_APPLICATION')
        .eq('entity_id', application.id)
        .maybeSingle()

      if (existing?.sync_status === 'SYNCED') {
        return {
          success: true,
          registrationId: application.registration_id,
        }
      }

      return {
        success: false,
        registrationId: application.registration_id,
        error:
          existing?.error_message ||
          'Google Sheets sync job could not be claimed. Retry shortly.',
      }
    }

    const adapter = createGoogleSheetsAdapterFromEnv()
    const config = { spreadsheetId, sheetName }

    const result = await syncSingleApplication(
      supabase,
      adapter,
      config,
      application.id
    )

    return {
      success: result.success,
      registrationId:
        result.registrationId || application.registration_id,
      error: result.error,
    }
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err)
    const sanitized = rawMsg.replace(
      /(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi,
      '[REDACTED]'
    )

    console.error('[syncSelfApplication] Execution failure:', sanitized)

    return {
      success: false,
      error: sanitized,
    }
  }
}
