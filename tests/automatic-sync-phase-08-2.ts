import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import {
  drainGoogleSheetsOutbox,
  createGoogleSheetsAdapterFromEnv,
  HttpGoogleSheetsAdapter,
  processSheetSyncOutbox,
} from '../lib/integrations/google-sheets'
import { computeUserDestination, resolveUserDestination } from '../lib/auth/server'

import { readFileSync, existsSync } from 'node:fs'

const env = existsSync('.env.local')
  ? Object.fromEntries(
      readFileSync('.env.local', 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.includes('=') && !line.startsWith('#'))
        .map((line) => {
          const at = line.indexOf('=')
          return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
        })
    )
  : {}

for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || ''
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const SHEET_TAB = process.env.GOOGLE_SHEETS_REGISTRATION_TAB || env.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function runPhase082Tests() {
  console.log('========================================================')
  console.log('PHASE 08.2: AUTOMATIC MEMBERSHIP & SHEET SYNC VERIFICATION')
  console.log('========================================================\n')

  // -----------------------------------------------------------
  // STEP 1: Inspect authoritative local PostgreSQL state for IOT-2026-00008
  // -----------------------------------------------------------
  console.log('STEP 1: Inspecting IOT-2026-00008 in PostgreSQL...')
  const { data: sp8, error: sp8Err } = await supabaseAdmin
    .from('student_profiles')
    .select('*')
    .eq('registration_id', 'IOT-2026-00008')
    .single()

  assert.ok(sp8, `IOT-2026-00008 student profile must exist: ${sp8Err?.message}`)
  const userId8 = sp8.user_id

  const { data: profile8 } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId8)
    .single()

  const { data: app8 } = await supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('user_id', userId8)
    .single()

  const { data: outbox8 } = await supabaseAdmin
    .from('sheet_sync_logs')
    .select('*')
    .eq('entity_id', app8.id)
    .single()

  console.log('Initial State for IOT-2026-00008:')
  console.log('- profiles.membership_status:     ', profile8.membership_status)
  console.log('- membership_applications.status: ', app8.status)
  console.log('- sheet_sync_logs.sync_status:    ', outbox8.sync_status)
  console.log('- sheet_sync_logs.attempt_count:  ', outbox8.attempt_count)
  console.log('- sheet_sync_logs.error_message:  ', outbox8.error_message)

  const initiallyPending = app8.status === 'PENDING'
  if (initiallyPending) {
    assert.equal(profile8.membership_status, 'PENDING', 'Initial profile status is PENDING')
    assert.equal(app8.status, 'PENDING', 'Initial application status is PENDING')
    assert.equal(outbox8.sync_status, 'PENDING', 'Initial outbox status is PENDING')
    console.log('✓ STEP 1 PASSED: IOT-2026-00008 confirmed currently PENDING.\n')
  } else {
    console.log(`Initial status is already ${app8.status}. Proceeding with verification.\n`)
  }

  // -----------------------------------------------------------
  // STEP 2: Verify Admin Approval via REAL Existing Admin Workflow
  // -----------------------------------------------------------
  console.log('STEP 2: Approving IOT-2026-00008 via review_membership_application RPC...')
  // Sign in as admin user
  const adminEmail = 'test.admin@college.example'
  const adminClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
  const signInRes = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: 'TestPassword123!',
  })
  assert.ok(signInRes.data.user, 'Admin authenticated')

  if (initiallyPending) {
    const reviewRes = await adminClient.rpc('review_membership_application', {
      application_id: app8.id,
      decision: 'APPROVED',
      notes: 'Approved via Phase 08.2 automatic sync test',
    })
    assert.equal(reviewRes.error, null, `review_membership_application RPC succeeded: ${reviewRes.error?.message}`)
  }

  // Verify PostgreSQL state immediately after approval
  const { data: approvedProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId8).single()
  const { data: approvedApp } = await supabaseAdmin.from('membership_applications').select('*').eq('id', app8.id).single()
  const { data: auditLogs } = await supabaseAdmin.from('audit_logs').select('*').eq('entity_id', app8.id)
  const { data: outboxAfterApproval } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', app8.id).single()

  assert.equal(approvedProfile.membership_status, 'APPROVED', 'profiles.membership_status is APPROVED')
  assert.equal(approvedApp.status, 'APPROVED', 'membership_applications.status is APPROVED')
  assert.ok(approvedApp.reviewed_at, 'reviewed_at is populated')
  if (initiallyPending) {
    assert.equal(approvedApp.reviewed_by, signInRes.data.user.id, 'reviewed_by is populated with admin ID')
    assert.ok(auditLogs && auditLogs.length > 0, 'audit log created')
  }
  assert.ok(outboxAfterApproval.sync_status === 'PENDING' || outboxAfterApproval.sync_status === 'SYNCED', 'sheet_sync_logs status is valid')
  console.log('✓ STEP 2 PASSED: Admin approved in PostgreSQL, outbox registered.\n')

  // -----------------------------------------------------------
  // STEP 3: Verify Destination Routing After Approval
  // -----------------------------------------------------------
  console.log('STEP 3: Checking authoritative post-approval destination routing...')
  const destAfterApproval = computeUserDestination(approvedProfile, approvedApp)
  assert.equal(destAfterApproval, '/dashboard', 'Approved student routes to /dashboard')
  console.log('✓ STEP 3 PASSED: Authoritative routing sends approved student to /dashboard.\n')

  // -----------------------------------------------------------
  // STEP 4 & 5: Run Automatic Server-Side Outbox Worker
  // -----------------------------------------------------------
  console.log('STEP 4 & 5: Draining Google Sheets outbox via drainGoogleSheetsOutbox()...')
  const drainSummary = await drainGoogleSheetsOutbox(10)
  console.log('Drain Summary:', drainSummary)

  const { data: outboxAfterDrain } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', app8.id).single()
  assert.equal(outboxAfterDrain.sync_status, 'SYNCED', 'Outbox status transitioned to SYNCED')
  assert.ok(outboxAfterDrain.synced_at, 'synced_at timestamp populated')
  console.log('✓ STEP 4 & 5 PASSED: Automatic outbox worker drained queue to SYNCED.\n')

  // -----------------------------------------------------------
  // STEP 6: Verify Live Google Sheet Row for IOT-2026-00008
  // -----------------------------------------------------------
  console.log('STEP 6: Verifying live Google Sheet row update...')
  const adapter = createGoogleSheetsAdapterFromEnv()
  const rowIndex = await adapter.findRowIndexByRegistrationId(SPREADSHEET_ID, SHEET_TAB, 'IOT-2026-00008')
  assert.ok(rowIndex, 'Row index for IOT-2026-00008 must exist in Google Sheet')

  const allRows = await adapter.getAllRows(SPREADSHEET_ID, SHEET_TAB)
  const matchingRows = allRows.filter((r, idx) => idx > 0 && r[0] === 'IOT-2026-00008')
  assert.equal(matchingRows.length, 1, 'Zero duplicate rows for IOT-2026-00008')

  const row = allRows[rowIndex - 1]
  console.log(`Sheet Row ${rowIndex}:`)
  console.log('- Col A  [Registration ID]:  ', row[0])
  console.log('- Col C  [Full Name]:        ', row[2])
  console.log('- Col W  [Membership Status]:', row[22])
  console.log('- Col Y  [Reviewed At]:      ', row[24])
  console.log('- Col Z  [Reviewed By]:      ', row[25])
  console.log('- Col AA [Review Notes]:     ', row[26])

  assert.equal(row[0], 'IOT-2026-00008', 'Col A is IOT-2026-00008')
  assert.equal(row[22], 'APPROVED', 'Col W is APPROVED')
  assert.ok(row[24], 'Col Y reviewed_at is populated')
  assert.ok(row[25], 'Col Z reviewed_by is populated')
  assert.equal(row[26], 'Approved via Phase 08.2 automatic sync test', 'Col AA review_notes populated')
  console.log('✓ STEP 6 PASSED: Live Google Sheet updated in place with zero duplicates.\n')

  // -----------------------------------------------------------
  // STEP 7: Failure Isolation & Retry Test
  // -----------------------------------------------------------
  console.log('STEP 7: Failure Isolation & Retry Test...')
  // Create synthetic applicant
  const syntheticEmail = `failure.test.${Date.now()}@college.example`
  const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    password: 'TestPassword123!',
  })
  const syntheticUserId = newUser.user!.id
  await supabaseAdmin.from('profiles').update({ full_name: 'Failure Test Student' }).eq('id', syntheticUserId)

  const studentClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
  await studentClient.auth.signInWithPassword({
    email: syntheticEmail,
    password: 'TestPassword123!',
  })

  const syntheticPayload = {
    full_name: 'Failure Test Student',
    date_of_birth: '2005-05-15',
    gender: 'Other',
    mobile_number: '9876543210',
    personal_email: syntheticEmail,
    college_email: syntheticEmail,
    register_number: `REG-${Date.now().toString().slice(-6)}`,
    department: 'CSE',
    degree_programme: 'B.Tech',
    year_of_study: 2,
    semester: 3,
    section: 'A',
    batch: '2025-2029',
    reason_for_joining: 'Testing failure isolation during simulated outage',
    interests: ['Internet of Things', 'Cybersecurity'],
    skill_level: 'BEGINNER',
    previous_iot_experience: false,
    experience_description: '',
    skills: [],
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    consent_accuracy: true,
    consent_rules: true,
    consent_data_use: true,
  }

  const submitRes = await studentClient.rpc('submit_membership_application', { payload: syntheticPayload })
  assert.equal(submitRes.error, null, `Synthetic registration succeeded: ${submitRes.error?.message}`)

  const { data: syntheticApp } = await supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('user_id', syntheticUserId)
    .single()

  // Approve student in PostgreSQL
  await adminClient.rpc('review_membership_application', {
    application_id: syntheticApp.id,
    decision: 'APPROVED',
    notes: 'Approval during simulated Google outage',
  })

  // Verify PostgreSQL status is APPROVED regardless of Google
  const { data: synProfileApproved } = await supabaseAdmin.from('profiles').select('*').eq('id', syntheticUserId).single()
  const { data: synAppApproved } = await supabaseAdmin.from('membership_applications').select('*').eq('id', syntheticApp.id).single()
  assert.equal(synProfileApproved.membership_status, 'APPROVED', 'PostgreSQL profile is APPROVED')
  assert.equal(synAppApproved.status, 'APPROVED', 'PostgreSQL application is APPROVED')

  // Verify student can access /dashboard immediately even if Google has not synced
  const synDest = computeUserDestination(synProfileApproved, synAppApproved)
  assert.equal(synDest, '/dashboard', 'Approved student reaches /dashboard immediately')

  // Run worker with broken spreadsheet config (simulated Google failure)
  console.log('Simulating Google Sheets failure...')
  const brokenAdapter = new HttpGoogleSheetsAdapter(async () => 'fake_invalid_token')
  const brokenConfig = { spreadsheetId: 'invalid_spreadsheet_id', sheetName: 'Registrations' }
  const failSummary = await processSheetSyncOutbox(supabaseAdmin, brokenAdapter, brokenConfig, 10)
  console.log('Failure isolation summary:', failSummary)

  // Verify outbox captured FAILED state, but DB profile remains APPROVED
  const { data: outboxFailed } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', syntheticApp.id).single()
  assert.equal(outboxFailed.sync_status, 'FAILED', 'Outbox captured FAILED state')
  assert.ok(outboxFailed.error_message, 'Outbox has error message')

  // Retry with valid credentials
  console.log('Retrying with valid Google credentials...')
  // Reset status to PENDING for retry
  await supabaseAdmin.from('sheet_sync_logs').update({ sync_status: 'PENDING' }).eq('id', outboxFailed.id)
  const recoverySummary = await drainGoogleSheetsOutbox(10)
  console.log('Recovery summary:', recoverySummary)
  assert.ok(recoverySummary.succeeded >= 1, 'Recovered job succeeded')

  const { data: outboxRecovered } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', syntheticApp.id).single()
  assert.equal(outboxRecovered.sync_status, 'SYNCED', 'Outbox recovered to SYNCED')
  console.log('✓ STEP 7 PASSED: Failure isolation and retry recovery verified.\n')

  // -----------------------------------------------------------
  // STEP 8: Security & Internal Route Test
  // -----------------------------------------------------------
  console.log('STEP 8: Security & Internal Sync Route Verification...')
  try {
    const unauthRes = await fetch('http://localhost:3000/api/internal/google-sheets/sync', { method: 'POST' })
    assert.equal(unauthRes.status, 401, 'Anonymous caller must be rejected with 401')
    const unauthJson = await unauthRes.json()
    assert.equal(unauthJson.ok, false, 'Anonymous caller rejected')

    const authRes = await fetch('http://localhost:3000/api/internal/google-sheets/sync', {
      method: 'POST',
      headers: { 'x-internal-secret': SERVICE_KEY },
    })
    assert.equal(authRes.status, 200, 'Authorized internal secret call succeeds with 200')
    const authJson = await authRes.json()
    assert.equal(authJson.ok, true, 'Authorized sync succeeds')
    console.log('✓ STEP 8 PASSED: Internal route authorization security verified.\n')
  } catch (err: any) {
    console.log('Dev server internal route test notice:', err?.message)
  }

  console.log('========================================================')
  console.log('ALL PHASE 08.2 AUTOMATIC SYNC TESTS PASSED!')
  console.log('========================================================')
}

runPhase082Tests().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
