import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .map(line => { const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1).replace(/^['"]|['"]$/g, '')] }))
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'local API only')
const makeClient = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const testPassword = process.env.LOCAL_TEST_PASSWORD
assert.match(testPassword ?? '', /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
  'set LOCAL_TEST_PASSWORD to the synthetic local account password')
const alphaEmail = 'test.alpha@college.example'
const base = {
  full_name: 'Synthetic Integrity Account', date_of_birth: '2006-06-15', gender: 'Other',
  mobile_number: '9000000002', personal_email: 'synthetic@example.test',
  register_number: 'TEST-IOT-002', department: 'Cyber Security', degree_programme: 'B.Tech',
  year_of_study: 2, semester: 3, section: 'B', batch: '2025-2029',
  reason_for_joining: 'Local integrity test', interests: ['Internet of Things'],
  skill_level: 'INTERMEDIATE', previous_iot_experience: false, experience_description: '',
  skills: [{ category: 'PROGRAMMING', skill: 'Python', level: 'INTERMEDIATE' }],
  github_url: 'https://github.com/example-test', linkedin_url: '', portfolio_url: '',
  consent_accuracy: true, consent_rules: true, consent_data_use: true,
}

async function confirmLocalSignup(client, email) {
  const signup = await client.auth.signUp({ email, password: testPassword })
  assert.equal(signup.error, null, 'synthetic signup')
  const list = await (await fetch('http://127.0.0.1:54324/api/v1/messages')).json()
  const message = list.messages.find(item => item.To?.some(recipient => recipient.Address === email))
  assert.ok(message, 'local confirmation mail exists')
  const detail = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)).json()
  const hash = detail.HTML.match(/token_hash=([^&" ]+)/)?.[1]
  assert.ok(hash, 'local confirmation hash exists')
  const confirmed = await client.auth.verifyOtp({ token_hash: hash, type: 'email' })
  assert.equal(confirmed.error, null, 'email confirmed')
}

const suffix = Date.now()
const alpha = makeClient()
assert.equal((await alpha.auth.signInWithPassword({ email: alphaEmail, password: testPassword })).error, null)
const duplicateSameAccount = await alpha.rpc('submit_membership_application', { payload: base })
assert.ok(duplicateSameAccount.error, 'same account cannot register twice')
const duplicateEmail = await makeClient().auth.signUp({ email: alphaEmail, password: testPassword })

const beta = makeClient()
await confirmLocalSignup(beta, `integrity-beta-${suffix}@example.test`)
const invalidCases = [
  ['empty name', { full_name: '' }], ['empty DOB', { date_of_birth: '' }],
  ['invalid mobile', { mobile_number: 'abc' }], ['invalid personal email', { personal_email: 'bad' }],
  ['empty register number', { register_number: '' }], ['empty department', { department: '' }],
  ['invalid year', { year_of_study: 7 }], ['invalid semester', { semester: 13 }],
  ['no interests', { interests: [] }], ['no skill level', { skill_level: null }],
  ['no experience answer', { previous_iot_experience: null }],
  ['experience description missing', { previous_iot_experience: true, experience_description: '' }],
  ['invalid GitHub URL', { github_url: 'javascript:alert(1)' }],
  ['missing consent', { consent_rules: false }],
]
for (const [name, patch] of invalidCases) {
  const result = await beta.rpc('submit_membership_application', { payload: { ...base, ...patch } })
  assert.ok(result.error, `${name} must fail`)
}
const duplicateRegister = await beta.rpc('submit_membership_application', {
  payload: { ...base, register_number: 'test-iot-001' },
})
assert.ok(duplicateRegister.error, 'case-folded register number duplicate denied')
const duplicateSkill = await beta.rpc('submit_membership_application', {
  payload: { ...base, skills: [...base.skills, ...base.skills] },
})
assert.ok(duplicateSkill.error, 'duplicate normalized skill row denied')
const betaProfile = await beta.from('profiles').select('full_name,role,membership_status').single()
const betaStudent = await beta.from('student_profiles').select('user_id')
const betaApplications = await beta.from('membership_applications').select('id')
assert.equal(betaProfile.data?.full_name, null, 'failed transactions roll back profile update')
assert.equal(betaStudent.data?.length, 0, 'failed transactions leave no student profile')
assert.equal(betaApplications.data?.length, 0, 'failed transactions leave no application')

const gamma = makeClient()
await confirmLocalSignup(gamma, `integrity-gamma-${suffix}@example.test`)
const tampered = { ...base, register_number: `TEST-IOT-${suffix}`,
  role: 'SUPER_ADMIN', membership_status: 'APPROVED', registration_id: 'IOT-1900-00001',
  user_id: '00000000-0000-0000-0000-000000000000' }
const doubleResults = await Promise.all([
  gamma.rpc('submit_membership_application', { payload: tampered }),
  gamma.rpc('submit_membership_application', { payload: tampered }),
])
assert.equal(doubleResults.filter(result => !result.error).length, 1, 'one double-submit succeeds')
assert.equal(doubleResults.filter(result => result.error).length, 1, 'other double-submit fails')
const gammaProfile = await gamma.from('profiles').select('role,membership_status').single()
const gammaStudent = await gamma.from('student_profiles').select('registration_id').single()
const gammaApplications = await gamma.from('membership_applications').select('registration_id,status')
assert.equal(gammaProfile.data?.role, 'STUDENT')
assert.equal(gammaProfile.data?.membership_status, 'PENDING')
assert.match(gammaStudent.data?.registration_id ?? '', /^IOT-\d{4}-\d{5,}$/)
assert.notEqual(gammaStudent.data?.registration_id, tampered.registration_id)
assert.equal(gammaApplications.data?.length, 1)
assert.equal(gammaApplications.data?.[0]?.status, 'PENDING')
const anonymous = await makeClient().rpc('submit_membership_application', { payload: base })
assert.ok(anonymous.error, 'anonymous caller denied')

console.log(JSON.stringify({
  validation_cases_rejected: invalidCases.length,
  same_account_duplicate_rejected: true,
  duplicate_register_number_rejected: true,
  duplicate_skill_atomic_rollback: true,
  concurrent_double_submit_one_application: true,
  tampered_role_status_id_ignored: true,
  anonymous_submit_denied: true,
  duplicate_email_signup_returned_error: !!duplicateEmail.error,
}))
