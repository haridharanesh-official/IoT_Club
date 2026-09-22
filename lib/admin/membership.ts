import { SupabaseClient } from '@supabase/supabase-js'

export type MembershipApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface CategorizedSkillItem {
  skill: string
  level: string
}

export interface HydratedAdminApplication {
  id: string
  registrationId: string
  status: MembershipApplicationStatus
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  reviewerName: string | null
  reviewerEmail: string | null
  reviewNotes: string | null
  skillLevel: string
  previousIotExperience: boolean
  experienceDescription: string | null
  reasonForJoining: string

  // Student Profile
  userId: string
  fullName: string
  dateOfBirth: string | null
  gender: string | null
  mobileNumber: string | null
  personalEmail: string | null
  collegeEmail: string | null
  registerNumber: string | null
  department: string | null
  degreeProgramme: string | null
  yearOfStudy: number | null
  semester: number | null
  section: string | null
  batch: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null

  // Collections
  interests: string[]
  categorizedSkills: {
    programming: CategorizedSkillItem[]
    hardware: CategorizedSkillItem[]
    technology: CategorizedSkillItem[]
  }

  // Google Sheet Outbox Sync
  sheetSync: {
    status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
    attemptCount: number
    lastAttemptAt: string | null
    syncedAt: string | null
    errorMessage: string | null
  }
}

export interface ApplicationFilterParams {
  status?: string
  department?: string
  year?: string
  batch?: string
  search?: string
  sort?: 'newest' | 'oldest' | 'registration_id' | 'name'
  page?: number
  pageSize?: number
}

export interface PaginatedAdminApplications {
  applications: HydratedAdminApplication[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
}

export interface MembershipDashboardCounts {
  total: number
  pending: number
  approved: number
  rejected: number
  suspended: number
}

export interface AuditHistoryItem {
  id: string
  timestamp: string
  action: string
  previousStatus: string | null
  newStatus: string | null
  actorName: string
  actorEmail: string
  notes: string | null
}

/**
 * Fetch authoritative membership summary counts from PostgreSQL
 */
export async function getMembershipDashboardCounts(
  supabase: SupabaseClient
): Promise<MembershipDashboardCounts> {
  const [totalRes, pendingRes, approvedRes, rejectedRes, suspendedRes] = await Promise.all([
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }),
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'SUSPENDED'),
  ])

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
    suspended: suspendedRes.count ?? 0,
  }
}

/**
 * Fetch hydrated, filtered, searched, sorted, and paginated membership applications.
 * Never leaks raw passwords, service role keys, or credentials.
 */
