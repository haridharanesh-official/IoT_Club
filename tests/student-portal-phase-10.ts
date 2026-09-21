import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  getStudentDashboardData,
  getPublicMemberProfile,
} from '../lib/student/dashboard'
import { computeUserDestination } from '../lib/auth/server'

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

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function runStudentPortalTests() {
  console.log('========================================================')
  console.log('PHASE 10: REAL STUDENT PORTAL CORE TEST SUITE')
  console.log('========================================================\n')

  // Helper to clean up synthetic test users
  async function cleanupUser(email: string) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = data?.users?.find((u) => u.email === email)
    if (user) {
      await supabaseAdmin.from('notifications').delete().eq('user_id', user.id)
      await supabaseAdmin.from('event_registrations').delete().eq('student_id', user.id)
      await supabaseAdmin.from('student_progress').delete().eq('student_id', user.id)
      await supabaseAdmin.from('project_members').delete().eq('student_id', user.id)
      await supabaseAdmin.from('projects').delete().eq('owner_id', user.id)
      await supabaseAdmin.from('audit_logs').delete().eq('actor_user_id', user.id)
      const { data: app } = await supabaseAdmin.from('membership_applications').select('id').eq('user_id', user.id).maybeSingle()
      if (app) {
        await supabaseAdmin.from('sheet_sync_logs').delete().eq('entity_id', app.id)
      }
      await supabaseAdmin.from('membership_applications').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_interests').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_skills').delete().eq('user_id', user.id)
      await supabaseAdmin.from('student_profiles').delete().eq('user_id', user.id)
      await supabaseAdmin.from('profiles').delete().eq('id', user.id)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
  }

  // -----------------------------------------------------------
  // TEST 1: Destination Routing & Access Control
  // -----------------------------------------------------------
  console.log('TEST 1: Destination routing & access control across membership states...')
  
  // 1A. PENDING Student
  const pendingDest = computeUserDestination(
    { role: 'STUDENT', membership_status: 'PENDING' },
    { status: 'PENDING' }
  )
  assert.equal(pendingDest, '/membership/status', 'PENDING student must route to /membership/status')

  // 1B. REJECTED Student
  const rejectedDest = computeUserDestination(
    { role: 'STUDENT', membership_status: 'REJECTED' },
    { status: 'REJECTED' }
  )
  assert.equal(rejectedDest, '/membership/status', 'REJECTED student must route to /membership/status')

  // 1C. SUSPENDED Student
  const suspendedDest = computeUserDestination(
    { role: 'STUDENT', membership_status: 'SUSPENDED' },
    { status: 'SUSPENDED' }
  )
  assert.equal(suspendedDest, '/membership/status', 'SUSPENDED student must route to /membership/status')

  // 1D. APPROVED Student
  const approvedDest = computeUserDestination(
    { role: 'STUDENT', membership_status: 'APPROVED' },
    { status: 'APPROVED' }
  )
  assert.equal(approvedDest, '/dashboard', 'APPROVED student must route directly to /dashboard')

  console.log('✓ TEST 1 PASSED: Authoritative routing correctly guards /dashboard.\n')

  // -----------------------------------------------------------
  // TEST 2: Authoritative Dashboard Data Hydration
  // -----------------------------------------------------------
  console.log('TEST 2: Hydrating real dashboard data for seeded approved student...')
  const APPROVED_USER_ID = 'c4a6963f-48e4-4f99-8ceb-1d15030a1974'

  const dashboardData = await getStudentDashboardData(APPROVED_USER_ID, supabaseAdmin)
  assert.ok(dashboardData, 'Dashboard data must not be null')
  
  const { profile, skills, interests, application, metrics } = dashboardData
  assert.equal(profile.fullName, 'Approved Test Student', 'Full name must match database')
  assert.equal(profile.registerNumber, 'TEST-IOT-00008', 'Register number must match database')
  assert.equal(profile.registrationId, 'IOT-2026-00008', 'Registration ID must match database')
  assert.equal(profile.department, 'Cyber Security', 'Department must match database')
  assert.equal(profile.role, 'STUDENT', 'Role must be STUDENT')
  assert.equal(profile.membershipStatus, 'APPROVED', 'Status must be APPROVED')
  assert.equal(profile.username, 'approved-member', 'Username must be approved-member')
  assert.ok(profile.headline, 'Headline must be populated')

  // Verify skills
  assert.ok(skills.length >= 4, `Expected at least 4 skills, found ${skills.length}`)
  const skillNames = skills.map((s) => s.skill)
  assert.ok(skillNames.includes('C++'), 'Must include C++')
  assert.ok(skillNames.includes('Python'), 'Must include Python')
  assert.ok(skillNames.includes('ESP32'), 'Must include ESP32')
  assert.ok(skillNames.includes('MQTT'), 'Must include MQTT')

  // Verify interests
  assert.ok(interests.length >= 3, `Expected at least 3 interests, found ${interests.length}`)
  assert.ok(interests.includes('Internet of Things'), 'Must include Internet of Things')

  // Verify application summary
  assert.ok(application, 'Application must be present')
  assert.equal(application?.status, 'APPROVED', 'Application status must be APPROVED')

  // Verify metrics
  assert.equal(typeof metrics.projectsCount, 'number')
  assert.equal(typeof metrics.coursesCount, 'number')
  assert.equal(typeof metrics.certificationsCount, 'number')
  assert.equal(typeof metrics.eventsCount, 'number')

  console.log(`✓ TEST 2 PASSED: Real data hydrated from PostgreSQL (${skills.length} skills, ${interests.length} interests).\n`)

  // -----------------------------------------------------------
  // TEST 3: Edit Student Profile via RPC (update_student_profile)
  // -----------------------------------------------------------
  console.log('TEST 3: Authenticated student updates profile links and bio via RPC...')

  // Create an authenticated client for the approved student
  const studentClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  })

  const { data: authSession, error: signInErr } = await studentClient.auth.signInWithPassword({
    email: 'approved.student@college.example',
    password: 'TestPassword123!',
  })
  assert.ifError(signInErr)
  assert.ok(authSession.user, 'Student must be authenticated')

  const updatedHeadline = 'Senior Embedded Systems Engineer | RTOS & Firmware'
  const updatedBio = 'Developing distributed IoT telemetry pipelines on ESP32 and FreeRTOS with mutual TLS.'
  const updatedGithub = 'https://github.com/approved-student-v2'
  const updatedLinkedin = 'https://linkedin.com/in/approved-student-v2'
  const updatedPortfolio = 'https://portfolio.approved-student.example.com'

  const { data: rpcRes, error: rpcErr } = await studentClient.rpc('update_student_profile', {
    p_headline: updatedHeadline,
    p_bio: updatedBio,
    p_github_url: updatedGithub,
    p_linkedin_url: updatedLinkedin,
    p_portfolio_url: updatedPortfolio,
    p_username: 'approved-member',
  })

  assert.ifError(rpcErr)
  assert.equal(rpcRes.success, true, 'RPC must return success: true')
  assert.equal(rpcRes.headline, updatedHeadline, 'Headline must match updated value')
  assert.equal(rpcRes.bio, updatedBio, 'Bio must match updated value')
  assert.equal(rpcRes.github_url, updatedGithub, 'GitHub URL must match')
  assert.equal(rpcRes.linkedin_url, updatedLinkedin, 'LinkedIn URL must match')
  assert.equal(rpcRes.portfolio_url, updatedPortfolio, 'Portfolio URL must match')

  // Verify changes reflected in dashboard data
  const refreshedData = await getStudentDashboardData(APPROVED_USER_ID, studentClient)
  assert.equal(refreshedData?.profile.headline, updatedHeadline, 'Dashboard must reflect updated headline')
  assert.equal(refreshedData?.profile.bio, updatedBio, 'Dashboard must reflect updated bio')
  assert.equal(refreshedData?.profile.githubUrl, updatedGithub, 'Dashboard must reflect updated GitHub')

  console.log('✓ TEST 3 PASSED: Student profile updated and immediately verified via dashboard query.\n')

  // -----------------------------------------------------------
  // TEST 4: Academic Fields & Status Tamper Resistance
  // -----------------------------------------------------------
  console.log('TEST 4: Tamper resistance: verify academic fields and membership status cannot be modified...')

  // Attempt direct update on student_profiles using student's client
  const { data: directUpdateData, error: directUpdateErr } = await studentClient
    .from('student_profiles')
    .update({
      register_number: 'FORGED-ROLL-999',
      department: 'Hacked Department',
      year_of_study: 4,
    })
    .eq('user_id', APPROVED_USER_ID)
    .select()

  // RLS does not grant UPDATE on student_profiles to authenticated directly; update must be rejected or return 0 rows
  assert.ok(
    directUpdateErr !== null || (directUpdateData && directUpdateData.length === 0),
    'Direct client update on academic fields must be rejected by RLS'
  )

  // Verify that roll number is unchanged in database
  const { data: verifySp } = await supabaseAdmin
    .from('student_profiles')
    .select('register_number, department')
    .eq('user_id', APPROVED_USER_ID)
    .single()

  assert.ok(verifySp)
  assert.equal(verifySp.register_number, 'TEST-IOT-00008', 'Register number must remain tamper-proof')
  assert.equal(verifySp.department, 'Cyber Security', 'Department must remain tamper-proof')

  // Attempt direct update on profiles to elevate role or status
  const { data: profileUpdateData, error: profileUpdateErr } = await studentClient
    .from('profiles')
    .update({
      role: 'ADMIN',
      membership_status: 'APPROVED',
    })
    .eq('id', APPROVED_USER_ID)
    .select()

  assert.ok(
    profileUpdateErr !== null || (profileUpdateData && profileUpdateData.length === 0),
    'Direct client update on profiles table must be rejected by RLS'
  )

  const { data: verifyProfile } = await supabaseAdmin
    .from('profiles')
    .select('role, membership_status')
    .eq('id', APPROVED_USER_ID)
    .single()

  assert.ok(verifyProfile)
  assert.equal(verifyProfile.role, 'STUDENT', 'Role must remain STUDENT')
  assert.equal(verifyProfile.membership_status, 'APPROVED', 'Membership status must remain APPROVED')

  console.log('✓ TEST 4 PASSED: Direct RLS update bypass blocked; academic records and roles remain immutable.\n')

  // -----------------------------------------------------------
  // TEST 5: Input Validation via update_student_profile RPC
  // -----------------------------------------------------------
  console.log('TEST 5: Input validation enforcement on profile RPC...')

  // 5A. Invalid GitHub URL scheme
  const { error: invalidUrlErr } = await studentClient.rpc('update_student_profile', {
    p_github_url: 'javascript:alert(1)',
  })
  assert.ok(invalidUrlErr, 'Invalid URL scheme must be rejected')

  // 5B. Invalid Username format (special characters / spaces)
  const { error: invalidUsernameErr } = await studentClient.rpc('update_student_profile', {
    p_username: 'Invalid User!! Name',
  })
  assert.ok(invalidUsernameErr, 'Invalid username format must be rejected')

  console.log('✓ TEST 5 PASSED: Malformed URLs and invalid username formats safely rejected.\n')

  // -----------------------------------------------------------
  // TEST 6: Multi-Student Data Isolation
  // -----------------------------------------------------------
  console.log('TEST 6: Multi-student data isolation and cross-account protection...')
  const BOB_EMAIL = 'student.bob.phase10@college.example'
  await cleanupUser(BOB_EMAIL)

  // Create Student Bob
  const { data: bobAuth, error: bobCreateErr } = await supabaseAdmin.auth.admin.createUser({
    email: BOB_EMAIL,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { full_name: 'Student Bob' },
  })
  assert.ifError(bobCreateErr)
  const bobUserId = bobAuth.user.id

  await supabaseAdmin.from('profiles').update({
    full_name: 'Student Bob',
    role: 'STUDENT',
    membership_status: 'APPROVED',
  }).eq('id', bobUserId)

  await supabaseAdmin.from('student_profiles').insert({
    user_id: bobUserId,
    registration_id: 'IOT-2026-00088',
    register_number: 'TEST-BOB-00088',
    department: 'Information Technology',
    degree_programme: 'B.Tech',
    year_of_study: 1,
    semester: 1,
    section: 'B',
    batch: '2026-2030',
    username: 'student-bob',
    headline: 'First-year IoT Enthusiast',
  })

  // Sign in as Bob
  const bobClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  })
  const { error: bobSignInErr } = await bobClient.auth.signInWithPassword({
    email: BOB_EMAIL,
    password: 'TestPassword123!',
  })
  assert.ifError(bobSignInErr)

  // Bob updates his profile
  const { data: bobRpcRes, error: bobRpcErr } = await bobClient.rpc('update_student_profile', {
    p_headline: 'Bob Updated Headline',
  })
  assert.ifError(bobRpcErr)
  assert.equal(bobRpcRes.headline, 'Bob Updated Headline')

  // Verify Alice (Approved Test Student) was NOT modified
  const { data: aliceCheck } = await supabaseAdmin
    .from('student_profiles')
    .select('headline')
    .eq('user_id', APPROVED_USER_ID)
    .single()
  assert.ok(aliceCheck)
  assert.equal(aliceCheck.headline, updatedHeadline, "Alice's headline must not be affected by Bob's update")

  // Verify Bob cannot read Alice's student profile directly via RLS
  const { data: aliceFromBob, error: rlsReadErr } = await bobClient
    .from('student_profiles')
    .select('*')
    .eq('user_id', APPROVED_USER_ID)

  assert.ok(
    rlsReadErr !== null || !aliceFromBob || aliceFromBob.length === 0,
    'RLS must prevent Bob from querying Alice private student_profile directly'
  )

  console.log('✓ TEST 6 PASSED: Strict cross-student isolation verified under RLS.\n')

  // -----------------------------------------------------------
  // TEST 7: Public Member Profile Resolution (/member/[username])
  // -----------------------------------------------------------
  console.log('TEST 7: Public member profile resolution and privacy sanitization...')

  // 7A. Look up by username
  const pubByUsername = await getPublicMemberProfile('approved-member', supabaseAdmin)
  assert.ok(pubByUsername, 'Must find member by username')
  assert.equal(pubByUsername?.fullName, 'Approved Test Student')
  assert.equal(pubByUsername?.registerNumber, 'TEST-IOT-00008')
  assert.equal(pubByUsername?.department, 'Cyber Security')

  // 7B. Look up by register_number
  const pubByRoll = await getPublicMemberProfile('TEST-IOT-00008', supabaseAdmin)
  assert.ok(pubByRoll, 'Must find member by register_number')
  assert.equal(pubByRoll?.userId, APPROVED_USER_ID)

  // 7C. Look up by registration_id
  const pubByRegId = await getPublicMemberProfile('IOT-2026-00008', supabaseAdmin)
  assert.ok(pubByRegId, 'Must find member by registration_id')
  assert.equal(pubByRegId?.userId, APPROVED_USER_ID)

  // 7D. Verify privacy: No private PII is leaked in public profile
  const pubAny = pubByUsername as any
  assert.equal(pubAny.mobileNumber, undefined, 'mobileNumber must NOT be present in public profile')
  assert.equal(pubAny.personalEmail, undefined, 'personalEmail must NOT be present in public profile')
  assert.equal(pubAny.collegeEmail, undefined, 'collegeEmail must NOT be present in public profile')
  assert.equal(pubAny.dateOfBirth, undefined, 'dateOfBirth must NOT be present in public profile')

  // 7E. Non-existent username
  const pubNonExistent = await getPublicMemberProfile('non-existent-user-xyz-99', supabaseAdmin)
  assert.equal(pubNonExistent, null, 'Non-existent member must return null')

  // 7F. Non-approved student cannot be queried publicly
  const PENDING_REG_ID = 'IOT-2026-00010'
  const pubPending = await getPublicMemberProfile(PENDING_REG_ID, supabaseAdmin)
  assert.equal(pubPending, null, 'PENDING student must NOT be exposed on public member view')

  console.log('✓ TEST 7 PASSED: Public profile resolves flexibly by username/roll/regId with zero PII leakage.\n')

  // -----------------------------------------------------------
  // TEST 8: Graceful Empty / Zero-State Handling
  // -----------------------------------------------------------
  console.log('TEST 8: Zero-state handling for newly approved member with no projects or courses...')

  const bobDashboard = await getStudentDashboardData(bobUserId, bobClient)
  assert.ok(bobDashboard, 'Bob dashboard data must be non-null')
  assert.equal(bobDashboard?.projects.length, 0, 'Bob must have 0 projects')
  assert.equal(bobDashboard?.learningProgress.length, 0, 'Bob must have 0 learning progress')
  assert.equal(bobDashboard?.metrics.projectsCount, 0, 'metrics.projectsCount must be 0')
  assert.equal(bobDashboard?.metrics.coursesCount, 0, 'metrics.coursesCount must be 0')
  assert.equal(bobDashboard?.metrics.certificationsCount, 0, 'metrics.certificationsCount must be 0')

  console.log('✓ TEST 8 PASSED: Zero-state structures gracefully handled without exceptions.\n')

  // Cleanup Bob
  await cleanupUser(BOB_EMAIL)

  console.log('========================================================')
  console.log('ALL 8 PHASE 10 STUDENT PORTAL CHECKS PASSED!')
  console.log('========================================================')
}

runStudentPortalTests().catch((err) => {
  console.error('\n❌ PHASE 10 TEST FAILED:', err)
  process.exit(1)
})
