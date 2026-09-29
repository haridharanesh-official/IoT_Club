import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    if (!line.includes('=') || line.startsWith('#')) continue
    const at = line.indexOf('=')
    const key = line.slice(0, at).trim()
    const value = line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):54321$/, 'Deletion regression must use local Supabase')
assert.ok(serviceKey, 'Local service-role key is required')

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
const email = `delete-regression-${Date.now()}@example.test`
const registrationId = `IOT-DELETE-${Date.now()}`

async function run() {
  let userId = ''
  let auditId = ''

  try {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: 'DeleteTest123!',
    email_confirm: true,
    user_metadata: { full_name: 'Delete Regression User' },
  })
  assert.equal(createError, null, `Synthetic Auth user creation failed: ${createError?.message}`)
  assert.ok(created.user)
  userId = created.user.id

  const { error: studentProfileError } = await admin.from('student_profiles').insert({
    user_id: userId,
    registration_id: registrationId,
    date_of_birth: '2005-01-01',
    mobile_number: '9000000001',
    personal_email: email,
    college_email: email,
    register_number: `DELETE-${Date.now()}`,
    department: 'CSE',
    degree_programme: 'B.E.',
    year_of_study: 2,
    semester: 3,
    batch: '2025-2029',
  })
  assert.equal(studentProfileError, null)

  const now = new Date().toISOString()
  const { data: application, error: applicationError } = await admin.from('membership_applications').insert({
    user_id: userId,
    registration_id: registrationId,
    skill_level: 'BEGINNER',
    previous_iot_experience: false,
    status: 'PENDING',
    consented_accuracy_at: now,
    consented_rules_at: now,
    consented_data_use_at: now,
  }).select('id').single()
  assert.equal(applicationError, null)
  assert.ok(application)

  assert.equal((await admin.from('student_interests').insert({ user_id: userId, interest: 'Internet of Things' })).error, null)
  assert.equal((await admin.from('student_skills').insert({ user_id: userId, category: 'HARDWARE', skill: 'ESP32', level: 'BEGINNER' })).error, null)

  const { data: audit, error: auditError } = await admin.from('audit_logs').insert({
    actor_user_id: userId,
    action: 'deletion_regression_fixture',
    entity_type: 'membership_application',
    entity_id: application.id,
  }).select('id').single()
  assert.equal(auditError, null)
  assert.ok(audit)
  auditId = audit.id

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  assert.equal(deleteError, null, `Auth Admin API deletion failed: ${deleteError?.message}`)

  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  assert.equal(users.users.some((user) => user.id === userId), false, 'Auth user must be deleted')

  for (const table of ['profiles', 'student_profiles', 'membership_applications', 'student_interests', 'student_skills'] as const) {
    const column = table === 'profiles' ? 'id' : 'user_id'
    const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true }).eq(column, userId)
    assert.equal(error, null)
    assert.equal(count, 0, `${table} owned rows must cascade-delete`)
  }

  const { data: preservedAudit, error: preservedAuditError } = await admin
    .from('audit_logs')
    .select('actor_user_id')
    .eq('id', auditId)
    .single()
  assert.equal(preservedAuditError, null)
  assert.equal(preservedAudit.actor_user_id, null, 'Historical audit row must survive with a null actor')

  await admin.from('audit_logs').delete().eq('id', auditId)
  auditId = ''
  userId = ''
  console.log('✓ Auth Admin API user deletion cascades owned data and preserves redacted audit history.')
  } finally {
    if (auditId) await admin.from('audit_logs').delete().eq('id', auditId)
    if (userId) await admin.auth.admin.deleteUser(userId)
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
