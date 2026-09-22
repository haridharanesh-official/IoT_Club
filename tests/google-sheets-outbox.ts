import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  REGISTRATIONS_SHEET_HEADERS,
  REGISTRATIONS_SHEET_NAME,
  mapApplicationToSheetRow,
  validateSheetHeaders,
  upsertRegistrationRow,
  syncSingleApplication,
  processSheetSyncOutbox,
} from '../lib/integrations/google-sheets/index'
import { FakeGoogleSheetsAdapter } from './fixtures/fake-google-sheets-adapter'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const at = line.indexOf('=')
      return [line.slice(0, at), line.slice(at + 1).replace(/^['"]|['"]$/g, '')]
    })
)

assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'Must use local Supabase')
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.LOCAL_SERVICE_ROLE_KEY || ''
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)

const config = {
  spreadsheetId: 'test-spreadsheet-id',
  sheetName: REGISTRATIONS_SHEET_NAME,
}

async function runTests() {
  console.log('========================================================')
  console.log('STARTING PHASE 07 GOOGLE SHEETS OUTBOX & ADAPTER TESTS')
  console.log('========================================================\n')

  const testResults: Record<string, boolean> = {}

  // Find or use an existing application from the DB
  const { data: apps, error: appErr } = await supabase
    .from('membership_applications')
    .select('id, registration_id, status')
    .order('created_at', { ascending: false })
    .limit(1)

  assert.equal(appErr, null, 'Can query applications')
  assert.ok(apps && apps.length > 0, 'At least one application exists in local DB')
  const testApp = apps[0]
  console.log(`Using application ID: ${testApp.id} (${testApp.registration_id}) for sync tests`)

  const adapter = new FakeGoogleSheetsAdapter()

  // --------------------------------------------------------------------------
  // TEST 1: New registration → APPEND
  // --------------------------------------------------------------------------
  console.log('TEST 1: New registration → APPEND...')
  const sync1 = await syncSingleApplication(supabase, adapter, config, testApp.id)
  assert.equal(sync1.success, true, 'Sync 1 should succeed')
  assert.equal(sync1.operation, 'APPEND', 'First sync must be an APPEND')
  const rowsAfter1 = await adapter.getAllRows(config.spreadsheetId, config.sheetName)
  assert.equal(rowsAfter1.length, 2, 'Should have header row + 1 data row')
  assert.equal(rowsAfter1[0][0], 'Registration ID', 'Header row starts with Registration ID')
  assert.equal(rowsAfter1[1][0], testApp.registration_id, 'Data row column A matches registration ID')
  assert.equal(rowsAfter1[1].length, REGISTRATIONS_SHEET_HEADERS.length, 'Row has exact 28 columns')

  const { data: log1 } = await supabase
    .from('sheet_sync_logs')
    .select('*')
    .eq('entity_id', testApp.id)
    .single()
  assert.equal(log1.sync_status, 'SYNCED', 'Outbox status should be SYNCED')
  assert.ok(log1.synced_at, 'synced_at should be recorded')
  console.log('✓ TEST 1 PASSED: Appended row successfully with 28 columns.\n')
  testResults.test1_append = true

  // --------------------------------------------------------------------------
  // TEST 2: Same registration again → UPDATE, no duplicate
  // --------------------------------------------------------------------------
  console.log('TEST 2: Same registration again → UPDATE, no duplicate...')
  const sync2 = await syncSingleApplication(supabase, adapter, config, testApp.id)
  assert.equal(sync2.success, true, 'Sync 2 should succeed')
  assert.equal(sync2.operation, 'UPDATE', 'Second sync must be an UPDATE')
  const rowsAfter2 = await adapter.getAllRows(config.spreadsheetId, config.sheetName)
  assert.equal(rowsAfter2.length, 2, 'Row count must stay 2 (no duplicate row appended)')
  console.log('✓ TEST 2 PASSED: Row updated in place without duplicate creation.\n')
  testResults.test2_update_idempotent = true

  // --------------------------------------------------------------------------
  // TEST 3: PENDING → APPROVED → same row updated
  // --------------------------------------------------------------------------
  console.log('TEST 3: PENDING → APPROVED → same row updated in-place...')
  // Update status in DB
  await supabase
    .from('membership_applications')
    .update({
      status: 'APPROVED',
      reviewed_at: new Date().toISOString(),
      review_notes: 'Automated test approval note',
    })
    .eq('id', testApp.id)

  // Verify trigger set outbox status to PENDING
  const { data: logAfterApproval } = await supabase
    .from('sheet_sync_logs')
    .select('sync_status')
    .eq('entity_id', testApp.id)
    .single()
  assert.equal(logAfterApproval?.sync_status, 'PENDING', 'Trigger reset outbox status to PENDING on approval')

  const sync3 = await syncSingleApplication(supabase, adapter, config, testApp.id)
  assert.equal(sync3.success, true, 'Sync after approval should succeed')
  assert.equal(sync3.operation, 'UPDATE', 'Status change must update existing row')
  const rowsAfter3 = await adapter.getAllRows(config.spreadsheetId, config.sheetName)
  assert.equal(rowsAfter3.length, 2, 'Row count remains 2')
  assert.equal(rowsAfter3[1][22], 'APPROVED', 'Column W (Membership Status) must be updated to APPROVED')
  assert.ok(rowsAfter3[1][24], 'Column Y (Reviewed At) must be populated')
  assert.equal(rowsAfter3[1][26], 'Automated test approval note', 'Column AA (Review Notes) updated')
  console.log('✓ TEST 3 PASSED: Approval updated existing row in place with status and notes.\n')
  testResults.test3_status_change_update = true

  // --------------------------------------------------------------------------
  // TEST 4: Google failure → DB registration remains valid + FAILED sync state
  // --------------------------------------------------------------------------
  console.log('TEST 4: Google failure → DB remains valid + FAILED sync state...')
  const failingAdapter = {
    async getHeaders() {
      throw new Error('Google Sheets API 503 Service Unavailable: Simulated upstream network error')
    },
    async ensureSheetExists() {
      throw new Error('Google Sheets API 503 Service Unavailable')
    },
    async findRowIndexByRegistrationId() {
      return null
    },
    async appendRow(): Promise<{ rowNumber: number }> {
      throw new Error('Google Sheets API 503 Service Unavailable')
    },
    async updateRow() {
      throw new Error('Google Sheets API 503 Service Unavailable')
    },
    async getAllRows(): Promise<string[][]> {
      return []
    },
  }

  const syncFail = await syncSingleApplication(supabase, failingAdapter, config, testApp.id)
  assert.equal(syncFail.success, false, 'Sync should fail when adapter throws')
  assert.match(syncFail.error || '', /Google Sheets API 503/, 'Error message captured')

  // Verify PostgreSQL registration data is still 100% valid and untouched
  const { data: appCheck } = await supabase
    .from('membership_applications')
    .select('status')
    .eq('id', testApp.id)
    .single()
  assert.equal(appCheck?.status, 'APPROVED', 'Database application remains valid and committed')

  // Verify outbox record transitioned to FAILED
  const { data: logFailed } = await supabase
    .from('sheet_sync_logs')
    .select('sync_status, error_message')
    .eq('entity_id', testApp.id)
    .single()
  assert.equal(logFailed?.sync_status, 'FAILED', 'Sync status transitioned to FAILED')
  assert.ok(logFailed?.error_message?.includes('503 Service Unavailable'), 'Error message recorded')
  console.log('✓ TEST 4 PASSED: DB data unaffected, outbox captured FAILED state with error.\n')
  testResults.test4_failure_isolation = true

  // --------------------------------------------------------------------------
  // TEST 5: Retry → success → SYNCED
  // --------------------------------------------------------------------------
  console.log('TEST 5: Retry → success → SYNCED...')
  // Retry using working adapter
  const syncRetry = await syncSingleApplication(supabase, adapter, config, testApp.id)
  assert.equal(syncRetry.success, true, 'Retry should succeed')
  const { data: logRetried } = await supabase
    .from('sheet_sync_logs')
    .select('sync_status, error_message, synced_at')
    .eq('entity_id', testApp.id)
    .single()
  assert.equal(logRetried?.sync_status, 'SYNCED', 'Status recovered to SYNCED')
  assert.equal(logRetried?.error_message, null, 'Error message cleared on recovery')
  assert.ok(logRetried?.synced_at, 'synced_at updated')
  console.log('✓ TEST 5 PASSED: Retry successfully recovered row and updated outbox to SYNCED.\n')
  testResults.test5_retry_recovery = true

  // --------------------------------------------------------------------------
  // TEST 6: Two workers attempt same registration → only one effective sync
  // --------------------------------------------------------------------------
  console.log('TEST 6: Two workers attempt same registration concurrency test...')
  // Reset outbox status to PENDING
  await supabase
    .from('sheet_sync_logs')
    .update({ sync_status: 'SYNCED' })
    .neq('entity_id', testApp.id)
  await supabase
    .from('sheet_sync_logs')
    .update({ sync_status: 'PENDING' })
    .eq('entity_id', testApp.id)

  // Run two concurrent processSheetSyncOutbox invocations
  const [worker1Result, worker2Result] = await Promise.all([
    processSheetSyncOutbox(supabase, adapter, config, 10),
    processSheetSyncOutbox(supabase, adapter, config, 10),
  ])

  console.log('Worker 1 processed:', worker1Result.totalProcessed, 'Worker 2 processed:', worker2Result.totalProcessed)
  const totalClaimed = worker1Result.totalProcessed + worker2Result.totalProcessed
  assert.equal(totalClaimed, 1, 'Only one worker must successfully claim the job')
  assert.equal(
    worker1Result.details.some((d) => worker2Result.details.some((d2) => d2.entityId === d.entityId)),
    false,
    'No job is ever processed by both workers'
  )
  const successfulSyncs = worker1Result.succeeded + worker2Result.succeeded
  assert.equal(successfulSyncs, 1, 'Exactly one sync performed')
  console.log('✓ TEST 6 PASSED: Concurrency safe claiming via SKIP LOCKED verified.\n')
  testResults.test6_concurrency_skip_locked = true

  // --------------------------------------------------------------------------
  // TEST 7: Malformed sheet configuration → controlled failure
  // --------------------------------------------------------------------------
  console.log('TEST 7: Malformed sheet configuration → controlled failure...')
  const badHeadersAdapter = new FakeGoogleSheetsAdapter({
    [REGISTRATIONS_SHEET_NAME]: [
      ['Invalid Column A', 'Invalid Column B', 'Invalid Column C'], // Wrong headers
      ['data1', 'data2', 'data3'],
    ],
  })

  const syncMalformed = await syncSingleApplication(supabase, badHeadersAdapter, config, testApp.id)
  assert.equal(syncMalformed.success, false, 'Must fail on malformed headers')
  assert.ok(
    syncMalformed.error?.includes('Sheet header validation failed'),
    'Reports clean configuration error on wrong headers'
  )
  console.log('✓ TEST 7 PASSED: Malformed headers rejected with controlled configuration error.\n')
  testResults.test7_header_validation = true

  console.log('========================================================')
  console.log('ALL 7 PHASE 07 ADAPTER AND OUTBOX TESTS PASSED!')
  console.log('========================================================')
  console.log(JSON.stringify(testResults, null, 2))
}

runTests().catch((err) => {
  console.error('TEST SUITE FAILED:', err)
  process.exit(1)
})
