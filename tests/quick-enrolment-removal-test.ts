import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { chromium, type Browser, type Page } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'
import { createGoogleSheetsAdapterFromEnv } from '../lib/integrations/google-sheets/client'
import { drainGoogleSheetsOutbox } from '../lib/integrations/google-sheets/drain'

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
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const SYNTHETIC_STUDENT = {
  name: 'Landing Registration Test',
  collegeEmail: 'landing.registration@college.example',
  personalEmail: 'landing.registration@example.com',
  password: 'TestPassword123!',
  rollNumber: 'TEST-LANDING-001',
  mobile: '9000002001',
  dob: '2005-04-10',
  gender: 'Female',
  department: 'Electronics & Communication Engineering',
  programme: 'B.E.',
  year: '2',
  semester: '3',
  section: 'A',
  batch: '2025-2029',
  reason: 'Passionate about LoRa telemetry, ESP32 nodes, and connected hardware sensors.',
  interests: ['Internet of Things', 'Embedded Systems'],
  skillLevel: 'INTERMEDIATE' as const,
  experienceDesc: 'Built wireless environmental monitor using ESP32 and MQTT.',
  skills: ['C++', 'Python', 'ESP32', 'MQTT'],
  githubUrl: 'https://github.com/landing-test-student',
  linkedinUrl: 'https://linkedin.com/in/landing-test-student',
  portfolioUrl: 'https://landing-test.example.com',
}

