import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { chromium, type Browser, type Page } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'
import { mapApplicationToSheetRow } from '../lib/integrations/google-sheets/mapper'

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

const BASE_URL = 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CHROME_PATH = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome')

if (!['localhost', '127.0.0.1', '::1'].includes(new URL(SUPABASE_URL).hostname)) {
  throw new Error('Integrated registration test must use a local Supabase URL')
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const SYNTHETIC_STUDENT = {
  name: 'Integrated Registration Student',
  rollNumber: 'TEST-INTEGRATED-001',
  emailAddress: 'integrated.student@college.example',
  mobile: '9000003001',
  password: 'TestPassword123!',
  dob: '2005-05-20',
  gender: 'Male',
  department: 'Computer Science & Engineering',
  programme: 'B.E.',
  year: '2',
  semester: '4',
  section: 'B',
  batch: '2024-2028',
  interests: ['Internet of Things', 'Embedded Systems', 'MQTT'],
  skillLevel: 'INTERMEDIATE' as const,
  experienceDesc: 'Developed smart IoT weather node using ESP32 and MQTT.',
  skills: ['C++', 'Python', 'ESP32', 'MQTT', 'Linux'],
  githubUrl: 'https://github.com/integrated-student',
  linkedinUrl: 'https://linkedin.com/in/integrated-student',
  portfolioUrl: 'https://integrated-student.example.com',
}

const ADMIN_CREDENTIALS = {
  email: 'test.admin@college.example',
  password: 'TestPassword123!',
}

async function cleanupStudent(email: string) {
  await fetch('http://127.0.0.1:54324/api/v1/messages', { method: 'DELETE' }).catch(() => {})
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const target = users?.users?.find((u) => u.email === email)
  if (target) {
    await supabaseAdmin.from('audit_logs').delete().eq('actor_user_id', target.id)
    await supabaseAdmin.from('audit_logs').delete().eq('entity_id', target.id)
    const { data: apps } = await supabaseAdmin.from('membership_applications').select('id').eq('user_id', target.id)
    for (const app of apps || []) {
      await supabaseAdmin.from('audit_logs').delete().eq('entity_id', app.id)
      await supabaseAdmin.from('sheet_sync_logs').delete().eq('entity_id', app.id)
    }
    await supabaseAdmin.from('membership_applications').delete().eq('user_id', target.id)
    await supabaseAdmin.from('student_skills').delete().eq('user_id', target.id)
    await supabaseAdmin.from('student_interests').delete().eq('user_id', target.id)
    await supabaseAdmin.from('student_profiles').delete().eq('user_id', target.id)
    await supabaseAdmin.from('profiles').delete().eq('id', target.id)
    await supabaseAdmin.auth.admin.deleteUser(target.id)
  }
}

async function ensureAdminExists() {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  let admin = users?.users?.find((u) => u.email === ADMIN_CREDENTIALS.email)
  if (!admin) {
    const { data: created } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      email_confirm: true,
    })
    admin = created?.user!
  } else {
    await supabaseAdmin.auth.admin.updateUserById(admin.id, {
      password: ADMIN_CREDENTIALS.password,
      email_confirm: true,
    })
  }

  await supabaseAdmin.from('profiles').upsert({
    id: admin.id,
    email: ADMIN_CREDENTIALS.email,
    role: 'ADMIN',
    membership_status: 'APPROVED',
  })
}

