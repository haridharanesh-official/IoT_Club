import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BatchSyncSummary,
  FullApplicationData,
  GoogleSheetsAdapter,
  GoogleSheetsConfig,
  SheetSyncResult,
} from './types'
import { spreadsheetIdFingerprint } from './config'
import { loadServiceAccountCredentialsFromEnv } from './client'
import { mapApplicationToSheetRow } from './mapper'
import { upsertRegistrationRow } from './registrations'

export function calculateBackoffDelay(
  attemptCount: number,
  baseMs = 1000,
  maxMs = 60000
): number {
  const exp = Math.min(attemptCount, 6)
  const delay = Math.min(baseMs * Math.pow(2, exp), maxMs)
  const jitter = delay * (Math.random() * 0.2 - 0.1)
  return Math.floor(delay + jitter)
}

export async function fetchFullApplicationData(
  supabase: SupabaseClient,
  applicationId: string
): Promise<FullApplicationData> {
  const { data: app, error: appErr } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appErr || !app) {
    throw new Error(
      `Application not found (${applicationId}): ${appErr?.message}`
    )
  }

  const userId = app.user_id

  const [profileRes, studentRes, interestsRes, skillsRes, reviewerRes] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single(),
      supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('student_interests')
        .select('interest')
        .eq('user_id', userId),
      supabase
        .from('student_skills')
        .select('category, skill, level')
        .eq('user_id', userId),
      app.reviewed_by
        ? supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', app.reviewed_by)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ])

  if (profileRes.error || !profileRes.data) {
    throw new Error(
      `Profile not found for user (${userId}): ${profileRes.error?.message}`
    )
  }

  if (studentRes.error || !studentRes.data) {
    throw new Error(
      `Student profile not found for user (${userId}): ${studentRes.error?.message}`
    )
  }

  return {
    application: app,
    profile: profileRes.data,
    studentProfile: studentRes.data,
    interests: interestsRes.data || [],
    skills: skillsRes.data || [],
    reviewerProfile: reviewerRes.data,
  }
}

function addGoogleSheetsDiagnostic(
  message: string,
  config: GoogleSheetsConfig
): string {
  if (!message.includes('Google Sheets API error (404)')) {
    return message
  }

  const serviceAccountEmail =
    loadServiceAccountCredentialsFromEnv()?.client_email || 'credentials-not-loaded'

  return (
    message +
    '\nDiagnostic: Google authenticated, but the target spreadsheet could not be opened. ' +
    `Target=${spreadsheetIdFingerprint(config.spreadsheetId)}, tab="${config.sheetName}", serviceAccount=${serviceAccountEmail}. ` +
    'A Google Sheets 404 at this stage means the spreadsheet ID is wrong OR this exact service account has not been granted access to that spreadsheet.'
  )
}

export async function syncSingleApplication(
  supabase: SupabaseClient,
  adapter: GoogleSheetsAdapter,
  config: GoogleSheetsConfig,
  applicationId: string
): Promise<SheetSyncResult> {
  let fullData: FullApplicationData | null = null

  try {
    fullData = await fetchFullApplicationData(supabase, applicationId)
    const rowValues = mapApplicationToSheetRow(fullData)
    const result = await upsertRegistrationRow(adapter, config, rowValues)

    if (result.success) {
      await supabase
        .from('sheet_sync_logs')
        .update({
          sync_status: 'SYNCED',
          synced_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('entity_type', 'MEMBERSHIP_APPLICATION')
        .eq('entity_id', applicationId)

      return result
    }

    const diagnosticError = addGoogleSheetsDiagnostic(
      result.error || 'Unknown sync error',
      config
    )

    await supabase
      .from('sheet_sync_logs')
      .update({
        sync_status: 'FAILED',
        error_message: diagnosticError,
        updated_at: new Date().toISOString(),
      })
      .eq('entity_type', 'MEMBERSHIP_APPLICATION')
      .eq('entity_id', applicationId)

    return {
      ...result,
      error: diagnosticError,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const annotated = addGoogleSheetsDiagnostic(errorMsg, config)
    const sanitized = annotated.replace(
      /(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi,
      '[REDACTED]'
    )

    await supabase
      .from('sheet_sync_logs')
      .update({
        sync_status: 'FAILED',
        error_message: sanitized,
        updated_at: new Date().toISOString(),
      })
      .eq('entity_type', 'MEMBERSHIP_APPLICATION')
      .eq('entity_id', applicationId)

    return {
      success: false,
      registrationId: fullData?.studentProfile?.registration_id,
      error: sanitized,
    }
  }
}

export async function processSheetSyncOutbox(
  supabase: SupabaseClient,
  adapter: GoogleSheetsAdapter,
  config: GoogleSheetsConfig,
  batchSize = 10
): Promise<BatchSyncSummary> {
  const { data: claimedJobs, error: claimErr } = await supabase.rpc(
    'claim_sheet_sync_jobs',
    {
      batch_size: batchSize,
      stale_minutes: 5,
    }
  )

  if (claimErr) {
    throw new Error(
      `Failed to claim sheet sync jobs: ${claimErr.message}`
    )
  }

  const jobs = claimedJobs || []
  const summary: BatchSyncSummary = {
    totalProcessed: jobs.length,
    succeeded: 0,
    failed: 0,
    details: [],
  }

  for (const job of jobs) {
    const syncRes = await syncSingleApplication(
      supabase,
      adapter,
      config,
      job.entity_id
    )

    if (syncRes.success) {
      summary.succeeded++
      summary.details.push({
        entityId: job.entity_id,
        registrationId: syncRes.registrationId,
        status: 'SYNCED',
        operation: syncRes.operation,
      })
    } else {
      summary.failed++
      summary.details.push({
        entityId: job.entity_id,
        registrationId: syncRes.registrationId,
        status: 'FAILED',
        error: syncRes.error,
      })
    }
  }

  return summary
}