async function cleanupSyntheticStudent(email: string) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const target = users?.users?.find((u) => u.email === email)
  if (target) {
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

async function runQuickEnrolmentRemovalTest() {
  console.log('========================================================')
  console.log('TESTING QUICK ENROLMENT REMOVAL & CANONICAL REGISTRATION')
  console.log('========================================================\n')

  await cleanupSyntheticStudent(SYNTHETIC_STUDENT.collegeEmail)

  const browser: Browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page: Page = await context.newPage()

  try {
    // -----------------------------------------------------------
    // STEP 1: TEST LANDING PAGE "Join IoT Club" CTA
    // -----------------------------------------------------------
    console.log('--- TEST 1: LANDING PAGE HERO CTA ---')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    // Find the visible green "Join IoT Club" hero CTA
    const heroJoinBtn = page.locator('a:has-text("Join IoT Club")').first()
    assert.ok(await heroJoinBtn.isVisible(), 'Hero "Join IoT Club" CTA must be visible')
    const heroHref = await heroJoinBtn.getAttribute('href')
    assert.equal(heroHref, '/register', 'Hero CTA href must be "/register"')

    // Click hero button and wait for navigation
    await heroJoinBtn.click()
    await page.waitForURL(/\/(register|login)/, { timeout: 10000 })

    // Unauthenticated visitor navigating to /register is redirected to /login
    assert.ok(
      page.url().includes('/register') || page.url().includes('/login'),
      `Clicking "Join IoT Club" must route directly to /register (or /login if unauth), actual: ${page.url()}`
    )

    // Verify NO Quick Enrolment modal appears
    const modalHeading = page.locator('text=Quick Enrolment')
    assert.equal(await modalHeading.count(), 0, 'No "Quick Enrolment" modal should ever appear')
    console.log('✓ TEST 1: Hero "Join IoT Club" navigates to /register with zero Quick Enrolment modal.')

    // -----------------------------------------------------------
    // STEP 2: AUDIT ALL PUBLIC REGISTRATION CTAs
    // -----------------------------------------------------------
    console.log('\n--- TEST 2: AUDITING ALL PUBLIC REGISTRATION CTAs ---')

    // Check /apply direct redirect
    const applyRes = await fetch(`${BASE_URL}/apply`, { redirect: 'manual' })
    assert.equal(applyRes.status, 307, '/apply must return 307 Temporary Redirect')
    assert.equal(applyRes.headers.get('location'), '/register', '/apply must redirect to /register')
    console.log('✓ /apply -> 307 -> /register verified.')

    // Audit Navbar CTA
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    const navApply = page.locator('header a:has-text("Apply to Join")').first()
    assert.ok(await navApply.isVisible(), 'Navbar Apply CTA visible')
    assert.equal(await navApply.getAttribute('href'), '/register', 'Navbar Apply CTA must point to /register')

    // Audit Footer CTAs
    const footerJoin = page.locator('footer a:has-text("Join IoT Club")').first()
    assert.equal(await footerJoin.getAttribute('href'), '/register', 'Footer Join CTA must point to /register')

    const footerJoinClub = page.locator('footer a:has-text("Join Club")').first()
    assert.equal(await footerJoinClub.getAttribute('href'), '/register', 'Footer Join Club link must point to /register')

    const footerPortal = page.locator('footer a:has-text("Registration Portal")').first()
    assert.equal(await footerPortal.getAttribute('href'), '/register', 'Footer Registration Portal link must point to /register')

    // Audit Bottom CTA on Landing Page
    const bottomJoin = page.locator('a:has-text("Join the IoT Club →")').first()
    assert.equal(await bottomJoin.getAttribute('href'), '/register', 'Bottom "Join the IoT Club →" must point to /register')

    const bottomFull = page.locator('a:has-text("Full Registration Portal")').first()
    assert.equal(await bottomFull.getAttribute('href'), '/register', 'Bottom "Full Registration Portal" must point to /register')

    // Audit About Page CTA
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' })
    const aboutJoin = page.locator('a:has-text("Join IoT Club")').first()
    assert.equal(await aboutJoin.getAttribute('href'), '/register', 'About page Join CTA must point to /register')

    console.log('✓ TEST 2: All 8 public registration CTAs strictly resolve to /register.')

    // -----------------------------------------------------------
    // STEP 3: NEW STUDENT EMAIL SIGNUP & MAILPIT CONFIRMATION
    // -----------------------------------------------------------
    console.log('\n--- TEST 3: NEW STUDENT EMAIL SIGNUP ---')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })

    // Switch to "Create Account" tab
    await page.click('button:has-text("Create Account")')
    await page.fill('input[type="email"]', SYNTHETIC_STUDENT.collegeEmail)
    await page.fill('input[type="password"]', SYNTHETIC_STUDENT.password)
    await page.click('form button[type="submit"]')

    // Wait for signup notice
    await page.waitForSelector('text=Check your email to confirm your account', { timeout: 10000 })
    console.log('Signup completed. Fetching Mailpit confirmation...')

    // Wait for email in Mailpit
    await page.waitForTimeout(1500)
    const mailpitRes = await fetch('http://127.0.0.1:54324/api/v1/messages')
    const mailData = await mailpitRes.json()
    const confirmationMsg = mailData.messages?.find((m: any) =>
      m.To?.some((t: any) => t.Address === SYNTHETIC_STUDENT.collegeEmail)
    )
    assert.ok(confirmationMsg, `Confirmation email must arrive in Mailpit for ${SYNTHETIC_STUDENT.collegeEmail}`)

    const msgDetailRes = await fetch(`http://127.0.0.1:54324/api/v1/message/${confirmationMsg.ID}`)
    const msgDetail = await msgDetailRes.json()
    const tokenHash = msgDetail.HTML.match(/token_hash=([^&" ]+)/)?.[1]
    assert.ok(tokenHash, 'token_hash must be present in confirmation email')

    // Confirm email in browser
    await page.goto(`${BASE_URL}/auth/confirm?token_hash=${tokenHash}&type=email`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    assert.ok(page.url().includes('/register'), `Confirmed student must land on /register, actual: ${page.url()}`)
    console.log('✓ TEST 3: Email confirmed via Mailpit token; landed on canonical /register.')

    // -----------------------------------------------------------
    // STEP 4: COMPLETE FULL 5-STEP REGISTRATION
    // -----------------------------------------------------------
    console.log('\n--- TEST 4: COMPLETE FULL 5-STEP REGISTRATION ---')

    // Step 1: Personal Details
    await page.fill('label:has-text("Full name") input', SYNTHETIC_STUDENT.name)
    await page.fill('label:has-text("Date of birth") input', SYNTHETIC_STUDENT.dob)
    await page.fill('label:has-text("Gender") input', SYNTHETIC_STUDENT.gender)
    await page.fill('label:has-text("Mobile number") input', SYNTHETIC_STUDENT.mobile)
    await page.fill('label:has-text("Personal email") input', SYNTHETIC_STUDENT.personalEmail)
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(500)

    // Step 2: Academic Details
    await page.fill('label:has-text("Register number") input', SYNTHETIC_STUDENT.rollNumber)
    await page.fill('label:has-text("Department") input', SYNTHETIC_STUDENT.department)
    await page.fill('label:has-text("Degree / programme") input', SYNTHETIC_STUDENT.programme)
    await page.fill('label:has-text("Year of study") input', SYNTHETIC_STUDENT.year)
    await page.fill('label:has-text("Semester") input', SYNTHETIC_STUDENT.semester)
    await page.fill('label:has-text("Section") input', SYNTHETIC_STUDENT.section)
    await page.fill('label:has-text("Batch") input', SYNTHETIC_STUDENT.batch)
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(500)

    // Step 3: IoT & Skills Details
    await page.fill('textarea', SYNTHETIC_STUDENT.reason)
    for (const interest of SYNTHETIC_STUDENT.interests) {
      await page.check(`label:has-text("${interest}") input[type="checkbox"]`)
    }
    await page.selectOption('select', SYNTHETIC_STUDENT.skillLevel)
    await page.check('input[name="previous-experience"][type="radio"]:near(:text("Yes"))')
    await page.fill('label:has-text("Experience description") input', SYNTHETIC_STUDENT.experienceDesc)
    for (const skill of SYNTHETIC_STUDENT.skills) {
      await page.check(`label:has-text("${skill}") input[type="checkbox"]`)
    }
    await page.fill('label:has-text("GitHub URL") input', SYNTHETIC_STUDENT.githubUrl)
    await page.fill('label:has-text("LinkedIn URL") input', SYNTHETIC_STUDENT.linkedinUrl)
    await page.fill('label:has-text("Portfolio URL") input', SYNTHETIC_STUDENT.portfolioUrl)
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(500)

    // Step 4: Account Details
    await page.click('button:has-text("Continue")')
    await page.waitForTimeout(500)

    // Step 5: Review & Consent
    const reviewText = await page.textContent('body')
    assert.ok(reviewText?.includes(SYNTHETIC_STUDENT.name), 'Review displays full name')
    assert.ok(reviewText?.includes(SYNTHETIC_STUDENT.rollNumber), 'Review displays roll number')

    // Check all 3 consent boxes
    const consentBoxes = page.locator('input[type="checkbox"]')
    const count = await consentBoxes.count()
    for (let i = 0; i < count; i++) {
      await consentBoxes.nth(i).check()
    }

    // Submit
    await page.click('button:has-text("Submit application")')
    await page.waitForURL('**/membership/status', { timeout: 15000 })
    assert.ok(page.url().includes('/membership/status'), 'Routes to /membership/status upon submission')

    // Extract generated Registration ID
    const statusContent = await page.textContent('body')
    const regIdMatch = statusContent?.match(/IOT-2026-\d{5}/)
    assert.ok(regIdMatch, 'Generated Registration ID must be displayed on status page')
    const generatedRegId = regIdMatch[0]
    console.log(`Generated Registration ID: ${generatedRegId}`)
    assert.ok(statusContent?.includes('PENDING'), 'Status must display PENDING')
    console.log('✓ TEST 4: Full 5-step registration submitted, routed to /membership/status.')

    // -----------------------------------------------------------
    // STEP 5: VERIFY SUPABASE DIRECTLY
    // -----------------------------------------------------------
    console.log('\n--- TEST 5: VERIFY SUPABASE PERSISTENCE ---')
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const registeredUser = users?.users?.find((u) => u.email === SYNTHETIC_STUDENT.collegeEmail)
    assert.ok(registeredUser, 'auth.users record created')

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', registeredUser.id).single()
    assert.equal(profile.role, 'STUDENT', 'role must be STUDENT')
    assert.equal(profile.membership_status, 'PENDING', 'membership_status must be PENDING')

    const { data: studentProf } = await supabaseAdmin.from('student_profiles').select('*').eq('user_id', registeredUser.id).single()
    assert.equal(studentProf.registration_id, generatedRegId, 'student_profiles.registration_id matches')
    assert.equal(studentProf.register_number, SYNTHETIC_STUDENT.rollNumber, 'register_number matches')

    const { data: app } = await supabaseAdmin.from('membership_applications').select('*').eq('user_id', registeredUser.id).single()
    assert.equal(app.registration_id, generatedRegId, 'membership_applications.registration_id matches')
    assert.equal(app.status, 'PENDING', 'membership_applications.status is PENDING')

    const { data: interests } = await supabaseAdmin.from('student_interests').select('*').eq('user_id', registeredUser.id)
    assert.ok((interests?.length || 0) >= 2, 'student_interests persisted')

    const { data: skills } = await supabaseAdmin.from('student_skills').select('*').eq('user_id', registeredUser.id)
    assert.ok((skills?.length || 0) >= 4, 'student_skills persisted')

    const { data: outbox } = await supabaseAdmin.from('sheet_sync_logs').select('*').eq('entity_id', app.id).single()
    assert.ok(outbox, 'sheet_sync_logs outbox record created')
    console.log(`Outbox sync status: ${outbox.sync_status}`)
    console.log('✓ TEST 5: All 7 Supabase tables verified.')

    // -----------------------------------------------------------
    // STEP 6: VERIFY GOOGLE SHEETS SYNCHRONIZATION
    // -----------------------------------------------------------
    console.log('\n--- TEST 6: VERIFY GOOGLE SHEETS MIRROR ---')
    // Wait for self-sync to finish or drain pending outbox
    let isSynced = false
    for (let i = 0; i < 25; i++) {
      const { data: syncLog } = await supabaseAdmin.from('sheet_sync_logs').select('sync_status').eq('entity_id', app.id).single()
      if (syncLog?.sync_status === 'SYNCED') {
        isSynced = true
        break
      }
      if (syncLog?.sync_status === 'PENDING') {
        const drainResult = await drainGoogleSheetsOutbox()
        console.log('Outbox drain summary:', drainResult)
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    assert.ok(isSynced, 'sheet_sync_logs must reach SYNCED')

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
    const sheetName = process.env.GOOGLE_SHEETS_REGISTRATION_TAB || 'Registrations'
    const adapter = createGoogleSheetsAdapterFromEnv()
    const rows = await adapter.getAllRows(spreadsheetId, sheetName)
    const matchingRows = rows.filter((r) => r[0] === generatedRegId)

    assert.equal(matchingRows.length, 1, `Expected exactly 1 Google Sheet row for ${generatedRegId}, found ${matchingRows.length}`)
    const row = matchingRows[0]

    // Verify all canonical columns
    assert.equal(row[0], generatedRegId, 'Col A matches Registration ID')
    assert.equal(row[1], SYNTHETIC_STUDENT.rollNumber, 'Col B matches Roll Number')
    assert.equal(row[2], SYNTHETIC_STUDENT.name, 'Col C matches Full Name')
    assert.equal(row[3], SYNTHETIC_STUDENT.department, 'Col D matches Department')
    assert.equal(row[4], SYNTHETIC_STUDENT.programme, 'Col E matches Programme')
    assert.equal(row[5], SYNTHETIC_STUDENT.year, 'Col F matches Year')
    assert.equal(row[6], SYNTHETIC_STUDENT.semester, 'Col G matches Semester')
    assert.equal(row[7], SYNTHETIC_STUDENT.section, 'Col H matches Section')
    assert.equal(row[8], SYNTHETIC_STUDENT.batch, 'Col I matches Batch')
    assert.equal(row[9], SYNTHETIC_STUDENT.mobile, 'Col J matches Mobile')
    assert.equal(row[10], SYNTHETIC_STUDENT.collegeEmail, 'Col K matches College Email')
    assert.equal(row[11], SYNTHETIC_STUDENT.personalEmail, 'Col L matches Personal Email')
    assert.equal(row[12], SYNTHETIC_STUDENT.gender, 'Col M matches Gender')
    assert.equal(row[14], SYNTHETIC_STUDENT.skillLevel, 'Col O matches Skill Level')
    assert.equal(row[15], 'Yes', 'Col P matches Previous Experience')
    assert.equal(row[19], SYNTHETIC_STUDENT.githubUrl, 'Col T matches GitHub URL')
    assert.equal(row[20], SYNTHETIC_STUDENT.linkedinUrl, 'Col U matches LinkedIn URL')
    assert.equal(row[21], SYNTHETIC_STUDENT.portfolioUrl, 'Col V matches Portfolio URL')
    assert.equal(row[22], 'PENDING', 'Col W matches PENDING status')
    assert.ok(row[23], 'Col X Submitted At populated')
    assert.ok(row[27], 'Col AB Last Synced At populated')

    console.log(`✓ TEST 6: Google Sheet verified (Row ID: ${generatedRegId}, Zero duplicates).`)

    // -----------------------------------------------------------
    // STEP 7: VERIFY /membership/status PERSISTENCE ON REFRESH
    // -----------------------------------------------------------
    console.log('\n--- TEST 7: MEMBERSHIP STATUS PAGE PERSISTENCE ---')
    await page.reload({ waitUntil: 'networkidle' })
    const refreshedBody = await page.textContent('body')
    assert.ok(refreshedBody?.includes(generatedRegId), 'Registration ID remains on reload')
    assert.ok(refreshedBody?.includes('PENDING'), 'Status remains PENDING on reload')
    console.log('✓ TEST 7: /membership/status persistently reflects PENDING registration.')

    // -----------------------------------------------------------
    // STEP 8: RESPONSIVE VIEWPORT TESTING
    // -----------------------------------------------------------
    console.log('\n--- TEST 8: RESPONSIVE VIEWPORT TESTING (375px, 768px, 1440px) ---')
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

      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' })
      // For registered student, /register routes to /membership/status
      const statusOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
      assert.equal(statusOverflow, false, `No horizontal overflow at ${vp.name} on status page`)
    }
    console.log('✓ TEST 8: Mobile (375px), Tablet (768px), and Desktop (1440px) render without overflow.')

    // Cleanup synthetic student after test
    await cleanupSyntheticStudent(SYNTHETIC_STUDENT.collegeEmail)

    console.log('\n========================================================')
    console.log('QUICK ENROLMENT REMOVAL & REGISTRATION VERIFIED 100%!')
    console.log('========================================================')

    return {
      success: true,
      registrationId: generatedRegId,
    }
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err)
    await cleanupSyntheticStudent(SYNTHETIC_STUDENT.collegeEmail).catch(() => {})
    throw err
  } finally {
    await browser.close()
  }
}

runQuickEnrolmentRemovalTest()
  .then((res) => {
    console.log('\nRESULT:', JSON.stringify(res, null, 2))
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
