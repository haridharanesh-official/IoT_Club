import assert from 'node:assert/strict'
import test from 'node:test'
import { mapApplicationToSheetRow, REGISTRATIONS_SHEET_HEADERS } from '../lib/integrations/google-sheets/mapper.ts'

function applicationFor(email) {
  return {
    application: {
      registration_id: 'IOT-2026-00001', skill_level: 'BEGINNER',
      previous_iot_experience: false, status: 'PENDING',
      submitted_at: '2026-09-29T00:00:00Z', reviewed_at: null, review_notes: null,
    },
    profile: { full_name: 'Test Student', email },
    studentProfile: {
      registration_id: 'IOT-2026-00001', register_number: 'TEST-001',
      department: 'CSE', degree_programme: 'B.E.', year_of_study: 2,
      semester: 4, section: null, batch: '2024-2028', mobile_number: '9876543210',
      college_email: email, personal_email: email, gender: null,
      github_url: null, linkedin_url: null, portfolio_url: null,
    },
    interests: [], skills: [],
  }
}

for (const email of ['student@siet.ac.in', 'student@gmail.com', 'student@outlook.com']) {
  test(`27-column sheet preserves one supplied email: ${email}`, () => {
    const row = mapApplicationToSheetRow(applicationFor(email), '2026-09-29T00:00:00Z')
    assert.equal(REGISTRATIONS_SHEET_HEADERS.length, 27)
    assert.equal(row.length, 27)
    assert.equal(row[10], email)
    assert.equal(REGISTRATIONS_SHEET_HEADERS[10], 'Email Address')
  })
}

test('legacy missing personal email uses the authenticated profile email', () => {
  const data = applicationFor('student@gmail.com')
  data.studentProfile.personal_email = ''
  assert.equal(mapApplicationToSheetRow(data)[10], 'student@gmail.com')
})