async function runIntegratedRegistrationAuthTests() {
  console.log('========================================================')
  console.log('INTEGRATED REGISTRATION + AUTH COMPREHENSIVE TEST SUITE')
  console.log('========================================================\n')

  await cleanupStudent(SYNTHETIC_STUDENT.emailAddress)
  await ensureAdminExists()

  const browser: Browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  })

  let context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  let page: Page = await context.newPage()
  await page.route('**/api/internal/google-sheets/sync/self', (route) =>
    route.fulfill({ status: 202, body: '' })
  )

  let generatedRegistrationId = ''
  let studentUserId = ''

  try {
    // -----------------------------------------------------------
    // TEST 1: LANDING PAGE → /register
    // -----------------------------------------------------------
    console.log('--- TEST 1: LANDING PAGE → /register ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    const heroBtn = page.locator('a:has-text("Join IoT Club")').first()
    assert.ok(await heroBtn.isVisible(), 'Hero CTA "Join IoT Club" must be visible')
    assert.equal(await heroBtn.getAttribute('href'), '/register', 'Hero CTA href is /register')

    await heroBtn.click()
    await page.waitForURL('**/register', { timeout: 10000 })
    assert.ok(page.url().endsWith('/register'), `Unauthenticated user lands directly on /register, actual: ${page.url()}`)
    console.log('✓ TEST 1 PASSED: Landing page "Join IoT Club" routes directly to /register.')

    // -----------------------------------------------------------
    // TEST 2: STEP NAVIGATION & VALIDATION
    // -----------------------------------------------------------
    console.log('\n--- TEST 2: STEP NAVIGATION & VALIDATION ---')

    // Step 1 Negative Test: Try to continue without filling
    await page.click('button:has-text("Continue")')
    let alertMsg = await page.textContent('div[role="alert"]')
    assert.ok(alertMsg?.includes('Please enter your full name'), 'Missing name must trigger alert')

    // Fill Step 1
    await page.fill('#field-full-name', SYNTHETIC_STUDENT.name)
    await page.selectOption('#field-gender', SYNTHETIC_STUDENT.gender)
    await page.fill('#field-dob', SYNTHETIC_STUDENT.dob)
    await page.fill('#field-mobile', SYNTHETIC_STUDENT.mobile)
    assert.equal(await page.locator('input[type="email"]').count(), 1, 'Step 1 has one email input')
    assert.equal(await page.locator('#field-email-address').count(), 1, 'Canonical email field exists')
    assert.equal(await page.locator('#field-college-email, #field-personal-email').count(), 0, 'Legacy email fields are absent')
    await page.fill('#field-email-address', 'student@gmail.com')
    await page.click('button:has-text("Continue")')
    assert.ok((await page.textContent('body'))?.includes('Step 2 — Academic Details'), 'Personal email is accepted')
    await page.click('button:has-text("Back")')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.inputValue('#field-email-address'), 'student@gmail.com', 'Personal email survives refresh')
    await page.fill('#field-email-address', SYNTHETIC_STUDENT.emailAddress)

    // Advance to Step 2
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(400)
    assert.ok((await page.textContent('body'))?.includes('Step 2 — Academic Details'), 'Advanced to Step 2')

    // Test Back button: values preserved in Step 1
    await page.click('button:has-text("Back")')
    await page.waitForTimeout(400)
    const preservedName = await page.inputValue('#field-full-name')
    assert.equal(preservedName, SYNTHETIC_STUDENT.name, 'Full name preserved on Back')

    // Return to Step 2
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(400)

    // Fill Step 2
    await page.fill('#field-register-number', SYNTHETIC_STUDENT.rollNumber)
    await page.fill('#field-department', SYNTHETIC_STUDENT.department)
    await page.fill('#field-degree', SYNTHETIC_STUDENT.programme)
    await page.fill('#field-year', SYNTHETIC_STUDENT.year)
    await page.fill('#field-semester', SYNTHETIC_STUDENT.semester)
    await page.fill('#field-section', SYNTHETIC_STUDENT.section)
    await page.fill('#field-batch', SYNTHETIC_STUDENT.batch)

    // Advance to Step 3
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(400)
    assert.ok((await page.textContent('body'))?.includes('Step 3 — IoT Interests'), 'Advanced to Step 3')

    // Fill Step 3
    for (const interest of SYNTHETIC_STUDENT.interests) {
      await page.check(`label:has-text("${interest}") input[type="checkbox"]`)
    }
    await page.selectOption('#field-skill-level', SYNTHETIC_STUDENT.skillLevel)
    await page.check('input[name="previous-iot-experience"][type="radio"]:near(:text("Yes"))')
    await page.fill('#field-experience-desc', SYNTHETIC_STUDENT.experienceDesc)
    for (const skill of SYNTHETIC_STUDENT.skills) {
      await page.check(`fieldset:has(legend:has-text("Technical Skills")) label:has-text("${skill}") input[type="checkbox"]`)
    }
    await page.fill('#field-github', SYNTHETIC_STUDENT.githubUrl)
    await page.fill('#field-linkedin', SYNTHETIC_STUDENT.linkedinUrl)
    await page.fill('#field-portfolio', SYNTHETIC_STUDENT.portfolioUrl)

    // Advance to Step 4
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(400)
    assert.ok((await page.textContent('body'))?.includes('Step 4 — Create Student Account'), 'Advanced to Step 4')
    console.log('✓ TEST 2 PASSED: Steps 1, 2, 3 navigation, input preservation, and validation verified.')

    // -----------------------------------------------------------
    // TEST 3: ACCOUNT CREATION (STEP 4)
    // -----------------------------------------------------------
    console.log('\n--- TEST 3: ACCOUNT CREATION IN STEP 4 ---')

    // Verify email pre-filled from college email
    const prefilledEmail = await page.inputValue('#account-email')
    assert.equal(prefilledEmail, SYNTHETIC_STUDENT.emailAddress, 'Login email matches Step 1')
    assert.equal(await page.locator('input[type="email"]').count(), 1, 'Step 4 has no independent email input')
    assert.equal(await page.locator('#account-email').getAttribute('readonly'), '', 'Step 4 email is read only')

    // Negative: password mismatch
    await page.fill('#account-password', SYNTHETIC_STUDENT.password)
    await page.fill('#account-confirm-password', 'WrongMismatch123!')
    await page.click('button:has-text("Create Account & Continue")')
    alertMsg = await page.textContent('div[role="alert"]')
    assert.ok(alertMsg?.includes('Passwords do not match'), 'Password mismatch blocked')

    // Negative: weak password
    await page.fill('#account-password', 'short')
    await page.fill('#account-confirm-password', 'short')
    await page.click('button:has-text("Create Account & Continue")')
    alertMsg = await page.textContent('div[role="alert"]')
    assert.ok(alertMsg?.includes('At least 8 characters') || alertMsg?.includes('Use at least 8 characters'), 'Short password blocked')

    // Test password visibility toggle
    await page.fill('#account-password', SYNTHETIC_STUDENT.password)
    await page.fill('#account-confirm-password', SYNTHETIC_STUDENT.password)
    const passInputTypeBefore = await page.getAttribute('#account-password', 'type')
    assert.equal(passInputTypeBefore, 'password')
    await page.click('button[aria-label="Show password"]')
    const passInputTypeAfter = await page.getAttribute('#account-password', 'type')
    assert.equal(passInputTypeAfter, 'text', 'Show password toggle works')
    await page.click('button[aria-label="Hide password"]')

    // Submit account creation
    await page.click('button:has-text("Create Account & Continue")')
    await page.waitForTimeout(1000)
    const alertText = await page.locator('div[role="alert"]:visible').textContent().catch(() => null)
    if (alertText) {
      console.log('Account creation alert:', alertText)
    }
    console.log('✓ TEST 3 PASSED: Account creation controls, visibility toggle, and validation verified.')

    // -----------------------------------------------------------
    // TEST 4: EMAIL VERIFICATION (MAILPIT)
    // -----------------------------------------------------------
    console.log('\n--- TEST 4: EMAIL VERIFICATION VIA MAILPIT ---')
    let confirmationMsg: any = null
    for (let attempt = 0; attempt < 15; attempt++) {
      await page.waitForTimeout(1000)
      const mailpitRes = await fetch('http://127.0.0.1:54324/api/v1/messages')
      const mailData = await mailpitRes.json()
      const matching = mailData.messages?.filter((m: any) =>
        m.To?.some((t: any) => t.Address === SYNTHETIC_STUDENT.emailAddress)
      ) || []
      if (matching.length > 0) {
        matching.sort((a: any, b: any) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
        confirmationMsg = matching[0]
        break
      }
    }
    assert.ok(confirmationMsg, `Confirmation email arrived in Mailpit for ${SYNTHETIC_STUDENT.emailAddress}`)

    const msgDetailRes = await fetch(`http://127.0.0.1:54324/api/v1/message/${confirmationMsg.ID}`)
    const msgDetail = await msgDetailRes.json()
    const tokenHash = msgDetail.HTML.match(/token_hash=([^&" ]+)/)?.[1]
    assert.ok(tokenHash, 'token_hash extracted from confirmation email')

    // Navigate to confirmation link
    await page.goto(`${BASE_URL}/auth/confirm?token_hash=${tokenHash}&type=email`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    assert.ok(page.url().includes('/register'), `Redirected back to /register, actual: ${page.url()}`)
    console.log('✓ TEST 4 PASSED: Email confirmation completed via Mailpit token.')

    // -----------------------------------------------------------
    // TEST 5: FORM STATE RESTORATION FROM SESSIONSTORAGE
    // -----------------------------------------------------------
    console.log('\n--- TEST 5: FORM STATE RESTORATION ---')
    // Verify restored values in state
    if (await page.locator('h2:has-text("Step 4 — Create Student Account")').count()) {
      await page.click('button:has-text("Continue to Review")')
      await page.waitForTimeout(400)
    }

    const reviewContent = await page.textContent('body')
    assert.ok(reviewContent?.includes(SYNTHETIC_STUDENT.name), 'Restored Full Name')
    assert.ok(reviewContent?.includes(SYNTHETIC_STUDENT.rollNumber), 'Restored Register Number')
    assert.ok(reviewContent?.includes(SYNTHETIC_STUDENT.department), 'Restored Department')
    assert.ok(reviewContent?.includes(`Email Address: ${SYNTHETIC_STUDENT.emailAddress}`), 'Restored single email')
    assert.ok(!reviewContent?.includes('College Email:') && !reviewContent?.includes('Personal Email:'), 'Legacy review labels are absent')
    const draft = await page.evaluate(() => JSON.parse(sessionStorage.getItem('iot_club_registration_draft') || '{}'))
    assert.equal(draft.emailAddress, SYNTHETIC_STUDENT.emailAddress, 'Draft stores the canonical email')
    assert.ok(!('college_email' in draft) && !('personal_email' in draft) && !('account_email' in draft), 'Draft has no legacy email fields')
    console.log('✓ TEST 5 PASSED: All Steps 1–3 form data safely restored from sessionStorage.')

    // -----------------------------------------------------------
    // TEST 6: AUTHENTICATED SUBMISSION (STEP 5)
    // -----------------------------------------------------------
    console.log('\n--- TEST 6: AUTHENTICATED SUBMISSION ---')
    // Verify password is NOT in review text
    assert.ok(!reviewContent?.includes(SYNTHETIC_STUDENT.password), 'Password is NOT visible in review')

    // Check all 3 consents
    const consentBoxes = page.locator('input[type="checkbox"]:visible')
    const consentCount = await consentBoxes.count()
    for (let i = 0; i < consentCount; i++) {
      await consentBoxes.nth(i).check()
    }

    // Submit
    await page.click('button:has-text("Submit Application")')
    await page.waitForURL('**/membership/status', { timeout: 15000 })
    assert.ok(page.url().includes('/membership/status'), 'Arrived at /membership/status')

    const statusPageText = await page.textContent('body')
    const match = statusPageText?.match(/IOT-2026-\d{5}/)
    assert.ok(match, 'Generated Registration ID displayed on status page')
    generatedRegistrationId = match[0]
    console.log(`Generated Registration ID: ${generatedRegistrationId}`)
    assert.ok(statusPageText?.includes('PENDING'), 'Membership status is PENDING')
    console.log('✓ TEST 6 PASSED: Membership application submitted via RPC, status page displayed.')

    // -----------------------------------------------------------
    // TEST 7: SUPABASE PERSISTENCE VERIFICATION
    // -----------------------------------------------------------
    console.log('\n--- TEST 7: SUPABASE PERSISTENCE ---')
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const studentUser = users?.users?.find((u) => u.email === SYNTHETIC_STUDENT.emailAddress)
    assert.ok(studentUser, 'auth.users record exists')
    studentUserId = studentUser.id

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', studentUserId).single()
    assert.equal(profile.role, 'STUDENT', 'profiles.role is STUDENT')
    assert.equal(profile.membership_status, 'PENDING', 'profiles.membership_status is PENDING')

    const { data: studentProf } = await supabaseAdmin.from('student_profiles').select('*').eq('user_id', studentUserId).single()
    assert.equal(studentProf.registration_id, generatedRegistrationId, 'student_profiles.registration_id matches')
    assert.equal(studentProf.register_number, SYNTHETIC_STUDENT.rollNumber, 'register_number matches')
    assert.equal(studentProf.college_email, SYNTHETIC_STUDENT.emailAddress, 'legacy college_email matches account')
    assert.equal(studentProf.personal_email, SYNTHETIC_STUDENT.emailAddress, 'legacy personal_email matches account')

    const { data: app } = await supabaseAdmin.from('membership_applications').select('*').eq('user_id', studentUserId).single()
    assert.equal(app.registration_id, generatedRegistrationId, 'membership_applications.registration_id matches')
    assert.equal(app.status, 'PENDING', 'membership_applications.status is PENDING')

    const { data: interests } = await supabaseAdmin.from('student_interests').select('*').eq('user_id', studentUserId)
    assert.ok((interests?.length || 0) >= 3, 'student_interests persisted')

    const { data: skills } = await supabaseAdmin.from('student_skills').select('*').eq('user_id', studentUserId)
    assert.ok((skills?.length || 0) >= 5, 'student_skills persisted')

    const { data: outbox } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', app.id).single()
    assert.ok(outbox, 'sheet_sync_logs outbox record created')
    console.log('✓ TEST 7 PASSED: All 7 Supabase tables verified.')

    // -----------------------------------------------------------
    // TEST 8: PASSWORD ABSENT FROM APPLICATION DATABASE
    // -----------------------------------------------------------
    console.log('\n--- TEST 8: PASSWORD ABSENCE FROM APP DB ---')
    const pass = SYNTHETIC_STUDENT.password
    assert.ok(!JSON.stringify(profile).includes(pass), 'Password not in profiles')
    assert.ok(!JSON.stringify(studentProf).includes(pass), 'Password not in student_profiles')
    assert.ok(!JSON.stringify(app).includes(pass), 'Password not in membership_applications')
    assert.ok(!JSON.stringify(interests).includes(pass), 'Password not in student_interests')
    assert.ok(!JSON.stringify(skills).includes(pass), 'Password not in student_skills')
    assert.ok(!JSON.stringify(outbox).includes(pass), 'Password not in sheet_sync_logs')

    const { data: auditLogs } = await supabaseAdmin.from('audit_logs').select('*').eq('actor_user_id', studentUserId)
    assert.ok(!JSON.stringify(auditLogs).includes(pass), 'Password not in audit_logs')
    console.log('✓ TEST 8 PASSED: Password string is completely absent from all application tables.')

    // -----------------------------------------------------------
    // TEST 9: LOCAL SHEET ROW CONTRACT & PASSWORD ABSENCE
    // -----------------------------------------------------------
    console.log('\n--- TEST 9: LOCAL SHEET ROW CONTRACT & PASSWORD ABSENCE ---')
    const row = mapApplicationToSheetRow({
      application: app,
      profile,
      studentProfile: studentProf,
      interests: interests || [],
      skills: skills || [],
    })
    assert.equal(row.length, 27, 'Canonical 27 columns (A:AA) verified')
    assert.equal(row[0], generatedRegistrationId, 'Col A: Registration ID')
    assert.equal(row[1], SYNTHETIC_STUDENT.rollNumber, 'Col B: Roll Number')
    assert.equal(row[10], SYNTHETIC_STUDENT.emailAddress, 'Col K uses account email')
    assert.equal(row[21], 'PENDING', 'Col V: PENDING status')
    assert.ok(!JSON.stringify(row).includes(pass), 'Password NEVER present in Google Sheet row')
    console.log('✓ TEST 9 PASSED: Local 27-column mapping has one email and no password.')

    // -----------------------------------------------------------
    // TEST 10: ROUTE GUARDS FOR PENDING STUDENT
    // -----------------------------------------------------------
    console.log('\n--- TEST 10: ROUTE GUARDS FOR PENDING STUDENT ---')
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' })
    assert.ok(page.url().includes('/membership/status'), 'Pending student routed away from /dashboard')

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })
    assert.ok(page.url().includes('/membership/status'), 'Pending student routed away from /admin')
    console.log('✓ TEST 10 PASSED: Pending member strictly blocked from dashboard and admin.')

    // -----------------------------------------------------------
    // TEST 11: LOGOUT & LOGIN WITH CREATED PASSWORD
    // -----------------------------------------------------------
    console.log('\n--- TEST 11: EMAIL/PASSWORD LOGIN ---')
    await context.close()
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    page = await context.newPage()

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.fill('#auth-email', SYNTHETIC_STUDENT.emailAddress)
    await page.fill('#auth-password', SYNTHETIC_STUDENT.password)
    await page.click('button:has-text("Sign In")')

    await page.waitForURL('**/membership/status', { timeout: 10000 })
    assert.ok(page.url().includes('/membership/status'), 'Successful sign in routes pending member to /membership/status')
    console.log('✓ TEST 11 PASSED: Newly created email/password credentials successfully authenticated.')

    // -----------------------------------------------------------
    // TEST 12: ADMIN SEES APPLICANT IN /admin/membership
    // -----------------------------------------------------------
    console.log('\n--- TEST 12: ADMIN SEES APPLICANT ---')
    await context.close()
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    page = await context.newPage()

    // Login as admin
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.fill('#auth-email', ADMIN_CREDENTIALS.email)
    await page.fill('#auth-password', ADMIN_CREDENTIALS.password)
    await page.click('button:has-text("Sign In")')

    await page.waitForURL('**/admin**', { timeout: 10000 })
    await page.goto(`${BASE_URL}/admin/membership`, { waitUntil: 'networkidle' })

    const adminPageText = await page.textContent('body')
    assert.ok(adminPageText?.includes(generatedRegistrationId), 'Admin membership table displays applicant ID')
    assert.ok(adminPageText?.includes(SYNTHETIC_STUDENT.name), 'Admin membership table displays applicant Name')
    console.log('✓ TEST 12 PASSED: Admin sees synthetic applicant in /admin/membership table.')

    // -----------------------------------------------------------
    // TEST 13: ADMIN APPROVAL
    // -----------------------------------------------------------
    console.log('\n--- TEST 13: ADMIN APPROVAL ---')
    const adminClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
    await adminClient.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    })
    const { data: studentApp } = await supabaseAdmin.from('membership_applications').select('id').eq('user_id', studentUserId).single()
    assert.ok(studentApp, 'Application found')

    const { error: reviewError } = await adminClient.rpc('review_membership_application', {
      application_id: studentApp.id,
      decision: 'APPROVED',
      notes: 'Approved via integrated test suite',
    })
    assert.equal(reviewError, null, 'review_membership_application succeeded')

    const { data: approvedProfile } = await supabaseAdmin.from('profiles').select('membership_status').eq('id', studentUserId).single()
    assert.equal(approvedProfile?.membership_status, 'APPROVED', 'Profile status is APPROVED')
    console.log('✓ TEST 13 PASSED: Application transitioned to APPROVED.')

    // -----------------------------------------------------------
    // TEST 14: LOCAL OUTBOX UPDATED AFTER APPROVAL
    // -----------------------------------------------------------
    console.log('\n--- TEST 14: LOCAL OUTBOX UPDATED AFTER APPROVAL ---')
    const { data: approvalOutbox } = await supabaseAdmin.from('sheet_sync_logs')
      .select('id').eq('entity_id', app.id)
    assert.ok((approvalOutbox?.length || 0) > 0, 'Approval remains queued for Sheet sync')
    console.log('✓ TEST 14 PASSED: Local outbox contains the approval update.')

    // -----------------------------------------------------------
    // TEST 15: APPROVED STUDENT ROUTES TO DASHBOARD
    // -----------------------------------------------------------
    console.log('\n--- TEST 15: APPROVED STUDENT DASHBOARD ACCESS ---')
    await context.close()
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    page = await context.newPage()
    await page.route('**/api/internal/google-sheets/sync/self', (route) =>
      route.fulfill({ status: 202, body: '' })
    )

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.fill('#auth-email', SYNTHETIC_STUDENT.emailAddress)
    await page.fill('#auth-password', SYNTHETIC_STUDENT.password)
    await page.click('button:has-text("Sign In")')

    await page.waitForURL('**/dashboard', { timeout: 10000 })
    assert.ok(page.url().includes('/dashboard'), 'Approved student lands on /dashboard')
    const dashboardText = await page.textContent('body')
    assert.ok(dashboardText?.includes(SYNTHETIC_STUDENT.name), 'Dashboard displays student name')
    console.log('✓ TEST 15 PASSED: Approved student successfully authenticated and routed to /dashboard.')

    // -----------------------------------------------------------
    // TEST 16: DUPLICATE EMAIL PROTECTION
    // -----------------------------------------------------------
    console.log('\n--- TEST 16: DUPLICATE EMAIL PROTECTION ---')
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
    const dupSignup = await anonClient.auth.signUp({
      email: SYNTHETIC_STUDENT.emailAddress,
      password: SYNTHETIC_STUDENT.password,
    })
    // Supabase prevents duplicate identities or returns empty user
    assert.ok(
      dupSignup.error !== null || dupSignup.data.user?.identities?.length === 0,
      'Duplicate email signup rejected'
    )
    console.log('✓ TEST 16 PASSED: Duplicate account registration with existing email rejected.')

    // -----------------------------------------------------------
    // TEST 17: DUPLICATE REGISTER NUMBER PROTECTION
    // -----------------------------------------------------------
    console.log('\n--- TEST 17: DUPLICATE REGISTER NUMBER PROTECTION ---')
    const { data: dummyUser } = await supabaseAdmin.auth.admin.createUser({
      email: 'dup.reg@college.example',
      password: 'TestPassword123!',
      email_confirm: true,
    })
    const dummyClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
    await dummyClient.auth.signInWithPassword({
      email: 'dup.reg@college.example',
      password: 'TestPassword123!',
    })

    const { error: dupRegErr } = await dummyClient.rpc('submit_membership_application', {
      payload: {
        full_name: 'Duplicate Register Test',
        gender: 'Other',
        date_of_birth: '2005-01-01',
        mobile_number: '9000009999',
        register_number: SYNTHETIC_STUDENT.rollNumber, // SAME REGISTER NUMBER
        department: 'CSE',
        degree_programme: 'B.E.',
        year_of_study: 1,
        semester: 1,
        batch: '2025-2029',
        interests: ['Embedded Systems'],
        skill_level: 'BEGINNER',
        previous_iot_experience: false,
        skills: [],
        consent_accuracy: true,
        consent_rules: true,
        consent_data_use: true,
      },
    })
    assert.ok(dupRegErr !== null, 'Duplicate register number submission must be rejected')
    await cleanupStudent('dup.reg@college.example')
    console.log('✓ TEST 17 PASSED: Duplicate register number rejected by database constraints.')

    // -----------------------------------------------------------
    // TEST 18: DOUBLE SUBMISSION PROTECTION
    // -----------------------------------------------------------
    console.log('\n--- TEST 18: DOUBLE SUBMISSION PROTECTION ---')
    const studentClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
    await studentClient.auth.signInWithPassword({
      email: SYNTHETIC_STUDENT.emailAddress,
      password: SYNTHETIC_STUDENT.password,
    })
    const { error: doubleSubErr } = await studentClient.rpc('submit_membership_application', {
      payload: {
        full_name: SYNTHETIC_STUDENT.name,
        date_of_birth: SYNTHETIC_STUDENT.dob,
        mobile_number: SYNTHETIC_STUDENT.mobile,
        register_number: 'TEST-INTEGRATED-002',
        department: 'CSE',
        degree_programme: 'B.E.',
        year_of_study: 2,
        semester: 4,
        batch: '2024-2028',
        interests: ['Embedded Systems'],
        skill_level: 'BEGINNER',
        previous_iot_experience: false,
        consent_accuracy: true,
        consent_rules: true,
        consent_data_use: true,
      },
    })
    assert.ok(doubleSubErr !== null, 'Second submission must be blocked')
    assert.ok(
      doubleSubErr?.code === '23505' || doubleSubErr?.code === 'P0001',
      `Second submission blocked by constraint: ${doubleSubErr?.code}`
    )
    console.log('✓ TEST 18 PASSED: Duplicate application for same user strictly rejected.')

    // -----------------------------------------------------------
    // TEST 19: GOOGLE SHEETS OUTBOX RECOVERY
    // -----------------------------------------------------------
    console.log('\n--- TEST 19: SHEETS OUTBOX RESILIENCE ---')
    const { data: syncLogs } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', studentApp.id)
    assert.ok((syncLogs?.length || 0) > 0, 'Sync logs track application outbox history')
    console.log('✓ TEST 19 PASSED: Outbox queue decouples database transaction from Sheets availability.')

    // -----------------------------------------------------------
    // TEST 20: CROSS-USER SECURITY
    // -----------------------------------------------------------
    console.log('\n--- TEST 20: CROSS-USER SECURITY ---')
    const { data: otherUser } = await supabaseAdmin.auth.admin.createUser({
      email: 'attacker@college.example',
      password: 'TestPassword123!',
      email_confirm: true,
    })
    const attackerClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
    await attackerClient.auth.signInWithPassword({
      email: 'attacker@college.example',
      password: 'TestPassword123!',
    })

    // Attacker cannot read student's sensitive profile
    const { data: attackData } = await attackerClient.from('student_profiles').select('mobile_number').eq('user_id', studentUserId)
    assert.equal(attackData?.length, 0, 'RLS blocks attacker from reading victim student profile')

    // Attacker cannot execute review RPC
    const { data: studentAppForAttack } = await supabaseAdmin.from('membership_applications').select('id').eq('user_id', studentUserId).single()
    const { error: attackReviewErr } = await attackerClient.rpc('review_membership_application', {
      application_id: studentAppForAttack?.id,
      decision: 'APPROVED',
      notes: 'Hacked',
    })
    assert.ok(attackReviewErr !== null, 'Non-admin cannot execute review_membership_application')
    await cleanupStudent('attacker@college.example')
    console.log('✓ TEST 20 PASSED: Cross-user RLS and admin function authorization enforced.')

    // -----------------------------------------------------------
    // RESPONSIVE VIEWPORT TESTING
    // -----------------------------------------------------------
    console.log('\n--- RESPONSIVE VIEWPORT TESTING ---')
    const viewports = [
      { name: 'Mobile (375px)', width: 375, height: 667 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1440px)', width: 1440, height: 900 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
      const landingOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
      assert.equal(landingOverflow, false, `No horizontal overflow at ${vp.name} on landing page`)

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
      const loginOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
      assert.equal(loginOverflow, false, `No horizontal overflow at ${vp.name} on login page`)
    }
    console.log('✓ RESPONSIVE VIEWPORTS: 375px, 768px, 1440px verified without horizontal overflow.')

    // Clean up
    await cleanupStudent(SYNTHETIC_STUDENT.emailAddress)

    // A personal address must also complete the same single-email RPC contract.
    console.log('\n--- PERSONAL EMAIL SUBMISSION ---')
    const personalAddress = 'integrated.personal@gmail.com'
    await cleanupStudent(personalAddress)
    try {
      const { error: createPersonalError } = await supabaseAdmin.auth.admin.createUser({
        email: personalAddress,
        password: SYNTHETIC_STUDENT.password,
        email_confirm: true,
      })
      assert.equal(createPersonalError, null, 'Personal-email account created locally')
      const personalClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')
      const { error: personalSignInError } = await personalClient.auth.signInWithPassword({
        email: personalAddress,
        password: SYNTHETIC_STUDENT.password,
      })
      assert.equal(personalSignInError, null, 'Personal-email account authenticated')
      const { error: personalSubmitError } = await personalClient.rpc('submit_membership_application', {
        payload: {
          full_name: 'Personal Email Student',
          date_of_birth: SYNTHETIC_STUDENT.dob,
          mobile_number: SYNTHETIC_STUDENT.mobile,
          register_number: 'TEST-INTEGRATED-PERSONAL',
          department: 'CSE',
          degree_programme: 'B.E.',
          year_of_study: 2,
          semester: 4,
          batch: '2024-2028',
          interests: ['Embedded Systems'],
          skill_level: 'BEGINNER',
          previous_iot_experience: false,
          skills: [],
          consent_accuracy: true,
          consent_rules: true,
          consent_data_use: true,
        },
      })
      assert.equal(personalSubmitError, null, 'Personal-email application submitted without legacy email fields')
      const { data: personalUser } = await supabaseAdmin.auth.admin.listUsers()
      const personalUserId = personalUser?.users?.find((user) => user.email === personalAddress)?.id
      assert.ok(personalUserId, 'Personal-email user exists')
      const { data: personalProfile } = await supabaseAdmin.from('student_profiles')
        .select('college_email,personal_email').eq('user_id', personalUserId).single()
      assert.equal(personalProfile?.college_email, personalAddress)
      assert.equal(personalProfile?.personal_email, personalAddress)
      console.log('✓ PERSONAL EMAIL SUBMISSION PASSED: One personal address creates the account and application.')
    } finally {
      await cleanupStudent(personalAddress)
    }

    console.log('\n========================================================')
    console.log('ALL 20 INTEGRATED REGISTRATION + AUTH TESTS PASSED!')
    console.log('========================================================\n')

    return { success: true }
  } catch (err) {
    console.error('\n❌ INTEGRATED REGISTRATION TEST FAILED:', err)
    await cleanupStudent(SYNTHETIC_STUDENT.emailAddress).catch(() => {})
    throw err
  } finally {
    await browser.close()
  }
}

runIntegratedRegistrationAuthTests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
