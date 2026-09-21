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

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const BASE_URL = 'http://localhost:3000'

async function runHardeningTests() {
  console.log('========================================================')
  console.log('PHASE 08.3 — FINAL AUTH / SHEETS HARDENING TEST SUITE')
  console.log('========================================================\n')

  // Cleanup helper for test accounts
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
  // TEST 1: Anonymous POST global sync -> 401
  // -----------------------------------------------------------
  console.log('TEST 1: Anonymous POST global sync...')
  const anonRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, { method: 'POST' })
  assert.equal(anonRes.status, 401, 'Anonymous request must return 401')
  const anonJson = await anonRes.json()
  assert.equal(anonJson.ok, false, 'Anonymous response indicates failure')
  console.log('✓ TEST 1 PASSED: Anonymous request returned 401 Unauthorized.\n')

  // -----------------------------------------------------------
  // TEST 2: Invalid internal secret -> 403
  // -----------------------------------------------------------
  console.log('TEST 2: Invalid internal secret header...')
  const badSecretRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { 'x-internal-secret': 'definitely-invalid-secret' },
  })
  assert.equal(badSecretRes.status, 403, 'Invalid internal secret must return 403')
  const badSecretJson = await badSecretRes.json()
  assert.equal(badSecretJson.ok, false, 'Invalid secret rejected')
  console.log('✓ TEST 2 PASSED: Invalid internal secret denied with 403 Forbidden.\n')

  // -----------------------------------------------------------
  // TEST 3: Valid internal secret -> 200 allowed
  // -----------------------------------------------------------
  console.log('TEST 3: Valid internal server secret...')
  const goodSecretRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { 'x-internal-secret': SERVICE_KEY },
  })
  assert.equal(goodSecretRes.status, 200, 'Valid internal secret must return 200')
  const goodSecretJson = await goodSecretRes.json()
  assert.equal(goodSecretJson.ok, true, 'Valid secret accepted')
  console.log('✓ TEST 3 PASSED: Valid internal secret allowed with 200 OK.\n')

  // -----------------------------------------------------------
  // TEST 4: STUDENT POST global sync -> 403 Forbidden
  // -----------------------------------------------------------
  console.log('TEST 4: STUDENT session POST global sync...')
  const studentEmail = 'hardening.student@college.example'
  await cleanupUser(studentEmail)

  const { data: studentUser } = await supabaseAdmin.auth.admin.createUser({
    email: studentEmail,
    email_confirm: true,
    password: 'TestPassword123!',
  })
  await supabaseAdmin.from('profiles').update({ full_name: 'Hardening Student', role: 'STUDENT' }).eq('id', studentUser.user!.id)

  const studentClient = createClient(SUPABASE_URL, ANON_KEY)
  const studentLogin = await studentClient.auth.signInWithPassword({
    email: studentEmail,
    password: 'TestPassword123!',
  })
  assert.ok(studentLogin.data.session, 'Student logged in')

  const studentGlobalRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentLogin.data.session!.access_token}` },
  })
  assert.equal(studentGlobalRes.status, 403, 'STUDENT calling global sync must return 403')
  const studentGlobalJson = await studentGlobalRes.json()
  assert.equal(studentGlobalJson.ok, false, 'STUDENT denied global sync')
  console.log('✓ TEST 4 PASSED: STUDENT caller denied global sync with 403 Forbidden.\n')

  // -----------------------------------------------------------
  // TEST 5: TEACHER POST global sync -> 403 Forbidden
  // -----------------------------------------------------------
  console.log('TEST 5: TEACHER session POST global sync...')
  const teacherEmail = 'hardening.teacher@college.example'
  await cleanupUser(teacherEmail)

  const { data: teacherUser } = await supabaseAdmin.auth.admin.createUser({
    email: teacherEmail,
    email_confirm: true,
    password: 'TestPassword123!',
  })
  await supabaseAdmin.from('profiles').update({ full_name: 'Hardening Teacher', role: 'TEACHER' }).eq('id', teacherUser.user!.id)

  const teacherClient = createClient(SUPABASE_URL, ANON_KEY)
  const teacherLogin = await teacherClient.auth.signInWithPassword({
    email: teacherEmail,
    password: 'TestPassword123!',
  })
  assert.ok(teacherLogin.data.session, 'Teacher logged in')

  const teacherGlobalRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherLogin.data.session!.access_token}` },
  })
  assert.equal(teacherGlobalRes.status, 403, 'TEACHER calling global sync must return 403')
  const teacherGlobalJson = await teacherGlobalRes.json()
  assert.equal(teacherGlobalJson.ok, false, 'TEACHER denied global sync')
  console.log('✓ TEST 5 PASSED: TEACHER caller denied global sync with 403 Forbidden.\n')

  // -----------------------------------------------------------
  // TEST 6: ADMIN POST global sync -> 200 Allowed
  // -----------------------------------------------------------
  console.log('TEST 6: ADMIN session POST global sync...')
  const adminClient = createClient(SUPABASE_URL, ANON_KEY)
  const adminLogin = await adminClient.auth.signInWithPassword({
    email: 'test.admin@college.example',
    password: 'TestPassword123!',
  })
  assert.ok(adminLogin.data.session, 'Admin logged in')

  const adminGlobalRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminLogin.data.session!.access_token}` },
  })
  assert.equal(adminGlobalRes.status, 200, 'ADMIN calling global sync must return 200')
  const adminGlobalJson = await adminGlobalRes.json()
  assert.equal(adminGlobalJson.ok, true, 'ADMIN allowed global sync')
  console.log('✓ TEST 6 PASSED: ADMIN caller allowed global sync with 200 OK.\n')

  // -----------------------------------------------------------
  // TEST 7: SUPER_ADMIN POST global sync -> 200 Allowed
  // -----------------------------------------------------------
  console.log('TEST 7: SUPER_ADMIN session POST global sync...')
  const superAdminEmail = 'hardening.superadmin@college.example'
  await cleanupUser(superAdminEmail)

  const { data: superAdminUser } = await supabaseAdmin.auth.admin.createUser({
    email: superAdminEmail,
    email_confirm: true,
    password: 'TestPassword123!',
  })
  await supabaseAdmin.from('profiles').update({ full_name: 'Hardening SuperAdmin', role: 'SUPER_ADMIN' }).eq('id', superAdminUser.user!.id)

  const superAdminClient = createClient(SUPABASE_URL, ANON_KEY)
  const superAdminLogin = await superAdminClient.auth.signInWithPassword({
    email: superAdminEmail,
    password: 'TestPassword123!',
  })
  assert.ok(superAdminLogin.data.session, 'Super Admin logged in')

  const superAdminGlobalRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminLogin.data.session!.access_token}` },
  })
  assert.equal(superAdminGlobalRes.status, 200, 'SUPER_ADMIN calling global sync must return 200')
  const superAdminGlobalJson = await superAdminGlobalRes.json()
  assert.equal(superAdminGlobalJson.ok, true, 'SUPER_ADMIN allowed global sync')
  console.log('✓ TEST 7 PASSED: SUPER_ADMIN caller allowed global sync with 200 OK.\n')

  // -----------------------------------------------------------
  // TEST 8: Fresh Student Registration & Scoped Self Auto-Sync
  // -----------------------------------------------------------
  console.log('TEST 8: Fresh Student Registration & Scoped Auto-Sync...')
  const freshStudentEmail = `fresh.student.${Date.now()}@college.example`
  const { data: freshUser } = await supabaseAdmin.auth.admin.createUser({
    email: freshStudentEmail,
    email_confirm: true,
    password: 'TestPassword123!',
  })
  const freshUserId = freshUser.user!.id
  await supabaseAdmin.from('profiles').update({ full_name: 'Fresh Hardening Student', role: 'STUDENT' }).eq('id', freshUserId)

  const freshClient = createClient(SUPABASE_URL, ANON_KEY)
  const freshLogin = await freshClient.auth.signInWithPassword({
    email: freshStudentEmail,
    password: 'TestPassword123!',
  })
  assert.ok(freshLogin.data.session, 'Fresh student logged in')

  const regNum = `REG-${Date.now().toString().slice(-6)}`
  const freshPayload = {
    full_name: 'Fresh Hardening Student',
    date_of_birth: '2005-04-12',
    gender: 'Female',
    mobile_number: '9123456780',
    personal_email: freshStudentEmail,
    college_email: freshStudentEmail,
    register_number: regNum,
    department: 'ECE',
    degree_programme: 'B.E.',
    year_of_study: 2,
    semester: 4,
    section: 'B',
    batch: '2025-2029',
    reason_for_joining: 'Verification of hardened self-sync flow',
    interests: ['Internet of Things', 'Embedded Systems'],
    skill_level: 'INTERMEDIATE',
    previous_iot_experience: true,
    experience_description: 'Worked on STM32 microcontrollers and FreeRTOS',
    skills: [
      { category: 'PROGRAMMING', skill: 'C', level: 'INTERMEDIATE' },
      { category: 'HARDWARE', skill: 'STM32', level: 'INTERMEDIATE' },
    ],
    github_url: 'https://github.com/fresh-student',
    linkedin_url: 'https://linkedin.com/in/fresh-student',
    portfolio_url: 'https://fresh.example.com',
    consent_accuracy: true,
    consent_rules: true,
    consent_data_use: true,
  }

  // Submit application via RPC
  const regSubmitRes = await freshClient.rpc('submit_membership_application', { payload: freshPayload })
  assert.equal(regSubmitRes.error, null, `Fresh registration RPC succeeded: ${regSubmitRes.error?.message}`)

  const { data: freshApp } = await supabaseAdmin.from('membership_applications').select('*').eq('user_id', freshUserId).single()
  assert.ok(freshApp, 'Application record created')
  assert.ok(freshApp.registration_id, 'Registration ID generated')
  console.log(`Generated Registration ID: ${freshApp.registration_id}`)

  // Verify outbox created
  const { data: freshOutbox } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', freshApp.id).single()
  assert.ok(freshOutbox, 'Outbox record created by trigger')
  assert.equal(freshOutbox.sync_status, 'PENDING', 'Initial outbox status is PENDING')

  // Verify Student CANNOT call global drain
  const freshForbiddenGlobalRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${freshLogin.data.session!.access_token}` },
  })
  assert.equal(freshForbiddenGlobalRes.status, 403, 'Fresh student denied global sync')
  console.log('✓ Student denied access to global drain endpoint (403 Forbidden confirmed)')

  // Student calls scoped self-sync endpoint
  console.log('Calling scoped self-sync endpoint: POST /api/internal/google-sheets/sync/self...')
  const selfSyncRes = await fetch(`${BASE_URL}/api/internal/google-sheets/sync/self`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${freshLogin.data.session!.access_token}` },
  })
  assert.equal(selfSyncRes.status, 200, 'Self sync endpoint returns 200')
  const selfSyncJson = await selfSyncRes.json()
  assert.equal(selfSyncJson.ok, true, 'Self sync succeeded')
  assert.equal(selfSyncJson.synced, true, 'Application synced to Google Sheets')
  console.log('✓ Self-sync endpoint executed successfully:', selfSyncJson)

  // Verify outbox is now SYNCED
  const { data: freshOutboxSynced } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', freshApp.id).single()
  assert.equal(freshOutboxSynced.sync_status, 'SYNCED', 'Outbox transitioned to SYNCED')

  // Verify row in Google Sheet
  const adapter = createGoogleSheetsAdapterFromEnv()
  const freshRowIndex = await adapter.findRowIndexByRegistrationId(SPREADSHEET_ID, SHEET_TAB, freshApp.registration_id)
  assert.ok(freshRowIndex, 'Row must exist in Google Sheet')
  const allRows = await adapter.getAllRows(SPREADSHEET_ID, SHEET_TAB)
  const freshRow = allRows[freshRowIndex - 1]

  console.log(`Fresh Student Sheet Row ${freshRowIndex}:`)
  console.log('- Col A  [Registration ID]:  ', freshRow[0])
  console.log('- Col B  [Register Number]:  ', freshRow[1])
  console.log('- Col C  [Full Name]:        ', freshRow[2])
  console.log('- Col W  [Membership Status]:', freshRow[22])
  console.log('- Col X  [Submitted At]:     ', freshRow[23])
  console.log('- Col Y  [Reviewed At]:      ', freshRow[24])
  console.log('- Col Z  [Reviewed By]:      ', freshRow[25])
  console.log('- Col AA [Review Notes]:     ', freshRow[26])
  console.log('- Col AB [Last Synced At]:   ', freshRow[27])

  assert.equal(freshRow[0], freshApp.registration_id, 'Col A matches registration_id')
  assert.equal(freshRow[22], 'PENDING', 'Col W is Membership Status (PENDING)')
  assert.ok(freshRow[23], 'Col X is Submitted At (populated)')
  assert.equal(freshRow[24] || '', '', 'Col Y is Reviewed At (empty before review)')
  assert.equal(freshRow[25] || '', '', 'Col Z is Reviewed By (empty before review)')
  assert.equal(freshRow[26] || '', '', 'Col AA is Review Notes (empty before review)')
  assert.ok(freshRow[27], 'Col AB is Last Synced At (populated)')
  console.log('✓ TEST 8 PASSED: Fresh student registration and scoped auto-sync verified in Google Sheets.\n')

  // -----------------------------------------------------------
  // TEST 9: Authoritative check on IOT-2026-00008
  // -----------------------------------------------------------
  console.log('TEST 9: Verifying IOT-2026-00008 regression state...')
  const { data: app8 } = await supabaseAdmin.from('membership_applications').select('*').eq('registration_id', 'IOT-2026-00008').single()
  assert.ok(app8, 'IOT-2026-00008 exists')
  assert.equal(app8.status, 'APPROVED', 'PostgreSQL application status remains APPROVED')

  const { data: profile8 } = await supabaseAdmin.from('profiles').select('*').eq('id', app8.user_id).single()
  assert.equal(profile8.membership_status, 'APPROVED', 'PostgreSQL profile status remains APPROVED')

  const row8Index = await adapter.findRowIndexByRegistrationId(SPREADSHEET_ID, SHEET_TAB, 'IOT-2026-00008')
  assert.ok(row8Index, 'IOT-2026-00008 exists in Google Sheet')
  const sheetRows = await adapter.getAllRows(SPREADSHEET_ID, SHEET_TAB)
  const row8 = sheetRows[row8Index - 1]

  console.log(`IOT-2026-00008 Sheet Row ${row8Index}:`)
  console.log('- Col A  [Registration ID]:  ', row8[0])
  console.log('- Col C  [Full Name]:        ', row8[2])
  console.log('- Col W  [Membership Status]:', row8[22])
  console.log('- Col X  [Submitted At]:     ', row8[23])
  console.log('- Col Y  [Reviewed At]:      ', row8[24])
  console.log('- Col Z  [Reviewed By]:      ', row8[25])
  console.log('- Col AA [Review Notes]:     ', row8[26])
  console.log('- Col AB [Last Synced At]:   ', row8[27])

  assert.equal(row8[0], 'IOT-2026-00008')
  assert.equal(row8[22], 'APPROVED', 'Column W must be APPROVED')
  assert.ok(row8[23], 'Column X must be Submitted At')
  assert.ok(row8[24], 'Column Y must be Reviewed At')
  assert.ok(row8[25], 'Column Z must be Reviewed By')
  assert.ok(row8[26], 'Column AA must be Review Notes')
  assert.ok(row8[27], 'Column AB must be Last Synced At')
  console.log('✓ TEST 9 PASSED: IOT-2026-00008 authoritative state and sheet row confirmed intact.\n')

  // Cleanup test accounts
  await cleanupUser(studentEmail)
  await cleanupUser(teacherEmail)
  await cleanupUser(superAdminEmail)

  console.log('========================================================')
  console.log('ALL PHASE 08.3 HARDENING TESTS PASSED!')
  console.log('========================================================')
}

runHardeningTests().catch((err) => {
  console.error('Hardening test execution failed:', err)
  process.exit(1)
})
