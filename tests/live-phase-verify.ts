import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  createGoogleSheetsAdapterFromEnv,
  loadServiceAccountCredentialsFromEnv,
  getGoogleAccessToken,
  HttpGoogleSheetsAdapter,
} from '../lib/integrations/google-sheets/client'
import {
  REGISTRATIONS_SHEET_HEADERS,
  REGISTRATIONS_SHEET_NAME,
  validateSheetHeaders,
} from '../lib/integrations/google-sheets/mapper'
import {
  processSheetSyncOutbox,
  syncSingleApplication,
  fetchFullApplicationData,
} from '../lib/integrations/google-sheets/sync'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const at = line.indexOf('=')
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
    })
)

assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'Must use local Supabase')
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)
const anonClient = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID || '1QCiG6yWk8IG--qO14BWx6rfw5IZfd01DKDvgjNUZ7VE'
const sheetName = env.GOOGLE_SHEETS_REGISTRATION_TAB || REGISTRATIONS_SHEET_NAME
const config = { spreadsheetId, sheetName }

const testPassword = 'TestPassword123!'

async function confirmMailpitEmail(client: any, email: string) {
  const listRes = await fetch('http://127.0.0.1:54324/api/v1/messages')
  const list: any = await listRes.json()
  const message = list.messages.find((item: any) => item.To?.some((r: any) => r.Address === email))
  assert.ok(message, `Confirmation mail exists for ${email}`)
  const detailRes = await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)
  const detail: any = await detailRes.json()
  const hash = detail.HTML.match(/token_hash=([^&" ]+)/)?.[1]
  assert.ok(hash, `Confirmation token_hash found for ${email}`)
  const confirmed = await client.auth.verifyOtp({ token_hash: hash, type: 'email' })
  assert.equal(confirmed.error, null, `Email confirmed for ${email}`)
  return confirmed.data.user
}

async function createAndConfirmUser(email: string) {
  const client = anonClient()
  const signInRes = await client.auth.signInWithPassword({ email, password: testPassword })
  if (!signInRes.error && signInRes.data.user) {
    return { client, user: signInRes.data.user }
  }
  const { error } = await client.auth.signUp({ email, password: testPassword })
  assert.equal(error, null, `Sign up succeeded for ${email}`)
  await confirmMailpitEmail(client, email)
  const afterConfirm = await client.auth.signInWithPassword({ email, password: testPassword })
  assert.equal(afterConfirm.error, null, `Sign in succeeded for ${email}`)
  return { client, user: afterConfirm.data.user }
}

async function runLiveVerification() {
  console.log('========================================================')
  console.log('PHASE 07.1: REAL GOOGLE SHEETS LIVE VERIFICATION')
  console.log('========================================================')

  const report: Record<string, any> = {}

  // 1. Verify credentials & adapter
  const creds = loadServiceAccountCredentialsFromEnv()
  assert.ok(creds, 'Service account credentials file exists and parsed')
  report.credentialsLoaded = true
  report.serviceAccountEmail = creds.client_email
  console.log('1. Credential file: PASS (Service Account:', creds.client_email, ')')

  const adapter = new HttpGoogleSheetsAdapter(() => getGoogleAccessToken(creds))
  const token = await getGoogleAccessToken(creds)
  assert.ok(token, 'OAuth token minted')
  report.googleAuthentication = 'PASS'
  console.log('2. Google authentication: PASS')

  // 2. Read headers and validate contract
  const headers = await adapter.getHeaders(spreadsheetId, sheetName)
  const headerValidation = validateSheetHeaders(headers)
  assert.equal(headerValidation.valid, true, `Headers valid: ${headerValidation.error}`)
  report.headerValidation = 'PASS'
  console.log('3. Spreadsheet access: PASS')
  console.log('4. Header validation: PASS (Exact 28 columns verified)')

  // Clear any existing pending outbox logs so this run isolates the synthetic user
  await supabase.from('sheet_sync_logs').update({ sync_status: 'SYNCED' })

  // 3. Step 6: Create fresh synthetic registration
  console.log('\n--- STEP 6: CREATE FRESH SYNTHETIC REGISTRATION ---')
  const studentEmail = 'sheets.live.001@college.example'
  const { client: studentClient, user: studentUser } = await createAndConfirmUser(studentEmail)

  const livePayload = {
    full_name: 'Live Sheets Test Student',
    date_of_birth: '2006-05-20',
    gender: 'Male',
    mobile_number: '9876543210',
    personal_email: 'sheets.live.001@example.com',
    college_email: studentEmail,
    register_number: 'SHEETS-LIVE-001',
    department: 'Cyber Security',
    degree_programme: 'B.Tech',
    year_of_study: 2,
    semester: 3,
    section: 'A',
    batch: '2025-2029',
    reason_for_joining: 'Synthetic live Sheets integration test',
    interests: ['Internet of Things', 'Cybersecurity'],
    skill_level: 'INTERMEDIATE',
    previous_iot_experience: true,
    experience_description: 'Synthetic live Sheets integration test',
    skills: [
      { category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' },
      { category: 'HARDWARE', skill: 'ESP32', level: 'INTERMEDIATE' },
      { category: 'TECHNOLOGY', skill: 'MQTT', level: 'INTERMEDIATE' }
    ],
    github_url: 'https://github.com/live-test-student',
    linkedin_url: 'https://linkedin.com/in/live-test-student',
    portfolio_url: 'https://live-test.example.com',
    consent_accuracy: true,
    consent_rules: true,
    consent_data_use: true,
  }

  let registrationId: string
  const { data: existingApp } = await supabase.from('membership_applications').select('*').eq('user_id', studentUser.id).single()
  if (existingApp) {
    registrationId = existingApp.registration_id
    // Reset to PENDING state for fresh verification
    await supabase.from('membership_applications').update({
      status: 'PENDING',
      reviewed_at: null,
      reviewed_by: null,
      review_notes: null,
    }).eq('id', existingApp.id)
    await supabase.from('profiles').update({
      membership_status: 'PENDING',
      role: 'STUDENT',
    }).eq('id', studentUser.id)
    await supabase.from('sheet_sync_logs').update({
      sync_status: 'PENDING',
      error_message: null,
    }).eq('entity_id', existingApp.id)
  } else {
    const submitRes = await studentClient.rpc('submit_membership_application', { payload: livePayload })
    assert.equal(submitRes.error, null, `Application submission failed: ${submitRes.error?.message}`)
    registrationId = submitRes.data
  }

  report.registrationId = registrationId
  console.log('Registration submitted. Registration ID:', registrationId)

  // Verify PostgreSQL initial state
  const { data: profile } = await supabase.from('profiles').select('role,membership_status').eq('id', studentUser.id).single()
  const { data: application } = await supabase.from('membership_applications').select('*').eq('user_id', studentUser.id).single()
  const { data: outboxLog } = await supabase.from('sheet_sync_logs').select('*').eq('entity_id', application.id).single()

  assert.ok(profile, 'profile exists')
  assert.ok(application, 'application exists')
  assert.ok(outboxLog, 'outboxLog exists')
  assert.equal(profile.role, 'STUDENT', 'profiles.role is STUDENT')
  assert.equal(profile.membership_status, 'PENDING', 'profiles.membership_status is PENDING')
  assert.equal(application.status, 'PENDING', 'membership_applications.status is PENDING')
  assert.equal(outboxLog.sync_status, 'PENDING', 'sheet_sync_logs.sync_status is PENDING')
  report.postgreSqlInitialState = 'PASS'
  report.initialOutboxStatus = outboxLog.sync_status
  console.log('PostgreSQL verification: PASS (Role=STUDENT, Status=PENDING, Outbox=PENDING)')

  // 4. Step 7: Run real Sheets worker
  console.log('\n--- STEP 7: RUN REAL SHEETS WORKER ---')
  const syncSummary = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.ok(syncSummary.succeeded >= 1, 'Sync worker processed jobs successfully')
  assert.ok(syncSummary.details.some(d => d.registrationId === registrationId && d.status === 'SYNCED'), 'Synthetic registration synced')

  const { data: outboxAfterSync } = await supabase.from('sheet_sync_logs').select('*').eq('entity_id', application.id).single()
  assert.equal(outboxAfterSync.sync_status, 'SYNCED', 'Outbox status is SYNCED')
  assert.ok(outboxAfterSync.synced_at, 'synced_at populated')
  report.realSheetAppendResult = 'PASS'
  console.log('Worker execution: PASS (Status transitioned to SYNCED)')

  // Read the real Google Sheet back
  const allRows = await adapter.getAllRows(spreadsheetId, sheetName)
  const matchedRows = allRows.filter((r) => r[0] === registrationId)
  assert.equal(matchedRows.length, 1, `Exactly 1 row expected in Google Sheet for ${registrationId}, found ${matchedRows.length}`)
  console.log(`Found exactly 1 row for ${registrationId} in Google Sheet!`)

  // 5. Step 8: Verify all 28 columns A:AB
  console.log('\n--- STEP 8: VERIFY A:AB COLUMNS ---')
  const actualRow = matchedRows[0]
  const fullData = await fetchFullApplicationData(supabase, application.id)

  const expectedValues: Record<string, { col: string; name: string; expected: string; actual: string; match: boolean }> = {
    A: { col: 'A', name: 'Registration ID', expected: registrationId, actual: actualRow[0], match: actualRow[0] === registrationId },
    B: { col: 'B', name: 'Register Number', expected: 'SHEETS-LIVE-001', actual: actualRow[1], match: actualRow[1] === 'SHEETS-LIVE-001' },
    C: { col: 'C', name: 'Full Name', expected: 'Live Sheets Test Student', actual: actualRow[2], match: actualRow[2] === 'Live Sheets Test Student' },
    D: { col: 'D', name: 'Department', expected: 'Cyber Security', actual: actualRow[3], match: actualRow[3] === 'Cyber Security' },
    E: { col: 'E', name: 'Degree / Programme', expected: 'B.Tech', actual: actualRow[4], match: actualRow[4] === 'B.Tech' },
    F: { col: 'F', name: 'Year', expected: '2', actual: actualRow[5], match: actualRow[5] === '2' },
    G: { col: 'G', name: 'Semester', expected: '3', actual: actualRow[6], match: actualRow[6] === '3' },
    H: { col: 'H', name: 'Section', expected: 'A', actual: actualRow[7], match: actualRow[7] === 'A' },
    I: { col: 'I', name: 'Batch', expected: '2025-2029', actual: actualRow[8], match: actualRow[8] === '2025-2029' },
    J: { col: 'J', name: 'Mobile Number', expected: '9876543210', actual: actualRow[9], match: actualRow[9] === '9876543210' },
    K: { col: 'K', name: 'College Email', expected: studentEmail, actual: actualRow[10], match: actualRow[10] === studentEmail },
    L: { col: 'L', name: 'Personal Email', expected: 'sheets.live.001@example.com', actual: actualRow[11], match: actualRow[11] === 'sheets.live.001@example.com' },
    M: { col: 'M', name: 'Gender', expected: 'Male', actual: actualRow[12], match: actualRow[12] === 'Male' },
    N: { col: 'N', name: 'Areas of Interest', expected: 'Cybersecurity, Internet of Things', actual: actualRow[13], match: actualRow[13] === 'Cybersecurity, Internet of Things' },
    O: { col: 'O', name: 'Skill Level', expected: 'INTERMEDIATE', actual: actualRow[14], match: actualRow[14] === 'INTERMEDIATE' },
    P: { col: 'P', name: 'Previous IoT Experience', expected: 'Yes', actual: actualRow[15], match: actualRow[15] === 'Yes' },
    Q: { col: 'Q', name: 'Programming Skills', expected: 'Python', actual: actualRow[16], match: actualRow[16] === 'Python' },
    R: { col: 'R', name: 'Hardware Skills', expected: 'ESP32', actual: actualRow[17], match: actualRow[17] === 'ESP32' },
    S: { col: 'S', name: 'Technology Skills', expected: 'MQTT', actual: actualRow[18], match: actualRow[18] === 'MQTT' },
    T: { col: 'T', name: 'GitHub URL', expected: 'https://github.com/live-test-student', actual: actualRow[19], match: actualRow[19] === 'https://github.com/live-test-student' },
    U: { col: 'U', name: 'LinkedIn URL', expected: 'https://linkedin.com/in/live-test-student', actual: actualRow[20], match: actualRow[20] === 'https://linkedin.com/in/live-test-student' },
    V: { col: 'V', name: 'Portfolio URL', expected: 'https://live-test.example.com', actual: actualRow[21], match: actualRow[21] === 'https://live-test.example.com' },
    W: { col: 'W', name: 'Membership Status', expected: 'PENDING', actual: actualRow[22], match: actualRow[22] === 'PENDING' },
    X: { col: 'X', name: 'Submitted At', expected: new Date(application.submitted_at).toISOString(), actual: actualRow[23], match: Boolean(actualRow[23]) },
    Y: { col: 'Y', name: 'Reviewed At', expected: '', actual: actualRow[24] || '', match: (actualRow[24] || '') === '' },
    Z: { col: 'Z', name: 'Reviewed By', expected: '', actual: actualRow[25] || '', match: (actualRow[25] || '') === '' },
    AA: { col: 'AA', name: 'Review Notes', expected: '', actual: actualRow[26] || '', match: (actualRow[26] || '') === '' },
    AB: { col: 'AB', name: 'Last Synced At', expected: 'ISO date', actual: actualRow[27], match: Boolean(actualRow[27]) },
  }

  const columnVerification: Record<string, string> = {}
  for (const [key, val] of Object.entries(expectedValues)) {
    assert.equal(val.match, true, `Column ${val.col} (${val.name}) mismatch: expected "${val.expected}", got "${val.actual}"`)
    columnVerification[val.col] = `${val.name}: PASS (${val.actual})`
    console.log(`Col ${val.col.padEnd(2)} [${val.name.padEnd(24)}]: PASS => "${val.actual}"`)
  }
  report.columnsVerification = columnVerification

  // 6. Step 9: Idempotency test
  console.log('\n--- STEP 9: IDEMPOTENCY (RE-SYNC) ---')
  await supabase.from('sheet_sync_logs').update({ sync_status: 'PENDING' }).eq('entity_id', application.id)
  const resyncSummary = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.equal(resyncSummary.succeeded, 1, 'Re-sync succeeded')

  const rowsAfterResync = await adapter.getAllRows(spreadsheetId, sheetName)
  const matchedAfterResync = rowsAfterResync.filter((r) => r[0] === registrationId)
  assert.equal(matchedAfterResync.length, 1, 'Row count unchanged, exactly 1 row for Registration ID')
  assert.equal(rowsAfterResync.length, allRows.length, 'Total rows in Google Sheet unchanged')
  report.idempotentResync = 'PASS'
  console.log('Idempotency check: PASS (Total sheet rows:', rowsAfterResync.length, ', Duplicates: 0)')

  // 7. Step 10: Admin Approval Test
  console.log('\n--- STEP 10: ADMIN APPROVAL FLOW ---')
  const adminEmail = 'test.admin@college.example'
  const { client: adminClient, user: adminUser } = await createAndConfirmUser(adminEmail)
  await supabase.from('profiles').update({ role: 'ADMIN', full_name: 'Lead Admin Officer' }).eq('id', adminUser.id)

  const reviewRes = await adminClient.rpc('review_membership_application', {
    application_id: application.id,
    decision: 'APPROVED',
    notes: 'Approved during live Google Sheets verification test',
  })
  assert.equal(reviewRes.error, null, `Review RPC failed: ${reviewRes.error?.message}`)

  // Verify PostgreSQL updated
  const { data: approvedApp } = await supabase.from('membership_applications').select('*').eq('id', application.id).single()
  const { data: approvedProfile } = await supabase.from('profiles').select('*').eq('id', studentUser.id).single()
  const { data: outboxAfterApproval } = await supabase.from('sheet_sync_logs').select('*').eq('entity_id', application.id).single()

  assert.equal(approvedApp.status, 'APPROVED', 'application.status is APPROVED')
  assert.equal(approvedProfile.membership_status, 'APPROVED', 'profile.membership_status is APPROVED')
  assert.ok(approvedApp.reviewed_at, 'reviewed_at is populated')
  assert.equal(approvedApp.reviewed_by, adminUser.id, 'reviewed_by is admin user id')
  assert.equal(outboxAfterApproval.sync_status, 'PENDING', 'Trigger reset outbox sync_status to PENDING')
  console.log('Admin approval committed in PostgreSQL: PASS')

  // Run real Sheet worker to sync approval update
  const approvalSyncSummary = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.equal(approvalSyncSummary.succeeded, 1, 'Approval sync succeeded')

  const rowsAfterApproval = await adapter.getAllRows(spreadsheetId, sheetName)
  const matchedAfterApproval = rowsAfterApproval.filter((r) => r[0] === registrationId)
  assert.equal(matchedAfterApproval.length, 1, 'Still exactly 1 row in Google Sheet')
  assert.equal(rowsAfterApproval.length, allRows.length, 'Total rows unchanged, NO second row created')

  const approvedRow = matchedAfterApproval[0]
  assert.equal(approvedRow[22], 'APPROVED', 'Column W (Membership Status) updated in place to APPROVED')
  assert.ok(approvedRow[24], 'Column Y (Reviewed At) populated')
  assert.equal(approvedRow[25], 'Lead Admin Officer', 'Column Z (Reviewed By) populated with admin name')
  assert.equal(approvedRow[26], 'Approved during live Google Sheets verification test', 'Column AA (Review Notes) populated')
  report.adminApprovalResult = 'PASS'
  report.sameRowUpdateResult = 'PASS'
  report.duplicateCount = 0
  console.log('Same-row update in Google Sheet: PASS (Status=APPROVED, ReviewedBy=Lead Admin Officer, Duplicates=0)')

  // 8. Step 11: Failure Isolation & Recovery
  console.log('\n--- STEP 11: FAILURE ISOLATION & RECOVERY ---')
  await supabase.from('sheet_sync_logs').update({ sync_status: 'PENDING' }).eq('entity_id', application.id)
  const invalidConfig = { spreadsheetId: '1InvalidSpreadsheetID_FOR_FAILURE_TESTING', sheetName }
  const failSummary = await processSheetSyncOutbox(supabase, adapter, invalidConfig, 10)
  assert.equal(failSummary.failed, 1, 'Sync failed as expected with invalid spreadsheet ID')

  // Verify PostgreSQL remains APPROVED and unaffected
  const { data: appDuringFail } = await supabase.from('membership_applications').select('status').eq('id', application.id).single()
  const { data: outboxDuringFail } = await supabase.from('sheet_sync_logs').select('*').eq('entity_id', application.id).single()

  assert.ok(appDuringFail, 'appDuringFail exists')
  assert.ok(outboxDuringFail, 'outboxDuringFail exists')
  assert.equal(appDuringFail.status, 'APPROVED', 'DB application remains unaffected and APPROVED')
  assert.equal(outboxDuringFail.sync_status, 'FAILED', 'Outbox status is FAILED')
  assert.ok(outboxDuringFail.attempt_count >= 1, 'attempt_count incremented')
  assert.ok(outboxDuringFail.error_message, 'error_message captured')
  report.failureIsolationResult = 'PASS'
  console.log('Failure isolation: PASS (PostgreSQL status stays APPROVED, outbox captures FAILED status)')

  // Recover with correct ID
  await supabase.from('sheet_sync_logs').update({ sync_status: 'PENDING' }).eq('entity_id', application.id)
  const recoverySummary = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.equal(recoverySummary.succeeded, 1, 'Recovery sync succeeded')

  const { data: outboxRecovered } = await supabase.from('sheet_sync_logs').select('*').eq('entity_id', application.id).single()
  assert.ok(outboxRecovered, 'outboxRecovered exists')
  assert.equal(outboxRecovered.sync_status, 'SYNCED', 'Outbox status recovered to SYNCED')
  assert.equal(outboxRecovered.error_message, null, 'Error message cleared on recovery')
  report.retryResult = 'PASS'
  console.log('Retry recovery: PASS (Status recovered to SYNCED)')

  // 9. Step 12: Source of Truth Test
  console.log('\n--- STEP 12: SOURCE OF TRUTH TEST ---')
  // Find row index in Google Sheet
  const targetRowIndex = await adapter.findRowIndexByRegistrationId(spreadsheetId, sheetName, registrationId)
  assert.ok(targetRowIndex, 'Found row index in Google Sheet')

  // Temporarily tamper Column C (Full Name) in Google Sheet directly
  const tamperedRow = [...approvedRow]
  tamperedRow[2] = 'Tampered Sheet Name'
  await adapter.updateRow(spreadsheetId, sheetName, targetRowIndex, tamperedRow)

  // Verify sheet now has tampered name
  const rowsWithTamper = await adapter.getAllRows(spreadsheetId, sheetName)
  const rowTampered = rowsWithTamper.find((r) => r[0] === registrationId)
  assert.equal(rowTampered?.[2], 'Tampered Sheet Name', 'Google Sheet was successfully tampered for test')
  console.log('Tampered Google Sheet Column C with: "Tampered Sheet Name"')

  // Trigger sync from PostgreSQL (PostgreSQL still has "Live Sheets Test Student")
  await supabase.from('sheet_sync_logs').update({ sync_status: 'PENDING' }).eq('entity_id', application.id)
  const sotSync = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.equal(sotSync.succeeded, 1, 'Source-of-truth sync succeeded')

  // Read sheet back: PostgreSQL value must have overwritten the tampered sheet edit
  const rowsAfterSot = await adapter.getAllRows(spreadsheetId, sheetName)
  const restoredRow = rowsAfterSot.find((r) => r[0] === registrationId)
  assert.equal(restoredRow?.[2], 'Live Sheets Test Student', 'PostgreSQL value overwrote manual Google Sheet edit!')
  report.sourceOfTruthResult = 'PASS'
  console.log('Source of Truth verified: PASS (PostgreSQL value overwrote manual sheet edit)')

  console.log('\n========================================================')
  console.log('ALL PHASE 07.1 LIVE VERIFICATION TESTS PASSED!')
  console.log('========================================================')
  console.log(JSON.stringify(report, null, 2))
}

runLiveVerification().catch((err) => {
  console.error('\nLIVE VERIFICATION SUITE FAILED:')
  console.error(err)
  process.exit(1)
})
