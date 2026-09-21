import type { FullApplicationData } from './types'

export const REGISTRATIONS_SHEET_NAME = 'Registrations'

export const REGISTRATIONS_SHEET_HEADERS = [
  'Registration ID',
  'Register Number',
  'Full Name',
  'Department',
  'Degree / Programme',
  'Year',
  'Semester',
  'Section',
  'Batch',
  'Mobile Number',
  'College Email',
  'Personal Email',
  'Gender',
  'Areas of Interest',
  'Skill Level',
  'Previous IoT Experience',
  'Programming Skills',
  'Hardware Skills',
  'Technology Skills',
  'GitHub URL',
  'LinkedIn URL',
  'Portfolio URL',
  'Membership Status',
  'Submitted At',
  'Reviewed At',
  'Reviewed By',
  'Review Notes',
  'Last Synced At',
] as const

export function validateSheetHeaders(actualHeaders: string[]): { valid: boolean; error?: string } {
  if (!actualHeaders || actualHeaders.length === 0) {
    return { valid: false, error: 'Worksheet is empty or has no header row.' }
  }

  // Check minimum column length
  if (actualHeaders.length < REGISTRATIONS_SHEET_HEADERS.length) {
    return {
      valid: false,
      error: `Worksheet headers length mismatch. Expected at least ${REGISTRATIONS_SHEET_HEADERS.length} columns, found ${actualHeaders.length}.`,
    }
  }

  // Verify key columns
  const normalize = (h: string) => h.trim().toLowerCase().replace(/\s+url$/, '').replace(/\s+/g, ' ')

  for (let i = 0; i < REGISTRATIONS_SHEET_HEADERS.length; i++) {
    const expected = normalize(REGISTRATIONS_SHEET_HEADERS[i])
    const actual = normalize(actualHeaders[i] || '')
    if (expected !== actual) {
      return {
        valid: false,
        error: `Incompatible header at column ${String.fromCharCode(65 + i)} (index ${i}). Expected "${REGISTRATIONS_SHEET_HEADERS[i]}", found "${actualHeaders[i]}".`,
      }
    }
  }

  return { valid: true }
}

export function mapApplicationToSheetRow(
  data: FullApplicationData,
  syncTimestamp?: string
): string[] {
  const { application, profile, studentProfile, interests, skills, reviewerProfile } = data

  const sortedInterests = [...interests]
    .map((item) => item.interest.trim())
    .filter(Boolean)
    .sort()
    .join(', ')

  const sortedProgramming = skills
    .filter((item) => item.category === 'PROGRAMMING')
    .map((item) => item.skill.trim())
    .filter(Boolean)
    .sort()
    .join(', ')

  const sortedHardware = skills
    .filter((item) => item.category === 'HARDWARE')
    .map((item) => item.skill.trim())
    .filter(Boolean)
    .sort()
    .join(', ')

  const sortedTechnology = skills
    .filter((item) => item.category === 'TECHNOLOGY')
    .map((item) => item.skill.trim())
    .filter(Boolean)
    .sort()
    .join(', ')

  const reviewedBy = reviewerProfile?.full_name?.trim() || reviewerProfile?.email?.trim() || ''

  const submittedAt = application.submitted_at ? new Date(application.submitted_at).toISOString() : ''
  const reviewedAt = application.reviewed_at ? new Date(application.reviewed_at).toISOString() : ''
  const lastSyncedAt = syncTimestamp || new Date().toISOString()

  return [
    studentProfile.registration_id || application.registration_id,
    studentProfile.register_number,
    profile.full_name || '',
    studentProfile.department,
    studentProfile.degree_programme,
    String(studentProfile.year_of_study),
    String(studentProfile.semester),
    studentProfile.section || '',
    studentProfile.batch,
    studentProfile.mobile_number,
    studentProfile.college_email || profile.email,
    studentProfile.personal_email,
    studentProfile.gender || '',
    sortedInterests,
    application.skill_level,
    application.previous_iot_experience ? 'Yes' : 'No',
    sortedProgramming,
    sortedHardware,
    sortedTechnology,
    studentProfile.github_url || '',
    studentProfile.linkedin_url || '',
    studentProfile.portfolio_url || '',
    application.status,
    submittedAt,
    reviewedAt,
    reviewedBy,
    application.review_notes || '',
    lastSyncedAt,
  ]
}
