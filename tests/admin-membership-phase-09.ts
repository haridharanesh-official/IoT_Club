import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import {
  getAdminMembershipApplications,
  getMembershipDashboardCounts,
  getApplicationAuditHistory,
} from '../lib/admin/membership'
import { drainGoogleSheetsOutbox } from '../lib/integrations/google-sheets'

// Load environment variables
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const adminService = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function runPhase09Tests() {
  console.log('========================================================')
  console.log('PHASE 09: REAL ADMIN MEMBERSHIP MANAGEMENT TEST SUITE')
  console.log('========================================================\n')

  const results: Record<string, boolean> = {}

  async function cleanUserByEmail(email: string) {
    const { data: usersData } = await adminService.auth.admin.listUsers()
    const target = usersData?.users?.find((u) => u.email === email)
    if (!target) return
    await adminService.from('audit_logs').delete().eq('actor_user_id', target.id)
    await adminService.from('membership_applications').update({ reviewed_by: null }).eq('reviewed_by', target.id)
    const { data: userApps } = await adminService.from('membership_applications').select('id').eq('user_id', target.id)
    for (const app of userApps || []) {
      await adminService.from('audit_logs').delete().eq('entity_id', app.id)
      await adminService.from('sheet_sync_logs').delete().eq('entity_id', app.id)
    }
    await adminService.from('membership_applications').delete().eq('user_id', target.id)
    await adminService.from('student_skills').delete().eq('user_id', target.id)
    await adminService.from('student_interests').delete().eq('user_id', target.id)
    await adminService.from('student_profiles').delete().eq('user_id', target.id)
    await adminService.auth.admin.deleteUser(target.id)
  }

  // -----------------------------------------------------------
  // SETUP: Authenticate or ensure test accounts
  // -----------------------------------------------------------
  console.log('--- SETUP: Initializing Test Accounts & Fixtures ---')

  const adminEmail = 'test.admin@college.example'
  const adminPassword = 'TestPassword123!'

  // Ensure Admin exists and has role ADMIN
  const { data: adminAuthData, error: adminAuthErr } = await adminService.auth.admin.listUsers()
  let adminUser = adminAuthData?.users?.find((u) => u.email === adminEmail)
  if (!adminUser) {
    const created = await adminService.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test Admin' },
    })
    adminUser = created.data.user!
  } else {
    await adminService.auth.admin.updateUserById(adminUser.id, {
      password: adminPassword,
      email_confirm: true,
    })
  }
  await adminService.from('profiles').update({ role: 'ADMIN', membership_status: 'APPROVED', full_name: 'Test Admin' }).eq('id', adminUser.id)

  // Create Super Admin
  const superAdminEmail = 'test.superadmin@college.example'
  let superAdminUser = adminAuthData?.users?.find((u) => u.email === superAdminEmail)
  if (!superAdminUser) {
    const created = await adminService.auth.admin.createUser({
      email: superAdminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test Super Admin' },
    })
    superAdminUser = created.data.user!
  }
  await adminService.from('profiles').update({ role: 'SUPER_ADMIN', membership_status: 'APPROVED', full_name: 'Test Super Admin' }).eq('id', superAdminUser.id)

  // Create Teacher
  const teacherEmail = 'test.teacher@college.example'
  let teacherUser = adminAuthData?.users?.find((u) => u.email === teacherEmail)
  if (!teacherUser) {
    const created = await adminService.auth.admin.createUser({
      email: teacherEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test Teacher' },
    })
    teacherUser = created.data.user!
  }
  await adminService.from('profiles').update({ role: 'TEACHER', membership_status: 'APPROVED', full_name: 'Test Teacher' }).eq('id', teacherUser.id)

  // Create Student
  const studentEmail = 'test.student.phase09@college.example'
  let studentUser = adminAuthData?.users?.find((u) => u.email === studentEmail)
  if (!studentUser) {
    const created = await adminService.auth.admin.createUser({
      email: studentEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test Student Phase09' },
    })
    studentUser = created.data.user!
  }
  await adminService.from('profiles').update({ role: 'STUDENT', membership_status: 'PENDING', full_name: 'Test Student Phase09' }).eq('id', studentUser.id)

  // Sign in as Admin
  const adminClient = createClient(SUPABASE_URL, ANON_KEY)
  const adminLogin = await adminClient.auth.signInWithPassword({ email: adminEmail, password: adminPassword })
  assert.ok(adminLogin.data.user, 'Admin logged in')

  // Sign in as Super Admin
  const superAdminClient = createClient(SUPABASE_URL, ANON_KEY)
  const superAdminLogin = await superAdminClient.auth.signInWithPassword({ email: superAdminEmail, password: adminPassword })
  assert.ok(superAdminLogin.data.user, 'Super admin logged in')

  // Sign in as Teacher
  const teacherClient = createClient(SUPABASE_URL, ANON_KEY)
  const teacherLogin = await teacherClient.auth.signInWithPassword({ email: teacherEmail, password: adminPassword })
  assert.ok(teacherLogin.data.user, 'Teacher logged in')

  // Sign in as Student
  const studentClient = createClient(SUPABASE_URL, ANON_KEY)
  const studentLogin = await studentClient.auth.signInWithPassword({ email: studentEmail, password: adminPassword })
  assert.ok(studentLogin.data.user, 'Student logged in')

  // Create a synthetic candidate application for tests: Student Charlie
  const charlieEmail = 'test.charlie.phase09@college.example'
  let charlieUser = adminAuthData?.users?.find((u) => u.email === charlieEmail)
  if (charlieUser) {
    await adminService.from('audit_logs').delete().eq('actor_user_id', charlieUser.id)
    await adminService.from('membership_applications').update({ reviewed_by: null }).eq('reviewed_by', charlieUser.id)
    const { data: charlieApp } = await adminService.from('membership_applications').select('id').eq('user_id', charlieUser.id).single()
    if (charlieApp) {
      await adminService.from('audit_logs').delete().eq('entity_id', charlieApp.id)
      await adminService.from('sheet_sync_logs').delete().eq('entity_id', charlieApp.id)
      await adminService.from('membership_applications').delete().eq('id', charlieApp.id)
    }
    await adminService.from('student_skills').delete().eq('user_id', charlieUser.id)
    await adminService.from('student_interests').delete().eq('user_id', charlieUser.id)
    await adminService.from('student_profiles').delete().eq('user_id', charlieUser.id)
    await adminService.auth.admin.deleteUser(charlieUser.id)
  }

  const charlieCreated = await adminService.auth.admin.createUser({
    email: charlieEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Charlie Test Student' },
  })
  charlieUser = charlieCreated.data.user!
  await adminService.from('profiles').update({ full_name: 'Charlie Test Student', role: 'STUDENT', membership_status: 'PENDING' }).eq('id', charlieUser.id)

  const charlieRegId = 'IOT-2026-00099'
  await adminService.from('student_profiles').insert({
    user_id: charlieUser.id,
    registration_id: charlieRegId,
    date_of_birth: '2005-09-15',
    gender: 'Male',
    mobile_number: '9888877777',
    personal_email: 'charlie.personal@example.com',
    college_email: charlieEmail,
    register_number: '714022104099',
    department: 'Information Technology',
    degree_programme: 'BE',
    year_of_study: 3,
    semester: 5,
    section: 'B',
    batch: '2024-2028',
    github_url: 'https://github.com/charlie-iot',
    linkedin_url: 'https://linkedin.com/in/charlie-iot',
    portfolio_url: 'https://charlie.example.com',
  })

  const nowIso = new Date().toISOString()
  const { data: charlieAppRow, error: charlieInsertErr } = await adminService.from('membership_applications').insert({
    user_id: charlieUser.id,
    registration_id: charlieRegId,
    reason_for_joining: 'Building smart mesh networks for agrarian monitoring.',
    skill_level: 'INTERMEDIATE',
    previous_iot_experience: true,
    experience_description: 'Designed mesh topology using ESP-NOW and MQTT broker.',
    status: 'PENDING',
    consented_accuracy_at: nowIso,
    consented_rules_at: nowIso,
    consented_data_use_at: nowIso,
  }).select('*').single()
  if (charlieInsertErr || !charlieAppRow) {
    throw new Error(`Failed to insert charlieAppRow: ${charlieInsertErr?.message}`)
  }

  await adminService.from('student_interests').insert([
    { user_id: charlieUser.id, interest: 'Internet of Things' },
    { user_id: charlieUser.id, interest: 'Robotics' },
  ])

  const { error: skillsErr } = await adminService.from('student_skills').insert([
    { user_id: charlieUser.id, category: 'PROGRAMMING', skill: 'C++', level: 'INTERMEDIATE' },
    { user_id: charlieUser.id, category: 'HARDWARE', skill: 'ESP32', level: 'INTERMEDIATE' },
    { user_id: charlieUser.id, category: 'TECHNOLOGY', skill: 'MQTT', level: 'BEGINNER' },
  ])
  if (skillsErr) throw new Error(`Failed to insert skills: ${skillsErr.message}`)

  await adminService.from('sheet_sync_logs').upsert({
    entity_type: 'membership_application',
    entity_id: charlieAppRow.id,
    registration_id: charlieRegId,
    sync_status: 'PENDING',
    attempt_count: 0,
  }, { onConflict: 'entity_type,entity_id' })

  console.log('✓ Setup complete: Test admin, student, and Charlie fixture created.\n')

  // -----------------------------------------------------------
  // TEST 1: Pending list query
  // -----------------------------------------------------------
  console.log('TEST 1: Pending List Query...')
  const pendingData = await getAdminMembershipApplications(adminClient, { status: 'PENDING' })
  assert.ok(pendingData.applications.length > 0, 'Pending list has records')
  assert.ok(pendingData.applications.every((a) => a.status === 'PENDING'), 'All records are PENDING')
  const charlieInPending = pendingData.applications.find((a) => a.registrationId === charlieRegId)
  assert.ok(charlieInPending, 'Charlie is in pending list')
  results['1_pending_list'] = true
  console.log('✓ TEST 1 PASSED: Pending list returned valid records.\n')

  // -----------------------------------------------------------
  // TEST 2: Search by Reg ID, Roll No, Name, and Email
  // -----------------------------------------------------------
  console.log('TEST 2: Search Capabilities...')
  // By Registration ID
  const searchRegId = await getAdminMembershipApplications(adminClient, { search: charlieRegId })
  assert.equal(searchRegId.applications.length, 1, 'Search by registration_id returns 1 record')
  assert.equal(searchRegId.applications[0].registrationId, charlieRegId)

  // By Register Number
  const searchRoll = await getAdminMembershipApplications(adminClient, { search: '714022104099' })
  assert.ok(searchRoll.applications.length >= 1, 'Search by register_number returns record')
  assert.ok(searchRoll.applications.some((a) => a.registerNumber === '714022104099'))

  // By Full Name
  const searchName = await getAdminMembershipApplications(adminClient, { search: 'Charlie Test Student' })
  assert.ok(searchName.applications.length >= 1, 'Search by name returns record')
  assert.ok(searchName.applications.some((a) => a.fullName.includes('Charlie')))

  // By College Email
  const searchEmail = await getAdminMembershipApplications(adminClient, { search: charlieEmail })
  assert.ok(searchEmail.applications.length >= 1, 'Search by email returns record')
  assert.ok(searchEmail.applications.some((a) => a.collegeEmail === charlieEmail))

  results['2_search'] = true
  console.log('✓ TEST 2 PASSED: Search matches registration ID, roll number, full name, and email.\n')

  // -----------------------------------------------------------
  // TEST 3: Filtering by status, department, year, batch
  // -----------------------------------------------------------
  console.log('TEST 3: Filtering by Attributes...')
  const deptFilter = await getAdminMembershipApplications(adminClient, {
    department: 'Information Technology',
  })
  assert.ok(deptFilter.applications.length > 0, 'Department filter returns results')
  assert.ok(deptFilter.applications.every((a) => a.department === 'Information Technology'))

  const yearFilter = await getAdminMembershipApplications(adminClient, { year: '3' })
  assert.ok(yearFilter.applications.length > 0, 'Year filter returns results')
  assert.ok(yearFilter.applications.every((a) => a.yearOfStudy === 3))

  const batchFilter = await getAdminMembershipApplications(adminClient, { batch: '2024-2028' })
  assert.ok(batchFilter.applications.length > 0, 'Batch filter returns results')
  assert.ok(batchFilter.applications.every((a) => a.batch === '2024-2028'))

  results['3_filtering'] = true
  console.log('✓ TEST 3 PASSED: Filtering by department, year, and batch functions accurately.\n')

  // -----------------------------------------------------------
  // TEST 4: Pagination
  // -----------------------------------------------------------
  console.log('TEST 4: Server Pagination...')
  const page1 = await getAdminMembershipApplications(adminClient, { page: 1, pageSize: 2 })
  assert.ok(page1.applications.length <= 2, 'Page size limit honored')
  assert.equal(page1.currentPage, 1, 'Current page is 1')
  assert.ok(page1.totalCount >= 1, 'totalCount returned')
  assert.ok(page1.totalPages >= 1, 'totalPages computed')

  if (page1.totalCount > 2) {
    const page2 = await getAdminMembershipApplications(adminClient, { page: 2, pageSize: 2 })
    assert.equal(page2.currentPage, 2, 'Current page is 2')
    assert.notEqual(page1.applications[0].id, page2.applications[0].id, 'Page 1 and Page 2 contain distinct records')
  }
  results['4_pagination'] = true
  console.log('✓ TEST 4 PASSED: Pagination boundaries and metadata verified.\n')

  // -----------------------------------------------------------
  // TEST 5: Detail hydration
  // -----------------------------------------------------------
  console.log('TEST 5: Full Detail Hydration...')
  const detailSearch = await getAdminMembershipApplications(adminClient, { search: charlieRegId })
  const detail = detailSearch.applications[0]
  assert.ok(detail, 'Charlie application hydrated')
  assert.equal(detail.fullName, 'Charlie Test Student')
  assert.equal(detail.mobileNumber, '9888877777')
  assert.equal(detail.department, 'Information Technology')
  assert.equal(detail.yearOfStudy, 3)
  assert.equal(detail.skillLevel, 'INTERMEDIATE')
  assert.equal(detail.previousIotExperience, true)
  assert.ok(detail.experienceDescription?.includes('ESP-NOW'))
  assert.ok(detail.interests.includes('Internet of Things'))
  assert.ok(detail.categorizedSkills.programming.some((s) => s.skill === 'C++'))
  assert.ok(detail.categorizedSkills.hardware.some((s) => s.skill === 'ESP32'))
  assert.ok(detail.categorizedSkills.technology.some((s) => s.skill === 'MQTT'))
  assert.equal(detail.githubUrl, 'https://github.com/charlie-iot')
  assert.equal(detail.sheetSync.status, 'PENDING')
  results['5_detail_hydration'] = true
  console.log('✓ TEST 5 PASSED: Complete applicant profile, collections, and sync metadata hydrated.\n')

  // -----------------------------------------------------------
  // TEST 6: Approve Action (PENDING -> APPROVED)
  // -----------------------------------------------------------
  console.log('TEST 6: Approve Application...')
  const approveRes = await adminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'APPROVED',
    notes: 'Approved technical statement and coursework.',
  })
  assert.equal(approveRes.error, null, `Approval succeeded: ${approveRes.error?.message}`)

  // Verify DB state
  const { data: appAfterApprove } = await adminService.from('membership_applications').select('*').eq('id', charlieAppRow.id).single()
  const { data: profAfterApprove } = await adminService.from('profiles').select('*').eq('id', charlieUser.id).single()
  const { data: outboxAfterApprove } = await adminService.from('sheet_sync_logs').select('*').eq('entity_id', charlieAppRow.id).single()

  assert.equal(appAfterApprove.status, 'APPROVED')
  assert.equal(profAfterApprove.membership_status, 'APPROVED')
  assert.equal(appAfterApprove.reviewed_by, adminUser.id)
  assert.ok(appAfterApprove.reviewed_at)
  assert.equal(outboxAfterApprove.sync_status, 'PENDING', 'Outbox reset to PENDING upon decision')
  results['6_approve'] = true
  console.log('✓ TEST 6 PASSED: PENDING -> APPROVED state update and outbox queued.\n')

  // -----------------------------------------------------------
  // TEST 7: Reject Action (Test notes requirement + state transition)
  // -----------------------------------------------------------
  console.log('TEST 7: Reject Action with Mandatory Notes...')
  // Create another candidate to test reject
  const daveEmail = 'test.dave.phase09@college.example'
  await cleanUserByEmail(daveEmail)
  const daveCreated = await adminService.auth.admin.createUser({
    email: daveEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Dave Reject Candidate' },
  })
  const daveUser = daveCreated.data.user!
  await adminService.from('profiles').update({ full_name: 'Dave Reject Candidate', role: 'STUDENT', membership_status: 'PENDING' }).eq('id', daveUser.id)

  const { data: daveApp, error: daveErr } = await adminService.from('membership_applications').insert({
    user_id: daveUser.id,
    registration_id: 'IOT-2026-00098',
    reason_for_joining: 'Testing rejection.',
    skill_level: 'BEGINNER',
    previous_iot_experience: false,
    status: 'PENDING',
    consented_accuracy_at: nowIso,
    consented_rules_at: nowIso,
    consented_data_use_at: nowIso,
  }).select('*').single()
  if (daveErr || !daveApp) throw new Error(`Failed to insert Dave app: ${daveErr?.message}`)

  // Attempt reject without notes -> Must fail
  const rejectWithoutNotes = await adminClient.rpc('review_membership_application', {
    application_id: daveApp.id,
    decision: 'REJECTED',
    notes: '   ',
  })
  assert.ok(rejectWithoutNotes.error, 'Rejection without notes rejected by database')
  assert.ok(rejectWithoutNotes.error.message.includes('notes required'), 'Error mentions notes required')

  // Reject with valid notes -> Must succeed
  const rejectWithNotes = await adminClient.rpc('review_membership_application', {
    application_id: daveApp.id,
    decision: 'REJECTED',
    notes: 'Prerequisite embedded systems knowledge insufficient.',
  })
  assert.equal(rejectWithNotes.error, null, 'Rejection with notes succeeded')

  const { data: daveAppAfter } = await adminService.from('membership_applications').select('*').eq('id', daveApp.id).single()
  const { data: daveProfAfter } = await adminService.from('profiles').select('*').eq('id', daveUser.id).single()
  assert.equal(daveAppAfter.status, 'REJECTED')
  assert.equal(daveProfAfter.membership_status, 'REJECTED')
  assert.equal(daveAppAfter.review_notes, 'Prerequisite embedded systems knowledge insufficient.')
  results['7_reject'] = true
  console.log('✓ TEST 7 PASSED: Rejection mandates review notes and sets REJECTED state.\n')

  // -----------------------------------------------------------
  // TEST 8: Suspend Action (APPROVED -> SUSPENDED)
  // -----------------------------------------------------------
  console.log('TEST 8: Suspend Approved Member...')
  // Charlie is currently APPROVED. Attempt suspend without notes -> Must fail
  const suspendWithoutNotes = await adminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'SUSPENDED',
    notes: null,
  })
  assert.ok(suspendWithoutNotes.error, 'Suspension without notes fails')

  // Suspend with notes -> Must succeed
  const suspendWithNotes = await adminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'SUSPENDED',
    notes: 'Suspended pending hardware asset return.',
  })
  assert.equal(suspendWithNotes.error, null, 'Suspension with notes succeeded')

  const { data: appAfterSuspend } = await adminService.from('membership_applications').select('*').eq('id', charlieAppRow.id).single()
  const { data: profAfterSuspend } = await adminService.from('profiles').select('*').eq('id', charlieUser.id).single()
  assert.equal(appAfterSuspend.status, 'SUSPENDED')
  assert.equal(profAfterSuspend.membership_status, 'SUSPENDED')
  results['8_suspend'] = true
  console.log('✓ TEST 8 PASSED: APPROVED -> SUSPENDED enforces notes and revokes membership.\n')

  // -----------------------------------------------------------
  // TEST 9: Reactivate Action (SUSPENDED -> APPROVED)
  // -----------------------------------------------------------
  console.log('TEST 9: Reactivate Suspended Member...')
  const reactivateRes = await adminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'APPROVED',
    notes: 'Hardware returned. Member reactivated in good standing.',
  })
  assert.equal(reactivateRes.error, null, 'Reactivation succeeded')

  const { data: appAfterReactivate } = await adminService.from('membership_applications').select('*').eq('id', charlieAppRow.id).single()
  const { data: profAfterReactivate } = await adminService.from('profiles').select('*').eq('id', charlieUser.id).single()
  assert.equal(appAfterReactivate.status, 'APPROVED')
  assert.equal(profAfterReactivate.membership_status, 'APPROVED')
  results['9_reactivate'] = true
  console.log('✓ TEST 9 PASSED: SUSPENDED -> APPROVED restoration succeeded.\n')

  // -----------------------------------------------------------
  // TEST 10: Audit Log Tracking
  // -----------------------------------------------------------
  console.log('TEST 10: Audit Log History...')
  const auditLogs = await getApplicationAuditHistory(adminClient, charlieAppRow.id)
  assert.ok(auditLogs.length >= 3, 'At least 3 audit log transitions recorded for Charlie')
  // Should have: APPROVED (reactivate), SUSPENDED, APPROVED (initial)
  assert.equal(auditLogs[0].newStatus, 'APPROVED')
  assert.equal(auditLogs[0].previousStatus, 'SUSPENDED')
  assert.equal(auditLogs[0].actorEmail, adminEmail)
  assert.ok(auditLogs[0].notes?.includes('Hardware returned'))

  assert.equal(auditLogs[1].newStatus, 'SUSPENDED')
  assert.equal(auditLogs[1].previousStatus, 'APPROVED')

  assert.equal(auditLogs[2].newStatus, 'APPROVED')
  assert.equal(auditLogs[2].previousStatus, 'PENDING')
  results['10_audit_log'] = true
  console.log('✓ TEST 10 PASSED: Immutable audit logs track all state transitions and notes.\n')

  // -----------------------------------------------------------
  // TEST 11: Sheets Outbox Status
  // -----------------------------------------------------------
  console.log('TEST 11: Sheets Outbox Integration...')
  const { data: outboxRow } = await adminService.from('sheet_sync_logs').select('*').eq('entity_id', charlieAppRow.id).single()
  assert.ok(outboxRow, 'Outbox row exists')
  assert.equal(outboxRow.sync_status, 'PENDING', 'Sync status is PENDING after review')
  results['11_sheets_outbox'] = true
  console.log('✓ TEST 11 PASSED: Database triggers mark outbox PENDING on decision.\n')

  // -----------------------------------------------------------
  // TEST 12: Retry Sheets Sync (Worker drain)
  // -----------------------------------------------------------
  console.log('TEST 12: Retry Sheets Sync...')
  // Drain outbox using service adapter
  const drainResult = await drainGoogleSheetsOutbox(10)
  assert.ok(drainResult.totalProcessed >= 1, 'Processed at least 1 record during drain')
  const { data: outboxDrained } = await adminService.from('sheet_sync_logs').select('*').eq('entity_id', charlieAppRow.id).single()
  assert.equal(outboxDrained.sync_status, 'SYNCED', 'Outbox record marked SYNCED')
  assert.ok(outboxDrained.synced_at, 'synced_at timestamp populated')
  results['12_retry_sync'] = true
  console.log('✓ TEST 12 PASSED: Sheets worker drains pending outbox records to SYNCED.\n')

  // -----------------------------------------------------------
  // TEST 13: Student Security (Blocked from review RPC)
  // -----------------------------------------------------------
  console.log('TEST 13: Student Security...')
  const studentAttempt = await studentClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'APPROVED',
  })
  assert.ok(studentAttempt.error, 'Student review call rejected')
  assert.ok(studentAttempt.error.message.includes('not authorized'), 'Student rejected with authorization error')
  results['13_student_unauthorized'] = true
  console.log('✓ TEST 13 PASSED: Students cannot review membership applications.\n')

  // -----------------------------------------------------------
  // TEST 14: Teacher Security (Blocked from review RPC)
  // -----------------------------------------------------------
  console.log('TEST 14: Teacher Security...')
  const teacherAttempt = await teacherClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'APPROVED',
  })
  assert.ok(teacherAttempt.error, 'Teacher review call rejected')
  assert.ok(teacherAttempt.error.message.includes('not authorized'), 'Teacher rejected with authorization error')
  results['14_teacher_unauthorized'] = true
  console.log('✓ TEST 14 PASSED: Teachers cannot review membership applications.\n')

  // -----------------------------------------------------------
  // TEST 15: Admin Authorized
  // -----------------------------------------------------------
  console.log('TEST 15: Admin Authorized...')
  // Suspend and reactivate Charlie as Admin to verify admin authorization
  const adminOp1 = await adminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'SUSPENDED',
    notes: 'Admin authorization check suspension.',
  })
  assert.equal(adminOp1.error, null, 'Admin review succeeded')
  results['15_admin_authorized'] = true
  console.log('✓ TEST 15 PASSED: Admin session has full membership management authorization.\n')

  // -----------------------------------------------------------
  // TEST 16: Super Admin Authorized
  // -----------------------------------------------------------
  console.log('TEST 16: Super Admin Authorized...')
  const superAdminOp = await superAdminClient.rpc('review_membership_application', {
    application_id: charlieAppRow.id,
    decision: 'APPROVED',
    notes: 'Super-admin restored member.',
  })
  assert.equal(superAdminOp.error, null, 'Super admin review succeeded')
  results['16_superadmin_authorized'] = true
  console.log('✓ TEST 16 PASSED: Super Admin session has full membership management authorization.\n')

  // -----------------------------------------------------------
  // TEST 17: Forged Role / Status Tampering Blocked
  // -----------------------------------------------------------
  console.log('TEST 17: Forged Status / Direct Client Tampering...')
  // Student attempts direct table update to become APPROVED
  const studentTamper = await studentClient
    .from('membership_applications')
    .update({ status: 'APPROVED' })
    .eq('user_id', studentUser.id)
  assert.ok(studentTamper.error, 'Direct table update rejected by RLS')

  // Test invalid transition state jump: REJECTED applicant Dave cannot be APPROVED
  const illegalTransition = await adminClient.rpc('review_membership_application', {
    application_id: daveApp.id,
    decision: 'APPROVED',
  })
  assert.ok(illegalTransition.error, 'Transition from REJECTED to APPROVED blocked')
  assert.ok(illegalTransition.error.message.includes('cannot be updated'), 'Exception mentions rejected cannot be updated')
  results['17_forged_tampering_blocked'] = true
  console.log('✓ TEST 17 PASSED: Direct RLS bypass and invalid transition jumps strictly rejected.\n')

  // -----------------------------------------------------------
  // TEST 18: Concurrency & Row Locking
  // -----------------------------------------------------------
  console.log('TEST 18: Concurrency & Row Locking...')
  // Create candidate Eve for concurrent race test
  const eveEmail = 'test.eve.phase09@college.example'
  await cleanUserByEmail(eveEmail)
  const eveCreated = await adminService.auth.admin.createUser({
    email: eveEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Eve Concurrency Candidate' },
  })
  const eveUser = eveCreated.data.user!
  await adminService.from('profiles').update({ full_name: 'Eve Concurrency Candidate', role: 'STUDENT', membership_status: 'PENDING' }).eq('id', eveUser.id)

  const { data: eveApp, error: eveErr } = await adminService.from('membership_applications').insert({
    user_id: eveUser.id,
    registration_id: 'IOT-2026-00097',
    reason_for_joining: 'Testing concurrency.',
    skill_level: 'BEGINNER',
    previous_iot_experience: false,
    status: 'PENDING',
    consented_accuracy_at: nowIso,
    consented_rules_at: nowIso,
    consented_data_use_at: nowIso,
  }).select('*').single()
  if (eveErr || !eveApp) throw new Error(`Failed to insert Eve app: ${eveErr?.message}`)

  // Two admins attempt to review Eve concurrently (one APPROVE, one REJECT)
  const [resA, resB] = await Promise.all([
    adminClient.rpc('review_membership_application', {
      application_id: eveApp.id,
      decision: 'APPROVED',
      notes: 'Concurrent approval attempt.',
    }),
    superAdminClient.rpc('review_membership_application', {
      application_id: eveApp.id,
      decision: 'REJECTED',
      notes: 'Concurrent rejection attempt.',
    }),
  ])

  // Exactly one must succeed, and the other must fail with a clean transition error
  const successes = [resA, resB].filter((r) => r.error === null)
  const failures = [resA, resB].filter((r) => r.error !== null)
  assert.equal(successes.length, 1, 'Exactly one concurrent decision succeeded')
  assert.equal(failures.length, 1, 'The other concurrent attempt failed cleanly')
  assert.ok(
    failures[0].error!.message.includes('already has this status') ||
    failures[0].error!.message.includes('cannot be') ||
    failures[0].error!.message.includes('can only be'),
    `Failure handled cleanly without DB corruption: ${failures[0].error?.message}`
  )

  // Verify only 1 audit log exists for Eve's decision
  const eveAudit = await getApplicationAuditHistory(adminClient, eveApp.id)
  assert.equal(eveAudit.length, 1, 'Exactly one audit log entry created, no race corruption')
  results['18_concurrency'] = true
  console.log('✓ TEST 18 PASSED: FOR UPDATE row locking guarantees atomic decision.\n')

  // -----------------------------------------------------------
  // TEST 19: Double-click Idempotency
  // -----------------------------------------------------------
  console.log('TEST 19: Double-click Idempotency...')
  // Eve is now either APPROVED or REJECTED. Attempting same decision again must fail idempotently
  const { data: eveCurrent } = await adminService.from('membership_applications').select('status').eq('id', eveApp.id).single()
  assert.ok(eveCurrent, 'eveCurrent exists')
  const duplicateCall = await adminClient.rpc('review_membership_application', {
    application_id: eveApp.id,
    decision: eveCurrent!.status,
    notes: 'Double submission attempt.',
  })
  assert.ok(duplicateCall.error, 'Duplicate review rejected')
  assert.ok(duplicateCall.error.message.includes('already has this status'), 'Idempotency error message verified')
  results['19_idempotency'] = true
  console.log('✓ TEST 19 PASSED: Duplicate review rejected idempotently.\n')

  // -----------------------------------------------------------
  // TEST 20: No Duplicate Sheet Rows
  // -----------------------------------------------------------
  console.log('TEST 20: Sheet Sync In-Place Integrity...')
  // Sync Eve's decision
  await drainGoogleSheetsOutbox(10)
  const { data: eveOutbox } = await adminService.from('sheet_sync_logs').select('*').eq('entity_id', eveApp.id)
  assert.ok(eveOutbox, 'eveOutbox exists')
  assert.equal(eveOutbox!.length, 1, 'Exactly one outbox entry for application in sheet_sync_logs')
  results['20_no_duplicate_sheet_row'] = true
  console.log('✓ TEST 20 PASSED: Outbox maintains exactly one sync record per application.\n')

  // -----------------------------------------------------------
  // Summary Counts Verification
  // -----------------------------------------------------------
  console.log('--- Verifying Real Dashboard Summary Counts ---')
  const counts = await getMembershipDashboardCounts(adminService)
  console.log('Authoritative PostgreSQL Membership Counts:', counts)
  assert.ok(counts.total > 0, 'Total applications > 0')
  assert.equal(counts.total, counts.pending + counts.approved + counts.rejected + counts.suspended, 'Counts sum to total')

  // Cleanup temporary test fixtures
  console.log('\n--- Cleaning up temporary test fixtures ---')
  for (const uid of [daveUser.id, eveUser.id]) {
    await adminService.from('audit_logs').delete().eq('actor_user_id', uid)
    const { data: uApps } = await adminService.from('membership_applications').select('id').eq('user_id', uid)
    for (const app of uApps || []) {
      await adminService.from('audit_logs').delete().eq('entity_id', app.id)
      await adminService.from('sheet_sync_logs').delete().eq('entity_id', app.id)
    }
    await adminService.from('membership_applications').delete().eq('user_id', uid)
    await adminService.from('student_profiles').delete().eq('user_id', uid)
    await adminService.auth.admin.deleteUser(uid)
  }

  console.log('\n========================================================')
  console.log('ALL 20 PHASE 09 CHECKS COMPLETED SUCCESSFULLY!')
  console.log('========================================================')
  console.log(JSON.stringify(results, null, 2))
}

runPhase09Tests().catch((err) => {
  console.error('PHASE 09 TESTS FAILED:', err)
  process.exit(1)
})
