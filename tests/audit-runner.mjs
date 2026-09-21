import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .map(line => { const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1).replace(/^['"]|['"]$/g, '')] }))

assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'Must use local Supabase')

const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.LOCAL_SERVICE_ROLE_KEY

const makeAnonClient = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const makeServiceClient = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)

const testPassword = 'TestPassword123!'

async function confirmMailpitEmail(client, email) {
  const listRes = await fetch('http://127.0.0.1:54324/api/v1/messages')
  const list = await listRes.json()
  const message = list.messages.find(item => item.To?.some(recipient => recipient.Address === email))
  assert.ok(message, `Confirmation mail exists for ${email}`)
  const detailRes = await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)
  const detail = await detailRes.json()
  const hash = detail.HTML.match(/token_hash=([^&" ]+)/)?.[1]
  assert.ok(hash, `Confirmation token_hash found for ${email}`)
  const confirmed = await client.auth.verifyOtp({ token_hash: hash, type: 'email' })
  assert.equal(confirmed.error, null, `Email confirmed for ${email}`)
  return confirmed.data.user
}

async function createAndConfirmUser(email) {
  const client = makeAnonClient()
  const { data, error } = await client.auth.signUp({ email, password: testPassword })
  assert.equal(error, null, `Sign up succeeded for ${email}`)
  await confirmMailpitEmail(client, email)
  const signInRes = await client.auth.signInWithPassword({ email, password: testPassword })
  assert.equal(signInRes.error, null, `Sign in succeeded for ${email}`)
  return { client, user: signInRes.data.user }
}

async function runAudit() {
  console.log('--- STARTING PHASE 06 AUDIT SUITE ---')
  const results = {}
  const service = makeServiceClient()

  // Clean up any previous test users to ensure idempotency
  const testEmails = [
    'test.alpha@college.example',
    'test.beta@college.example',
    'test.gamma@college.example',
    'test.admin@college.example',
  ]
  const { data: existingUsers } = await service.auth.admin.listUsers()
  for (const u of existingUsers?.users || []) {
    if (testEmails.includes(u.email)) {
      await service.auth.admin.deleteUser(u.id)
    }
  }

  // 1. Synthetic User: Test Student Alpha
  const alphaEmail = 'test.alpha@college.example'
  console.log('Creating synthetic user:', alphaEmail)
  const { client: alphaClient, user: alphaUser } = await createAndConfirmUser(alphaEmail)
  
  const alphaPayload = {
    full_name: 'Test Student Alpha',
    date_of_birth: '2006-06-15',
    gender: 'Male',
    mobile_number: '9000000001',
    personal_email: 'test.alpha@example.com',
    college_email: alphaEmail,
    register_number: 'TEST-IOT-001',
    department: 'Cyber Security',
    degree_programme: 'B.Tech',
    year_of_study: 2,
    semester: 3,
    section: 'A',
    batch: '2025-2029',
    reason_for_joining: 'Synthetic registration integrity test',
    interests: ['Internet of Things', 'Cybersecurity', 'Robotics'],
    skill_level: 'INTERMEDIATE',
    previous_iot_experience: true,
    experience_description: 'Built a synthetic ESP32 MQTT demo for testing.',
    skills: [
      { category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' },
      { category: 'PROGRAMMING', skill: 'C++', level: 'INTERMEDIATE' },
      { category: 'HARDWARE', skill: 'ESP32', level: 'INTERMEDIATE' },
      { category: 'HARDWARE', skill: 'Raspberry Pi', level: 'INTERMEDIATE' },
      { category: 'TECHNOLOGY', skill: 'MQTT', level: 'INTERMEDIATE' },
      { category: 'TECHNOLOGY', skill: 'Linux', level: 'INTERMEDIATE' },
      { category: 'TECHNOLOGY', skill: 'Git / GitHub', level: 'INTERMEDIATE' }
    ],
    github_url: 'https://github.com/example-test',
    linkedin_url: '',
    portfolio_url: '',
    consent_accuracy: true,
    consent_rules: true,
    consent_data_use: true,
  }

  console.log('Submitting application for Test Student Alpha...')
  const submitRes = await alphaClient.rpc('submit_membership_application', { payload: alphaPayload })
  assert.equal(submitRes.error, null, 'Submission succeeded')
  const registrationId = submitRes.data
  console.log('Generated Registration ID:', registrationId)
  assert.match(registrationId, /^IOT-\d{4}-\d{5,}$/, 'Valid registration ID format')
  results.registrationId = registrationId

  // 2. Read back and verify all DB records
  const { data: authUser } = await service.auth.admin.getUserById(alphaUser.id)
  const { data: profile } = await service.from('profiles').select('*').eq('id', alphaUser.id).single()
  const { data: studentProfile } = await service.from('student_profiles').select('*').eq('user_id', alphaUser.id).single()
  const { data: application } = await service.from('membership_applications').select('*').eq('user_id', alphaUser.id).single()
  const { data: interests } = await service.from('student_interests').select('*').eq('user_id', alphaUser.id).order('interest')
  const { data: skills } = await service.from('student_skills').select('*').eq('user_id', alphaUser.id).order('skill')

  results.dbVerification = {
    auth_users_email: authUser.user.email === 'test.alpha@college.example',
    profile_full_name: profile.full_name === 'Test Student Alpha',
    profile_role: profile.role === 'STUDENT',
    profile_membership_status: profile.membership_status === 'PENDING',
    sp_registration_id: studentProfile.registration_id === registrationId,
    sp_dob: studentProfile.date_of_birth === '2006-06-15',
    sp_gender: studentProfile.gender === 'Male',
    sp_mobile: studentProfile.mobile_number === '9000000001',
    sp_personal_email: studentProfile.personal_email === 'test.alpha@example.com',
    sp_college_email: studentProfile.college_email === 'test.alpha@college.example',
    sp_register_number: studentProfile.register_number === 'TEST-IOT-001',
    sp_department: studentProfile.department === 'Cyber Security',
    sp_degree: studentProfile.degree_programme === 'B.Tech',
    sp_year: studentProfile.year_of_study === 2,
    sp_semester: studentProfile.semester === 3,
    sp_section: studentProfile.section === 'A',
    sp_batch: studentProfile.batch === '2025-2029',
    sp_github: studentProfile.github_url === 'https://github.com/example-test',
    sp_linkedin: studentProfile.linkedin_url === null,
    sp_portfolio: studentProfile.portfolio_url === null,
    app_registration_id: application.registration_id === registrationId,
    app_reason: application.reason_for_joining === 'Synthetic registration integrity test',
    app_skill_level: application.skill_level === 'INTERMEDIATE',
    app_prev_exp: application.previous_iot_experience === true,
    app_exp_desc: application.experience_description === 'Built a synthetic ESP32 MQTT demo for testing.',
    app_status: application.status === 'PENDING',
    app_consent_acc: !!application.consented_accuracy_at,
    app_consent_rules: !!application.consented_rules_at,
    app_consent_data: !!application.consented_data_use_at,
    interests_count: interests.length === 3,
    interests_names: interests.map(i => i.interest).sort().join(',') === 'Cybersecurity,Internet of Things,Robotics',
    skills_count: skills.length === 7,
    prog_skills: skills.filter(s => s.category === 'PROGRAMMING').map(s => s.skill).sort().join(',') === 'C++,Python',
    hw_skills: skills.filter(s => s.category === 'HARDWARE').map(s => s.skill).sort().join(',') === 'ESP32,Raspberry Pi',
    tech_skills: skills.filter(s => s.category === 'TECHNOLOGY').map(s => s.skill).sort().join(',') === 'Git / GitHub,Linux,MQTT',
  }

  for (const [k, v] of Object.entries(results.dbVerification)) {
    assert.equal(v, true, `DB verification failed for ${k}`)
  }
  console.log('All DB fields verified successfully!')

  // 3. Duplicate checks
  console.log('Running duplicate tests...')
  // A. Same account resubmission
  const dupSameAccount = await alphaClient.rpc('submit_membership_application', { payload: alphaPayload })
  assert.ok(dupSameAccount.error, 'Same account cannot submit twice')
  results.duplicateSameAccountBlocked = true

  // B. Duplicate register number from second account
  const betaEmail = 'test.beta@college.example'
  const { client: betaClient, user: betaUser } = await createAndConfirmUser(betaEmail)
  const dupRegPayload = { ...alphaPayload, college_email: betaEmail, register_number: 'test-iot-001' } // lower case to test case folding
  const dupRegRes = await betaClient.rpc('submit_membership_application', { payload: dupRegPayload })
  assert.ok(dupRegRes.error, 'Duplicate register number (case-insensitive) blocked')
  results.duplicateRegisterNumberBlocked = true

  // C. Duplicate email signup
  const dupEmailSignup = await makeAnonClient().auth.signUp({ email: alphaEmail, password: testPassword })
  assert.ok(dupEmailSignup.error || dupEmailSignup.data?.user?.identities?.length === 0, 'Duplicate email signup rejected/safe')
  results.duplicateEmailSignupHandled = true

  // 4. Validation tests (negative testing)
  console.log('Running validation negative tests...')
  const invalidCases = [
    ['empty full name', { full_name: '' }],
    ['empty DOB', { date_of_birth: '' }],
    ['invalid mobile', { mobile_number: 'abc' }],
    ['invalid personal email', { personal_email: 'bad-email' }],
    ['empty register number', { register_number: '' }],
    ['empty department', { department: '' }],
    ['invalid year', { year_of_study: 7 }],
    ['invalid semester', { semester: 13 }],
    ['no interests selected', { interests: [] }],
    ['no skill level', { skill_level: null }],
    ['previous experience null', { previous_iot_experience: null }],
    ['experience=yes without description', { previous_iot_experience: true, experience_description: '' }],
    ['invalid GitHub URL', { github_url: 'http://insecure-github.com/test' }],
    ['missing consent', { consent_rules: false }],
  ]

  let valPassed = 0
  for (const [desc, patch] of invalidCases) {
    const res = await betaClient.rpc('submit_membership_application', { payload: { ...alphaPayload, register_number: 'TEST-BETA-VALIDATION', ...patch } })
    assert.ok(res.error, `Expected failure for: ${desc}`)
    valPassed++
  }
  results.validationTestsPassed = valPassed === invalidCases.length
  console.log(`Validation tests passed: ${valPassed}/${invalidCases.length}`)

  // 5. Atomicity Test: Failure rollback
  console.log('Running atomicity test...')
  // Try to submit with a duplicate skill in the payload array (which trips unique index on (user_id, category, skill))
  const atomicityPayload = {
    ...alphaPayload,
    register_number: 'TEST-BETA-ATOMIC',
    skills: [
      { category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' },
      { category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' } // DUPLICATE
    ]
  }
  const atomicityRes = await betaClient.rpc('submit_membership_application', { payload: atomicityPayload })
  assert.ok(atomicityRes.error, 'Atomicity test transaction failed as expected')
  
  // Verify Beta profile, student_profile, membership_application are clean
  const { data: betaP } = await service.from('profiles').select('full_name,membership_status').eq('id', betaUser.id).single()
  const { data: betaSP } = await service.from('student_profiles').select('*').eq('user_id', betaUser.id)
  const { data: betaApp } = await service.from('membership_applications').select('*').eq('user_id', betaUser.id)
  assert.equal(betaP.full_name, null, 'Profile full_name rolled back')
  assert.equal(betaSP.length, 0, 'No student_profiles row created')
  assert.equal(betaApp.length, 0, 'No membership_applications row created')
  results.atomicityRollbackVerified = true
  console.log('Atomicity rollback verified!')

  // 6. Rapid double-submit test & Tampering test
  console.log('Running rapid double-submit & tamper test...')
  const gammaEmail = 'test.gamma@college.example'
  const { client: gammaClient, user: gammaUser } = await createAndConfirmUser(gammaEmail)
  const tamperedPayload = {
    ...alphaPayload,
    college_email: gammaEmail,
    register_number: 'TEST-IOT-GAMMA',
    role: 'SUPER_ADMIN',
    membership_status: 'APPROVED',
    registration_id: 'IOT-1999-99999',
    user_id: '00000000-0000-0000-0000-000000000000'
  }

  const [res1, res2] = await Promise.all([
    gammaClient.rpc('submit_membership_application', { payload: tamperedPayload }),
    gammaClient.rpc('submit_membership_application', { payload: tamperedPayload })
  ])
  const successes = [res1, res2].filter(r => !r.error)
  const failures = [res1, res2].filter(r => r.error)
  assert.equal(successes.length, 1, 'Exactly one concurrent submit succeeds')
  assert.equal(failures.length, 1, 'The other concurrent submit fails')
  results.doubleSubmitHandled = true

  // Verify gamma profile is NOT SUPER_ADMIN and NOT APPROVED
  const { data: gammaP } = await service.from('profiles').select('role,membership_status').eq('id', gammaUser.id).single()
  const { data: gammaSP } = await service.from('student_profiles').select('registration_id').eq('user_id', gammaUser.id).single()
  assert.equal(gammaP.role, 'STUDENT', 'Client cannot elevate role to SUPER_ADMIN')
  assert.equal(gammaP.membership_status, 'PENDING', 'Client cannot set status to APPROVED')
  assert.match(gammaSP.registration_id, /^IOT-\d{4}-\d{5,}$/, 'Valid registration ID generated')
  assert.notEqual(gammaSP.registration_id, 'IOT-1999-99999', 'Client cannot dictate registration_id')
  results.tamperResistant = true
  console.log('Tamper resistance and double submit verified!')

  // 7. Admin approval test
  console.log('Testing Admin approval flow...')
  const adminEmail = 'test.admin@college.example'
  const { client: adminClient, user: adminUser } = await createAndConfirmUser(adminEmail)
  // Elevate to ADMIN via service role
  await service.from('profiles').update({ role: 'ADMIN' }).eq('id', adminUser.id)

  // Review Test Student Alpha's application
  const appToReview = application.id
  const reviewRes = await adminClient.rpc('review_membership_application', {
    application_id: appToReview,
    decision: 'APPROVED',
    notes: 'Approved during local integrity audit'
  })
  assert.equal(reviewRes.error, null, 'Admin review RPC succeeded')

  // Verify Alpha is now APPROVED
  const { data: alphaApprovedProfile } = await service.from('profiles').select('role,membership_status').eq('id', alphaUser.id).single()
  const { data: alphaApprovedApp } = await service.from('membership_applications').select('*').eq('id', appToReview).single()
  assert.equal(alphaApprovedProfile.membership_status, 'APPROVED', 'Profile updated to APPROVED')
  assert.equal(alphaApprovedApp.status, 'APPROVED', 'Application updated to APPROVED')
  assert.equal(alphaApprovedApp.reviewed_by, adminUser.id, 'reviewed_by set to admin id')
  assert.ok(alphaApprovedApp.reviewed_at, 'reviewed_at populated')
  assert.equal(alphaApprovedApp.review_notes, 'Approved during local integrity audit', 'review_notes populated')

  // Verify audit log
  const { data: auditLogs } = await service.from('audit_logs')
    .select('*')
    .eq('entity_id', appToReview)
    .eq('action', 'membership_reviewed')
  assert.equal(auditLogs.length, 1, 'Audit log recorded for review')
  assert.equal(auditLogs[0].actor_user_id, adminUser.id, 'Audit log actor is admin')
  results.adminApprovalVerified = true
  console.log('Admin approval flow verified!')

  console.log('--- ALL PHASE 06 AUDIT CHECKS PASSED ---')
  console.log(JSON.stringify(results, null, 2))
}

runAudit().catch(err => {
  console.error('AUDIT FAILED:', err)
  process.exit(1)
})
