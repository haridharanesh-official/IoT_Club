import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { createGoogleSheetsAdapterFromEnv } from '../lib/integrations/google-sheets/client'

// Load .env.local
if (existsSync('.env.local')) {
  const envContent = readFileSync('.env.local', 'utf8')
  for (const line of envContent.split(/\r?\n/)) {
    if (line.includes('=') && !line.startsWith('#')) {
      const at = line.indexOf('=')
      const k = line.slice(0, at).trim()
      const v = line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[k]) process.env[k] = v
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
const SHEET_TAB = process.env.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'
const INTERNAL_SYNC_SECRET = process.env.INTERNAL_SHEETS_SYNC_SECRET!

assert.ok(SERVICE_KEY, 'SUPABASE_SERVICE_ROLE_KEY must be defined')
assert.ok(INTERNAL_SYNC_SECRET, 'INTERNAL_SHEETS_SYNC_SECRET must be defined')
assert.notEqual(SERVICE_KEY, INTERNAL_SYNC_SECRET, 'Worker secret must be completely distinct from service role key')

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const BASE_URL = 'http://localhost:3000'

async function runPhase084Tests() {
  console.log('========================================================')
  console.log('PHASE 08.4 — SEPARATE INTERNAL WORKER SECRET TEST SUITE')
  console.log('========================================================\n')

  async function cleanupUser(email: string) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = data?.users?.find((u) => u.email === email)
    if (user) {
      await supabaseAdmin.from('audit_logs').delete().eq('actor_user_id', user.id)
      await supabaseAdmin.from('membership_applications').update({ reviewed_by: null }).eq('reviewed_by', user.id)
      const { data: app } = await supabaseAdmin.from('membership_applications').select('id').eq('user_id', user.id).single()
      if (app) {
        await supabaseAdmin.from('sheet_sync_logs').delete().eq('entity_id', app.id)
      }
      await supabaseAdmin.from('membership_applications').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_profiles').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_interests').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_skills').delete().eq('user_id', user.id)
      await supabaseAdmin.from('profiles').delete().eq('id', user.id)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
  }

  // -----------------------------------------------------------
  // PART 1: GLOBAL SYNC ENDPOINT AUTHORIZATION
  // -----------------------------------------------------------

  // Test 1.1: Anonymous POST global sync -> 401
  console.log('TEST 1.1: Anonymous POST global sync...')
  const anonRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, { method: 'POST' })
  assert.equal(anonRes.status, 401, 'Anonymous request must return 401')
  console.log('✓ TEST 1.1 PASSED: Anonymous caller rejected with 401.\n')

  // Test 1.2: Valid INTERNAL_SHEETS_SYNC_SECRET via x-internal-secret -> 200
  console.log('TEST 1.2: Valid INTERNAL_SHEETS_SYNC_SECRET via x-internal-secret header...')
  const validSecretRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { 'x-internal-secret': INTERNAL_SYNC_SECRET },
  })
  assert.equal(validSecretRes.status, 200, 'Valid dedicated secret must return 200')
  const validSecretJson = await validSecretRes.json()
  assert.equal(validSecretJson.ok, true, 'Sync succeeds with valid secret')
  console.log('✓ TEST 1.2 PASSED: Dedicated internal secret allowed with 200 OK.\n')

  // Test 1.3: Valid INTERNAL_SHEETS_SYNC_SECRET via Bearer token -> 200
  console.log('TEST 1.3: Valid INTERNAL_SHEETS_SYNC_SECRET via Bearer token...')
  const validBearerRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${INTERNAL_SYNC_SECRET}` },
  })
  assert.equal(validBearerRes.status, 200, 'Valid dedicated secret via Bearer must return 200')
  const validBearerJson = await validBearerRes.json()
  assert.equal(validBearerJson.ok, true, 'Bearer sync succeeds')
  console.log('✓ TEST 1.3 PASSED: Dedicated internal secret via Bearer allowed with 200 OK.\n')

  // Test 1.4: Invalid INTERNAL_SHEETS_SYNC_SECRET -> 403
  console.log('TEST 1.4: Invalid internal secret...')
  const invalidSecretRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { 'x-internal-secret': 'invalid_secret_token_12345' },
  })
  assert.equal(invalidSecretRes.status, 403, 'Invalid secret must return 403')
  console.log('✓ TEST 1.4 PASSED: Invalid secret denied with 403 Forbidden.\n')

  // Test 1.5: SUPABASE_SERVICE_ROLE_KEY supplied as x-internal-secret -> MANDATORY DENIAL
  console.log('TEST 1.5: SUPABASE_SERVICE_ROLE_KEY supplied as x-internal-secret...')
  const serviceKeyAsSecretRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { 'x-internal-secret': SERVICE_KEY },
  })
  assert.equal(serviceKeyAsSecretRes.status, 403, 'Service role key as x-internal-secret must be DENIED with 403')
  const serviceKeyAsSecretJson = await serviceKeyAsSecretRes.json()
  assert.equal(serviceKeyAsSecretJson.ok, false)
  console.log('✓ TEST 1.5 PASSED: SUPABASE_SERVICE_ROLE_KEY as x-internal-secret rejected with 403.\n')

  // Test 1.6: SUPABASE_SERVICE_ROLE_KEY supplied as Bearer token -> MANDATORY DENIAL
  console.log('TEST 1.6: SUPABASE_SERVICE_ROLE_KEY supplied as Bearer token...')
  const serviceKeyAsBearerRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  })
  assert.equal(serviceKeyAsBearerRes.status, 403, 'Service role key as Bearer must be DENIED with 403')
  const serviceKeyAsBearerJson = await serviceKeyAsBearerRes.json()
  assert.equal(serviceKeyAsBearerJson.ok, false)
  console.log('✓ TEST 1.6 PASSED: SUPABASE_SERVICE_ROLE_KEY as Bearer token rejected with 403.\n')

  // Test 1.7: Role-based caller tests (STUDENT -> 403, TEACHER -> 403, ADMIN -> 200, SUPER_ADMIN -> 200)
  console.log('TEST 1.7: Role-based authorization tests on global sync...')
  const testStudentEmail = 'phase84.student@college.example'
  const testTeacherEmail = 'phase84.teacher@college.example'
  const testSuperAdminEmail = 'phase84.superadmin@college.example'

  await cleanupUser(testStudentEmail)
  await cleanupUser(testTeacherEmail)
  await cleanupUser(testSuperAdminEmail)

  const { data: sUser } = await supabaseAdmin.auth.admin.createUser({ email: testStudentEmail, email_confirm: true, password: 'TestPassword123!' })
  await supabaseAdmin.from('profiles').update({ role: 'STUDENT', full_name: 'Test Student P84' }).eq('id', sUser.user!.id)

  const { data: tUser } = await supabaseAdmin.auth.admin.createUser({ email: testTeacherEmail, email_confirm: true, password: 'TestPassword123!' })
  await supabaseAdmin.from('profiles').update({ role: 'TEACHER', full_name: 'Test Teacher P84' }).eq('id', tUser.user!.id)

  const { data: saUser } = await supabaseAdmin.auth.admin.createUser({ email: testSuperAdminEmail, email_confirm: true, password: 'TestPassword123!' })
  await supabaseAdmin.from('profiles').update({ role: 'SUPER_ADMIN', full_name: 'Test Super Admin P84' }).eq('id', saUser.user!.id)

  const clientAnon = createClient(SUPABASE_URL, ANON_KEY)

  // STUDENT test
  const sLogin = await clientAnon.auth.signInWithPassword({ email: testStudentEmail, password: 'TestPassword123!' })
  const sRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sLogin.data.session!.access_token}` },
  })
  assert.equal(sRes.status, 403, 'STUDENT calling global sync must return 403')

  // TEACHER test
  const tLogin = await clientAnon.auth.signInWithPassword({ email: testTeacherEmail, password: 'TestPassword123!' })
  const tRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tLogin.data.session!.access_token}` },
  })
  assert.equal(tRes.status, 403, 'TEACHER calling global sync must return 403')

  // ADMIN test
  const aLogin = await clientAnon.auth.signInWithPassword({ email: 'test.admin@college.example', password: 'TestPassword123!' })
  const aRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${aLogin.data.session!.access_token}` },
  })
  assert.equal(aRes.status, 200, 'ADMIN calling global sync must return 200')

  // SUPER_ADMIN test
  const saLogin = await clientAnon.auth.signInWithPassword({ email: testSuperAdminEmail, password: 'TestPassword123!' })
  const saRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saLogin.data.session!.access_token}` },
  })
  assert.equal(saRes.status, 200, 'SUPER_ADMIN calling global sync must return 200')

  console.log('✓ TEST 1.7 PASSED: Student=403, Teacher=403, Admin=200, SuperAdmin=200 verified.\n')

  // -----------------------------------------------------------
  // PART 2: SELF-SYNC AUTHORIZATION & CROSS-STUDENT ISOLATION
  // -----------------------------------------------------------
  console.log('TEST 2: Two Students Self-Sync & Cross-Student Isolation...')

  const studentAEmail = `student.a.${Date.now()}@college.example`
  const studentBEmail = `student.b.${Date.now()}@college.example`

  const { data: userA } = await supabaseAdmin.auth.admin.createUser({ email: studentAEmail, email_confirm: true, password: 'TestPassword123!' })
  const { data: userB } = await supabaseAdmin.auth.admin.createUser({ email: studentBEmail, email_confirm: true, password: 'TestPassword123!' })

  await supabaseAdmin.from('profiles').update({ role: 'STUDENT', full_name: 'Student Alice' }).eq('id', userA.user!.id)
  await supabaseAdmin.from('profiles').update({ role: 'STUDENT', full_name: 'Student Bob' }).eq('id', userB.user!.id)

  const clientA = createClient(SUPABASE_URL, ANON_KEY)
  const loginA = await clientA.auth.signInWithPassword({ email: studentAEmail, password: 'TestPassword123!' })

  const clientB = createClient(SUPABASE_URL, ANON_KEY)
  const loginB = await clientB.auth.signInWithPassword({ email: studentBEmail, password: 'TestPassword123!' })

  // Student A registers
  const regNumA = `REG-A-${Date.now().toString().slice(-5)}`
  const payloadA = {
    full_name: 'Student Alice',
    date_of_birth: '2005-01-10',
    gender: 'Female',
    mobile_number: '9111111111',
    personal_email: studentAEmail,
    college_email: studentAEmail,
    register_number: regNumA,
    department: 'CSE',
    degree_programme: 'B.Tech',
    year_of_study: 1,
    semester: 2,
    section: 'A',
    batch: '2025-2029',
    reason_for_joining: 'Student Alice registration',
    interests: ['Internet of Things'],
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
  const submitA = await clientA.rpc('submit_membership_application', { payload: payloadA })
  assert.equal(submitA.error, null, 'Alice registration succeeded')

  const { data: appA } = await supabaseAdmin.from('membership_applications').select('*').eq('user_id', userA.user!.id).single()
  console.log(`Student Alice Registration ID: ${appA.registration_id}`)

  // Student B registers
  const regNumB = `REG-B-${Date.now().toString().slice(-5)}`
  const payloadB = {
    full_name: 'Student Bob',
    date_of_birth: '2005-02-20',
    gender: 'Male',
    mobile_number: '9222222222',
    personal_email: studentBEmail,
    college_email: studentBEmail,
    register_number: regNumB,
    department: 'ECE',
    degree_programme: 'B.E.',
    year_of_study: 2,
    semester: 3,
    section: 'B',
    batch: '2025-2029',
    reason_for_joining: 'Student Bob registration',
    interests: ['Embedded Systems'],
    skill_level: 'INTERMEDIATE',
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
  const submitB = await clientB.rpc('submit_membership_application', { payload: payloadB })
  assert.equal(submitB.error, null, 'Bob registration succeeded')

  const { data: appB } = await supabaseAdmin.from('membership_applications').select('*').eq('user_id', userB.user!.id).single()
  console.log(`Student Bob Registration ID: ${appB.registration_id}`)

  // Verify both outboxes are initially PENDING
  const { data: outboxA1 } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', appA.id).single()
  const { data: outboxB1 } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', appB.id).single()
  assert.equal(outboxA1.sync_status, 'PENDING')
  assert.equal(outboxB1.sync_status, 'PENDING')

  // Attack 1: Student A calls self-sync while attempting to pass Student B's IDs in body & query
  console.log('Simulating attack: Student A attempts to sync Student B application...')
  const attackRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync/self?application_id=${appB.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${loginA.data.session!.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userB.user!.id,
      application_id: appB.id,
      registration_id: appB.registration_id,
    }),
  })
  assert.equal(attackRes.status, 200, 'Endpoint processes request under Student A identity')
  const attackJson = await attackRes.json()
  // Endpoint returned success for Student A's own registration only!
  assert.equal(attackJson.registrationId, appA.registration_id, 'Must sync ONLY Student A registration ID!')

  // Check outboxes: Student A must be SYNCED, Student B must REMAIN PENDING!
  const { data: outboxA2 } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', appA.id).single()
  const { data: outboxB2 } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', appB.id).single()
  assert.equal(outboxA2.sync_status, 'SYNCED', 'Student A outbox is now SYNCED')
  assert.equal(outboxB2.sync_status, 'PENDING', 'Student B outbox remains PENDING (untouched by Student A)')
  console.log('✓ Cross-student attack thwarted: Student B outbox was NOT processed by Student A.\n')

  // Student B now legitimately syncs their own application
  console.log('Student B legitimately syncing own application...')
  const bSyncRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync/self`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginB.data.session!.access_token}` },
  })
  assert.equal(bSyncRes.status, 200)
  const bSyncJson = await bSyncRes.json()
  assert.equal(bSyncJson.registrationId, appB.registration_id)

  const { data: outboxB3 } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', appB.id).single()
  assert.equal(outboxB3.sync_status, 'SYNCED', 'Student B outbox is now SYNCED')
  console.log('✓ Student B successfully synced own application.\n')

  // Verify Student A and Student B cannot call global sync
  const aGlobal = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginA.data.session!.access_token}` },
  })
  assert.equal(aGlobal.status, 403, 'Student A denied global sync')

  const bGlobal = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginB.data.session!.access_token}` },
  })
  assert.equal(bGlobal.status, 403, 'Student B denied global sync')
  console.log('✓ Both students verified denied from global sync.\n')

  // Test 2.3: Service-role key supplied to self-sync endpoint is rejected
  console.log('TEST 2.3: Service-role key supplied to self-sync endpoint...')
  const serviceKeySelfRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync/self`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  })
  assert.equal(serviceKeySelfRes.status, 403, 'Service role key to self-sync must return 403')
  console.log('✓ TEST 2.3 PASSED: Service role key rejected on self-sync endpoint.\n')

  // -----------------------------------------------------------
  // PART 3: IOT-2026-00008 REGRESSION
  // -----------------------------------------------------------
  console.log('TEST 3: Checking IOT-2026-00008 authoritative state...')
  const { data: app8 } = await supabaseAdmin.from('membership_applications').select('*').eq('registration_id', 'IOT-2026-00008').single()
  assert.equal(app8.status, 'APPROVED', 'PostgreSQL application status remains APPROVED')

  const { data: profile8 } = await supabaseAdmin.from('profiles').select('*').eq('id', app8.user_id).single()
  assert.equal(profile8.membership_status, 'APPROVED', 'PostgreSQL profile status remains APPROVED')

  const adapter = createGoogleSheetsAdapterFromEnv()
  const row8Index = await adapter.findRowIndexByRegistrationId(SPREADSHEET_ID, SHEET_TAB, 'IOT-2026-00008')
  assert.ok(row8Index, 'IOT-2026-00008 exists in Sheet')
  const allRows = await adapter.getAllRows(SPREADSHEET_ID, SHEET_TAB)
  const row8 = allRows[row8Index - 1]

  assert.equal(row8[0], 'IOT-2026-00008')
  assert.equal(row8[22], 'APPROVED', 'Col W is APPROVED')
  assert.ok(row8[23], 'Col X is Submitted At')
  assert.ok(row8[24], 'Col Y is Reviewed At')
  assert.ok(row8[25], 'Col Z is Reviewed By')
  assert.ok(row8[26], 'Col AA is Review Notes')
  assert.ok(row8[27], 'Col AB is Last Synced At')
  console.log('✓ TEST 3 PASSED: IOT-2026-00008 remains APPROVED in PostgreSQL and Sheet Row 5.\n')

  // Cleanup test users
  await cleanupUser(testStudentEmail)
  await cleanupUser(testTeacherEmail)
  await cleanupUser(testSuperAdminEmail)

  console.log('========================================================')
  console.log('ALL PHASE 08.4 TESTS PASSED!')
  console.log('========================================================')
}

runPhase084Tests().catch((err) => {
  console.error('Phase 08.4 test execution failed:', err)
  process.exit(1)
})
