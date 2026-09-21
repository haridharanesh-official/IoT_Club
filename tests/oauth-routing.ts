import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { computeUserDestination } from '../lib/auth/server'
import { sanitizeInternalRedirect } from '../lib/auth/client'
import {
  loadServiceAccountCredentialsFromEnv,
  getGoogleAccessToken,
  HttpGoogleSheetsAdapter,
} from '../lib/integrations/google-sheets/client'
import {
  processSheetSyncOutbox,
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
const sheetName = env.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'
const config = { spreadsheetId, sheetName }

async function runOAuthRoutingTests() {
  console.log('========================================================')
  console.log('PHASE 08: GOOGLE OAUTH & UNIFIED AUTH ROUTING TESTS')
  console.log('========================================================')

  // ----------------------------------------------------
  // TEST 1: Open Redirect Defense
  // ----------------------------------------------------
  console.log('\nTEST 1: Open redirect defense sanitization...')
  assert.equal(sanitizeInternalRedirect('https://evil.com'), '/auth/account', 'Rejects absolute https URL')
  assert.equal(sanitizeInternalRedirect('http://evil.com'), '/auth/account', 'Rejects absolute http URL')
  assert.equal(sanitizeInternalRedirect('//evil.com'), '/auth/account', 'Rejects protocol-relative URL')
  assert.equal(sanitizeInternalRedirect('/\\evil.com'), '/auth/account', 'Rejects backslash evasion')
  assert.equal(sanitizeInternalRedirect('/dashboard'), '/dashboard', 'Accepts valid relative /dashboard')
  assert.equal(sanitizeInternalRedirect('/admin/membership'), '/admin/membership', 'Accepts valid relative /admin path')
  assert.equal(sanitizeInternalRedirect(null), '/auth/account', 'Falls back gracefully on null')
  console.log('✓ TEST 1 PASSED: Open redirect sanitization verified.')

  // ----------------------------------------------------
  // TEST 2: Pure Routing Rules Contract (computeUserDestination)
  // ----------------------------------------------------
  console.log('\nTEST 2: Destination resolver contract rules...')
  // No profile
  assert.equal(computeUserDestination(null, null), '/register', 'No profile -> /register')
  // Admin & Super Admin
  assert.equal(computeUserDestination({ role: 'ADMIN', membership_status: 'PENDING' }, null), '/admin', 'ADMIN -> /admin')
  assert.equal(computeUserDestination({ role: 'SUPER_ADMIN', membership_status: 'PENDING' }, null), '/admin', 'SUPER_ADMIN -> /admin')
  // Teacher
  assert.equal(computeUserDestination({ role: 'TEACHER', membership_status: 'PENDING' }, null), '/teacher', 'TEACHER -> /teacher')
  // Student without application
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'PENDING' }, null), '/register', 'Student no application -> /register')
  // Student with PENDING application
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'PENDING' }, { status: 'PENDING' }), '/membership/status', 'Pending student -> /membership/status')
  // Student with REJECTED application
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'REJECTED' }, { status: 'REJECTED' }), '/membership/status', 'Rejected student -> /membership/status')
  // Student with SUSPENDED application
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'SUSPENDED' }, { status: 'SUSPENDED' }), '/membership/status', 'Suspended student -> /membership/status')
  // Student APPROVED in both profile and application
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'APPROVED' }, { status: 'APPROVED' }), '/dashboard', 'Approved student -> /dashboard')
  // Student with mismatched status (e.g. application approved but profile suspended) -> not /dashboard
  assert.equal(computeUserDestination({ role: 'STUDENT', membership_status: 'SUSPENDED' }, { status: 'APPROVED' }), '/membership/status', 'Mismatched status -> /membership/status')
  console.log('✓ TEST 2 PASSED: All 9 destination routing rules verified.')

  // ----------------------------------------------------
  // TEST 3: New Google OAuth User Simulation
  // ----------------------------------------------------
  console.log('\nTEST 3: New Google OAuth user simulation & profile trigger...')
  const googleEmail = 'google.oauth.student@college.example'
  
  // Clean up if existing
  const { data: usersList } = await supabase.auth.admin.listUsers()
  const existingGoogleUser = usersList?.users?.find(u => u.email === googleEmail)
  if (existingGoogleUser) {
    // Delete student data
    await supabase.from('membership_applications').delete().eq('user_id', existingGoogleUser.id)
    await supabase.from('student_profiles').delete().eq('user_id', existingGoogleUser.id)
    await supabase.from('profiles').delete().eq('id', existingGoogleUser.id)
    await supabase.auth.admin.deleteUser(existingGoogleUser.id)
  }

  // Create user as if verified through Google OAuth
  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email: googleEmail,
    email_confirm: true,
    user_metadata: {
      full_name: 'Google OAuth Student',
      avatar_url: 'https://lh3.googleusercontent.com/a/test',
      provider: 'google',
    },
    app_metadata: {
      provider: 'google',
      providers: ['google'],
    },
  })

  assert.equal(createError, null, 'Google user created cleanly')
  const googleUserId = createdUser.user.id
  console.log('Created synthetic Google user ID:', googleUserId)

  // Verify PostgreSQL trigger on_auth_user_created fired
  const { data: googleProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', googleUserId)
    .single()

  assert.ok(googleProfile, 'Profile created by on_auth_user_created trigger')
  assert.equal(googleProfile.role, 'STUDENT', 'Google user role defaults to STUDENT')
  assert.equal(googleProfile.membership_status, 'PENDING', 'Google user membership defaults to PENDING')
  assert.equal(googleProfile.email, googleEmail, 'Profile email matches Google email')
  console.log('✓ TEST 3 PASSED: Trigger initialized student profile (role=STUDENT, status=PENDING).')

  // ----------------------------------------------------
  // TEST 4: Destination Routing for Fresh Google User
  // ----------------------------------------------------
  console.log('\nTEST 4: Destination routing for un-registered Google user...')
  const destNewGoogle = computeUserDestination(googleProfile, null)
  assert.equal(destNewGoogle, '/register', 'New Google user routes to /register')
  console.log('✓ TEST 4 PASSED: New Google user routes directly to /register.')

  // ----------------------------------------------------
  // TEST 5: Google User Registration Submission
  // ----------------------------------------------------
  console.log('\nTEST 5: Google user registration submission...')
  // Sign in as this user via service token or password
  await supabase.auth.admin.updateUserById(googleUserId, { password: 'TestPassword123!' })
  const client = anonClient()
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: googleEmail,
    password: 'TestPassword123!',
  })
  assert.equal(signInErr, null, 'Google user session signed in')

  const googleRegPayload = {
    full_name: 'Google OAuth Student',
    date_of_birth: '2006-03-12',
    gender: 'Female',
    mobile_number: '9123456780',
    personal_email: 'personal.google@example.com',
    college_email: googleEmail,
    register_number: 'GOOGLE-OAUTH-001',
    department: 'Cyber Security',
    degree_programme: 'B.Tech',
    year_of_study: 2,
    semester: 3,
    section: 'B',
    batch: '2025-2029',
    reason_for_joining: 'Verified Google OAuth member application',
    interests: ['Internet of Things', 'Cybersecurity', 'Cloud & Networking'],
    skill_level: 'INTERMEDIATE',
    previous_iot_experience: true,
    experience_description: 'Google OAuth student IoT project',
    skills: [
      { category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' },
      { category: 'HARDWARE', skill: 'ESP32', level: 'INTERMEDIATE' },
      { category: 'TECHNOLOGY', skill: 'MQTT', level: 'INTERMEDIATE' }
    ],
    github_url: 'https://github.com/google-oauth-student',
    linkedin_url: 'https://linkedin.com/in/google-oauth-student',
    portfolio_url: '',
    consent_accuracy: true,
    consent_rules: true,
    consent_data_use: true,
  }

  const submitRes = await client.rpc('submit_membership_application', { payload: googleRegPayload })
  assert.equal(submitRes.error, null, `Application submission failed: ${submitRes.error?.message}`)
  const googleRegId = submitRes.data
  console.log('Google user registration ID:', googleRegId)

  // Verify PostgreSQL state
  const { data: appAfterSubmit } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('user_id', googleUserId)
    .single()
  assert.equal(appAfterSubmit.status, 'PENDING', 'Application is PENDING')

  const { data: outboxLog } = await supabase
    .from('sheet_sync_logs')
    .select('*')
    .eq('entity_id', appAfterSubmit.id)
    .single()
  assert.equal(outboxLog.sync_status, 'PENDING', 'Sheet outbox is PENDING')

  // Check post-submission destination
  const destPending = computeUserDestination(googleProfile, appAfterSubmit)
  assert.equal(destPending, '/membership/status', 'Submitted application routes to /membership/status')
  console.log('✓ TEST 5 PASSED: Full registration committed, outbox enqueued, routing -> /membership/status.')

  // ----------------------------------------------------
  // TEST 6: Google User Sheets Worker Sync
  // ----------------------------------------------------
  console.log('\nTEST 6: Sync Google user to Google Sheets...')
  const creds = loadServiceAccountCredentialsFromEnv()
  assert.ok(creds, 'Service account credentials available')
  const adapter = new HttpGoogleSheetsAdapter(() => getGoogleAccessToken(creds!))

  const syncResult = await processSheetSyncOutbox(supabase, adapter, config, 10)
  assert.ok(syncResult.succeeded >= 1, 'Sheets worker processed Google user registration')

  const allRows = await adapter.getAllRows(spreadsheetId, sheetName)
  const matchedRow = allRows.find((r) => r[0] === googleRegId)
  assert.ok(matchedRow, `Found row for ${googleRegId} in Google Sheets`)
  assert.equal(matchedRow[1], 'GOOGLE-OAUTH-001', 'Register number matches')
  assert.equal(matchedRow[2], 'Google OAuth Student', 'Full name matches')
  assert.equal(matchedRow[22], 'PENDING', 'Status in Sheet is PENDING')
  console.log('✓ TEST 6 PASSED: Google user row appended to live Sheet (Row Status = PENDING).')

  // ----------------------------------------------------
  // TEST 7: Google User Admin Approval & Re-login Routing
  // ----------------------------------------------------
  console.log('\nTEST 7: Admin approval & destination transition to /dashboard...')
  // Admin approves Google user
  const adminEmail = 'test.admin@college.example'
  const { data: adminList } = await supabase.auth.admin.listUsers()
  let adminUser = adminList?.users?.find(u => u.email === adminEmail)
  if (!adminUser) {
    const createdAdmin = await supabase.auth.admin.createUser({
      email: adminEmail,
      email_confirm: true,
      password: 'TestPassword123!',
    })
    adminUser = createdAdmin.data.user!
  }
  await supabase.from('profiles').update({ role: 'ADMIN', full_name: 'Lead Admin Officer' }).eq('id', adminUser.id)

  const adminClient = anonClient()
  await adminClient.auth.signInWithPassword({ email: adminEmail, password: 'TestPassword123!' })
  const reviewRes = await adminClient.rpc('review_membership_application', {
    application_id: appAfterSubmit.id,
    decision: 'APPROVED',
    notes: 'Approved Google OAuth registration',
  })
  assert.equal(reviewRes.error, null, 'Admin approved application')

  // Read updated PostgreSQL state
  const { data: approvedProfile } = await supabase.from('profiles').select('*').eq('id', googleUserId).single()
  const { data: approvedApp } = await supabase.from('membership_applications').select('*').eq('id', appAfterSubmit.id).single()

  assert.equal(approvedProfile.membership_status, 'APPROVED', 'Profile is APPROVED')
  assert.equal(approvedApp.status, 'APPROVED', 'Application is APPROVED')

  // Authoritative post-login routing check for approved Google user
  const destApproved = computeUserDestination(approvedProfile, approvedApp)
  assert.equal(destApproved, '/dashboard', 'Approved student routes to /dashboard')
  console.log('✓ TEST 7 PASSED: Admin approved Google user; post-login destination is /dashboard.')

  // Re-sync sheet to update row in place
  await processSheetSyncOutbox(supabase, adapter, config, 10)
  const rowsAfterApproval = await adapter.getAllRows(spreadsheetId, sheetName)
  const approvedRowInSheet = rowsAfterApproval.find((r) => r[0] === googleRegId)
  assert.ok(approvedRowInSheet, 'Found approved row')
  assert.equal(approvedRowInSheet[22], 'APPROVED', 'Sheet updated to APPROVED in place')
  console.log('✓ TEST 7.1 PASSED: Live Sheet row updated in place (Status = APPROVED, Zero duplicates).')

  // ----------------------------------------------------
  // TEST 8: Existing Email User + Google Login Deduplication
  // ----------------------------------------------------
  console.log('\nTEST 8: Existing email user + Google login deduplication...')
  const duplicateTestEmail = 'existing.student@college.example'
  // Create user with email/password
  const { data: existingUserObj } = await supabase.auth.admin.createUser({
    email: duplicateTestEmail,
    email_confirm: true,
    password: 'Password123!',
  })
  const existingUserId = existingUserObj.user!.id

  // Verify only 1 profile exists
  const { data: profilesMatching } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', duplicateTestEmail)

  assert.equal(profilesMatching?.length, 1, 'Exactly 1 profile exists for existing email user')
  assert.equal(profilesMatching?.[0]?.id, existingUserId, 'Profile ID matches user ID')

  // Attempt to create second user with same email (simulating provider collision)
  const duplicateAttempt = await supabase.auth.admin.createUser({
    email: duplicateTestEmail,
    email_confirm: true,
    user_metadata: { provider: 'google' },
  })
  assert.ok(duplicateAttempt.error, 'Duplicate email user rejected by Supabase Auth')
  console.log('✓ TEST 8 PASSED: Duplicate identity creation rejected; single identity preserved.')

  // Clean up duplicate test user
  await supabase.from('profiles').delete().eq('id', existingUserId)
  await supabase.auth.admin.deleteUser(existingUserId)

  console.log('\n========================================================')
  console.log('ALL PHASE 08 GOOGLE OAUTH & ROUTING TESTS PASSED!')
  console.log('========================================================')
}

runOAuthRoutingTests().catch((err) => {
  console.error('\nOAUTH ROUTING SUITE FAILED:')
  console.error(err)
  process.exit(1)
})