export async function getAdminMembershipApplications(
  supabase: SupabaseClient,
  params: ApplicationFilterParams = {}
): Promise<PaginatedAdminApplications> {
  const status = params.status && params.status !== 'ALL' ? params.status : null
  const department = params.department && params.department !== 'ALL' ? params.department : null
  const year = params.year && params.year !== 'ALL' ? Number(params.year) : null
  const batch = params.batch && params.batch !== 'ALL' ? params.batch : null
  const search = params.search?.trim() || null
  const sort = params.sort || 'newest'
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 20))

  // Determine user ID filter candidates if search or student profile filters are active
  let matchingUserIds: string[] | null = null

  if (department || year || batch || search) {
    let studentQuery = supabase.from('student_profiles').select('user_id, register_number, college_email, registration_id')
    if (department) studentQuery = studentQuery.eq('department', department)
    if (year) studentQuery = studentQuery.eq('year_of_study', year)
    if (batch) studentQuery = studentQuery.eq('batch', batch)

    const { data: matchedStudents } = await studentQuery
    let candidateUserIds = new Set<string>((matchedStudents || []).map((s) => s.user_id))

    if (search) {
      const searchLower = search.toLowerCase()
      // Filter matched students by registration_id, register_number, college_email
      const studentMatchIds = new Set<string>(
        (matchedStudents || [])
          .filter(
            (s) =>
              s.registration_id?.toLowerCase().includes(searchLower) ||
              s.register_number?.toLowerCase().includes(searchLower) ||
              s.college_email?.toLowerCase().includes(searchLower)
          )
          .map((s) => s.user_id)
      )

      // Also search profiles by full_name
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', `%${search}%`)

      for (const p of matchedProfiles || []) {
        // If department/year/batch filters were active, must also match candidateUserIds
        if (!department && !year && !batch) {
          studentMatchIds.add(p.id)
        } else if (candidateUserIds.has(p.id)) {
          studentMatchIds.add(p.id)
        }
      }

      candidateUserIds = studentMatchIds
    }

    matchingUserIds = Array.from(candidateUserIds)
  }

  // Build the primary membership_applications query
  let query = supabase
    .from('membership_applications')
    .select(
      'id, registration_id, status, submitted_at, reviewed_at, reviewed_by, review_notes, skill_level, previous_iot_experience, experience_description, reason_for_joining, user_id, profiles!membership_applications_user_id_fkey(full_name, email)',
      { count: 'exact' }
    )

  if (status) {
    query = query.eq('status', status)
  }

  if (matchingUserIds !== null) {
    if (matchingUserIds.length === 0) {
      return {
        applications: [],
        totalCount: 0,
        currentPage: page,
        pageSize,
        totalPages: 0,
      }
    }
    query = query.in('user_id', matchingUserIds)
  }

  // Sorting
  switch (sort) {
    case 'oldest':
      query = query.order('submitted_at', { ascending: true })
      break
    case 'registration_id':
      query = query.order('registration_id', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('submitted_at', { ascending: false })
      break
  }

  // Pagination bounds
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: appRows, count, error } = await query

  if (error || !appRows) {
    console.error('Error fetching admin membership applications:', error)
    return {
      applications: [],
      totalCount: 0,
      currentPage: page,
      pageSize,
      totalPages: 0,
    }
  }

  const totalCount = count ?? appRows.length
  const totalPages = Math.ceil(totalCount / pageSize)

  if (appRows.length === 0) {
    return {
      applications: [],
      totalCount,
      currentPage: page,
      pageSize,
      totalPages,
    }
  }

  const pageUserIds = appRows.map((r) => r.user_id)
  const pageAppIds = appRows.map((r) => r.id)
  const reviewerIds = Array.from(
    new Set(appRows.map((r) => r.reviewed_by).filter((id): id is string => Boolean(id)))
  )

  // Hydrate collections in parallel
  const [studentsRes, interestsRes, skillsRes, syncRes, reviewersRes] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('user_id, date_of_birth, gender, mobile_number, personal_email, college_email, register_number, department, degree_programme, year_of_study, semester, section, batch, github_url, linkedin_url, portfolio_url')
      .in('user_id', pageUserIds),
    supabase.from('student_interests').select('user_id, interest').in('user_id', pageUserIds),
    supabase.from('student_skills').select('user_id, category, skill, level').in('user_id', pageUserIds),
    supabase
      .from('sheet_sync_logs')
      .select('entity_id, sync_status, attempt_count, last_attempt_at, synced_at, error_message')
      .in('entity_id', pageAppIds),
    reviewerIds.length > 0
      ? supabase.from('profiles').select('id, full_name, email').in('id', reviewerIds)
      : Promise.resolve({ data: [] }),
  ])

  const studentsMap = new Map((studentsRes.data || []).map((s) => [s.user_id, s]))
  const syncMap = new Map((syncRes.data || []).map((s) => [s.entity_id, s]))
  const reviewersMap = new Map((reviewersRes.data || []).map((r) => [r.id, r]))

  const applications: HydratedAdminApplication[] = appRows.map((item) => {
    const rawProfile = item.profiles as unknown as { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile
    const student = studentsMap.get(item.user_id)
    const syncLog = syncMap.get(item.id)
    const reviewer = item.reviewed_by ? reviewersMap.get(item.reviewed_by) : null

    const studentInterests = (interestsRes.data || [])
      .filter((i) => i.user_id === item.user_id)
      .map((i) => i.interest)

    const studentSkills = (skillsRes.data || []).filter((s) => s.user_id === item.user_id)
    const programmingSkills: CategorizedSkillItem[] = []
    const hardwareSkills: CategorizedSkillItem[] = []
    const technologySkills: CategorizedSkillItem[] = []

    for (const s of studentSkills) {
      const itemSkill = { skill: s.skill, level: s.level }
      if (s.category === 'PROGRAMMING') programmingSkills.push(itemSkill)
      else if (s.category === 'HARDWARE') hardwareSkills.push(itemSkill)
      else if (s.category === 'TECHNOLOGY') technologySkills.push(itemSkill)
    }

    // Sanitize error message to never leak raw tokens or internal paths
    let sanitizedError: string | null = null
    if (syncLog?.error_message) {
      sanitizedError = syncLog.error_message
        .replace(/https?:\/\/[^\s]+/g, '[URL]')
        .replace(/[a-zA-Z0-9_-]{30,}/g, '[REDACTED]')
        .slice(0, 300)
    }

    return {
      id: item.id,
      registrationId: item.registration_id,
      status: item.status as MembershipApplicationStatus,
      submittedAt: item.submitted_at,
      reviewedAt: item.reviewed_at,
      reviewedBy: item.reviewed_by,
      reviewerName: reviewer?.full_name || null,
      reviewerEmail: reviewer?.email || null,
      reviewNotes: item.review_notes,
      skillLevel: item.skill_level,
      previousIotExperience: item.previous_iot_experience,
      experienceDescription: item.experience_description,
      reasonForJoining: item.reason_for_joining,

      userId: item.user_id,
      fullName: profile?.full_name || 'Applicant',
      dateOfBirth: student?.date_of_birth || null,
      gender: student?.gender || null,
      mobileNumber: student?.mobile_number || null,
      personalEmail: student?.personal_email || null,
      collegeEmail: student?.college_email || profile?.email || null,
      registerNumber: student?.register_number || null,
      department: student?.department || null,
      degreeProgramme: student?.degree_programme || null,
      yearOfStudy: student?.year_of_study || null,
      semester: student?.semester || null,
      section: student?.section || null,
      batch: student?.batch || null,
      githubUrl: student?.github_url || null,
      linkedinUrl: student?.linkedin_url || null,
      portfolioUrl: student?.portfolio_url || null,

      interests: studentInterests,
      categorizedSkills: {
        programming: programmingSkills,
        hardware: hardwareSkills,
        technology: technologySkills,
      },

      sheetSync: {
        status: (syncLog?.sync_status as 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED') || 'PENDING',
        attemptCount: syncLog?.attempt_count ?? 0,
        lastAttemptAt: syncLog?.last_attempt_at || null,
        syncedAt: syncLog?.synced_at || null,
        errorMessage: sanitizedError,
      },
    }
  })

  // If sorted by name, sort hydrated array
  if (sort === 'name') {
    applications.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  return {
    applications,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages,
  }
}

/**
 * Fetch immutable audit trail for a specific application.
 * Only accessible to ADMIN or SUPER_ADMIN.
 */
export async function getApplicationAuditHistory(
  supabase: SupabaseClient,
  applicationId: string
): Promise<AuditHistoryItem[]> {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, action, actor_user_id, previous_data, new_data')
    .eq('entity_id', applicationId)
    .order('created_at', { ascending: false })

  if (error || !logs || logs.length === 0) {
    return []
  }

  const actorIds = Array.from(new Set(logs.map((l) => l.actor_user_id).filter(Boolean)))
  const { data: actors } = actorIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', actorIds)
    : { data: [] }

  const actorMap = new Map((actors || []).map((a) => [a.id, a]))

  return logs.map((log) => {
    const actor = log.actor_user_id ? actorMap.get(log.actor_user_id) : null
    const prev = log.previous_data as Record<string, unknown> | null
    const curr = log.new_data as Record<string, unknown> | null

    return {
      id: log.id,
      timestamp: log.created_at,
      action: log.action,
      previousStatus: (prev?.status as string) || null,
      newStatus: (curr?.status as string) || null,
      actorName: actor?.full_name || 'System Admin',
      actorEmail: actor?.email || 'admin@college.example',
      notes: (curr?.notes as string) || (curr?.review_notes as string) || null,
    }
  })
}
