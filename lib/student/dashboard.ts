import { createClient } from '../../utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface StudentProfile {
  userId: string
  fullName: string
  email: string
  role: string
  membershipStatus: string
  registrationId: string | null
  registerNumber: string | null
  department: string | null
  degreeProgramme: string | null
  yearOfStudy: number | null
  semester: number | null
  section: string | null
  batch: string | null
  username: string | null
  headline: string | null
  bio: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  createdAt: string
}

export interface StudentSkill {
  category: 'PROGRAMMING' | 'HARDWARE' | 'TECHNOLOGY'
  skill: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface StudentApplicationSummary {
  id: string
  registrationId: string
  reasonForJoining: string
  skillLevel: string
  previousIotExperience: boolean
  experienceDescription: string | null
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewNotes: string | null
}

export interface StudentProject {
  id: string
  title: string
  description: string | null
  status: string
  githubUrl: string | null
  role: 'LEAD' | 'MEMBER'
  createdAt: string
}

export interface StudentCourseProgress {
  courseId: string
  courseSlug: string
  courseTitle: string
  moduleId: string
  moduleTitle: string
  modulePosition: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  score: number | null
  completedAt: string | null
}

export interface StudentUpcomingEvent {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string | null
  venue: string | null
  isRegistered: boolean
}

export interface StudentNotification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION'
  readAt: string | null
  createdAt: string
}

export interface StudentDashboardMetrics {
  projectsCount: number
  coursesCount: number
  certificationsCount: number
  eventsCount: number
  notificationsCount: number
}

export interface StudentDashboardData {
  profile: StudentProfile
  skills: StudentSkill[]
  interests: string[]
  application: StudentApplicationSummary | null
  projects: StudentProject[]
  learningProgress: StudentCourseProgress[]
  upcomingEvents: StudentUpcomingEvent[]
  notifications: StudentNotification[]
  metrics: StudentDashboardMetrics
}

export interface PublicMemberProfile {
  userId: string
  fullName: string
  username: string | null
  registrationId: string | null
  registerNumber: string | null
  department: string | null
  degreeProgramme: string | null
  yearOfStudy: number | null
  section: string | null
  batch: string | null
  headline: string | null
  bio: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  createdAt: string
  skills: StudentSkill[]
  interests: string[]
  projects: { id: string; title: string; description: string | null; status: string }[]
}

export interface UpdateStudentProfileInput {
  headline?: string | null
  bio?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  username?: string | null
}

/**
 * Fetch authoritative student dashboard payload for the authenticated user.
 */
export async function getStudentDashboardData(
  userId: string,
  customClient?: SupabaseClient
): Promise<StudentDashboardData | null> {
  const supabase = customClient || (await createClient())

  // 1. Fetch profile and student_profile
  const { data: profileRow, error: profileErr } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      membership_status,
      created_at,
      student_profiles (
        registration_id,
        register_number,
        department,
        degree_programme,
        year_of_study,
        semester,
        section,
        batch,
        username,
        headline,
        bio,
        github_url,
        linkedin_url,
        portfolio_url,
        created_at
      )
    `)
    .eq('id', userId)
    .maybeSingle()

  if (profileErr || !profileRow) {
    return null
  }

  const rawSp = Array.isArray(profileRow.student_profiles)
    ? profileRow.student_profiles[0]
    : profileRow.student_profiles

  const profile: StudentProfile = {
    userId: profileRow.id,
    fullName: profileRow.full_name || 'Student Member',
    email: profileRow.email,
    role: profileRow.role,
    membershipStatus: profileRow.membership_status,
    registrationId: rawSp?.registration_id || null,
    registerNumber: rawSp?.register_number || null,
    department: rawSp?.department || null,
    degreeProgramme: rawSp?.degree_programme || null,
    yearOfStudy: rawSp?.year_of_study || null,
    semester: rawSp?.semester || null,
    section: rawSp?.section || null,
    batch: rawSp?.batch || null,
    username: rawSp?.username || null,
    headline: rawSp?.headline || null,
    bio: rawSp?.bio || null,
    githubUrl: rawSp?.github_url || null,
    linkedinUrl: rawSp?.linkedin_url || null,
    portfolioUrl: rawSp?.portfolio_url || null,
    createdAt: profileRow.created_at,
  }

  // 2. Fetch skills
  const { data: skillsData } = await supabase
    .from('student_skills')
    .select('category, skill, level')
    .eq('user_id', userId)

  const skills: StudentSkill[] = (skillsData || []).map((s) => ({
    category: s.category as StudentSkill['category'],
    skill: s.skill,
    level: s.level as StudentSkill['level'],
  }))

  // 3. Fetch interests
  const { data: interestsData } = await supabase
    .from('student_interests')
    .select('interest')
    .eq('user_id', userId)

  const interests = (interestsData || []).map((i) => i.interest)

  // 4. Fetch application details
  const { data: appRow } = await supabase
    .from('membership_applications')
    .select('id, registration_id, reason_for_joining, skill_level, previous_iot_experience, experience_description, status, submitted_at, reviewed_at, review_notes')
    .eq('user_id', userId)
    .maybeSingle()

  const application: StudentApplicationSummary | null = appRow
    ? {
        id: appRow.id,
        registrationId: appRow.registration_id,
        reasonForJoining: appRow.reason_for_joining,
        skillLevel: appRow.skill_level,
        previousIotExperience: appRow.previous_iot_experience,
        experienceDescription: appRow.experience_description,
        status: appRow.status,
        submittedAt: appRow.submitted_at,
        reviewedAt: appRow.reviewed_at,
        reviewNotes: appRow.review_notes,
      }
    : null

  // 5. Fetch projects (as owner or member)
  const projects: StudentProject[] = []
  const { data: ownedProjects } = await supabase
    .from('projects')
    .select('id, title, description, status, github_url, created_at')
    .eq('owner_id', userId)

  if (ownedProjects) {
    for (const p of ownedProjects) {
      projects.push({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        githubUrl: p.github_url,
        role: 'LEAD',
        createdAt: p.created_at,
      })
    }
  }

  const { data: memberProjectRows } = await supabase
    .from('project_members')
    .select('project_id, projects(id, title, description, status, github_url, created_at)')
    .eq('student_id', userId)

  if (memberProjectRows) {
    for (const row of memberProjectRows) {
      const p = row.projects as any
      if (p && !projects.some((item) => item.id === p.id)) {
        projects.push({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          githubUrl: p.github_url,
          role: 'MEMBER',
          createdAt: p.created_at,
        })
      }
    }
  }

  // 6. Fetch learning progress
  const { data: progressRows } = await supabase
    .from('student_progress')
    .select(`
      module_id,
      status,
      score,
      completed_at,
      learning_modules (
        id,
        title,
        position,
        course_id,
        courses (
          id,
          slug,
          title
        )
      )
    `)
    .eq('student_id', userId)

  const learningProgress: StudentCourseProgress[] = []
  if (progressRows) {
    for (const r of progressRows) {
      const lm = r.learning_modules as any
      const course = lm?.courses
      if (lm && course) {
        learningProgress.push({
          courseId: course.id,
          courseSlug: course.slug,
          courseTitle: course.title,
          moduleId: lm.id,
          moduleTitle: lm.title,
          modulePosition: lm.position,
          status: r.status,
          score: r.score,
          completedAt: r.completed_at,
        })
      }
    }
  }

  // 7. Certifications count
  const { count: certCount } = await supabase
    .from('student_certifications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', userId)

  // 8. Upcoming events
  const { data: eventRows } = await supabase
    .from('events')
    .select('id, title, description, starts_at, ends_at, venue')
    .eq('published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(3)

  const { data: regRows } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('student_id', userId)

  const registeredEventIds = new Set((regRows || []).map((r) => r.event_id))

  const upcomingEvents: StudentUpcomingEvent[] = (eventRows || []).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    venue: e.venue,
    isRegistered: registeredEventIds.has(e.id),
  }))

  // 9. Recent notifications
  const { data: notifRows } = await supabase
    .from('notifications')
    .select('id, title, message, type, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const notifications: StudentNotification[] = (notifRows || []).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    readAt: n.read_at,
    createdAt: n.created_at,
  }))

  // 10. Metrics summary
  const metrics: StudentDashboardMetrics = {
    projectsCount: projects.length,
    coursesCount: learningProgress.length,
    certificationsCount: certCount || 0,
    eventsCount: registeredEventIds.size,
    notificationsCount: notifications.filter((n) => !n.readAt).length,
  }

  return {
    profile,
    skills,
    interests,
    application,
    projects,
    learningProgress,
    upcomingEvents,
    notifications,
    metrics,
  }
}

/**
 * Fetch sanitized public member profile for /member/[username].
 * Looks up by username (exact/lowercase), register_number, or registration_id.
 */
export async function getPublicMemberProfile(
  identifier: string,
  customClient?: SupabaseClient
): Promise<PublicMemberProfile | null> {
  const supabase = customClient || (await createClient())
  const cleanId = identifier.trim()

  // Look up in public_member_profiles view
  const { data: member, error } = await supabase
    .from('public_member_profiles')
    .select('*')
    .or(`username.eq.${cleanId.toLowerCase()},register_number.ilike.${cleanId},registration_id.ilike.${cleanId}`)
    .maybeSingle()

  if (error || !member) {
    return null
  }

  // Fetch public skills
  const { data: skillsData } = await supabase
    .from('student_skills')
    .select('category, skill, level')
    .eq('user_id', member.user_id)

  const skills: StudentSkill[] = (skillsData || []).map((s) => ({
    category: s.category as StudentSkill['category'],
    skill: s.skill,
    level: s.level as StudentSkill['level'],
  }))

  // Fetch public interests
  const { data: interestsData } = await supabase
    .from('student_interests')
    .select('interest')
    .eq('user_id', member.user_id)

  const interests = (interestsData || []).map((i) => i.interest)

  // Fetch public projects
  const { data: ownedProjects } = await supabase
    .from('projects')
    .select('id, title, description, status')
    .eq('owner_id', member.user_id)

  return {
    userId: member.user_id,
    fullName: member.full_name || 'Club Member',
    username: member.username,
    registrationId: member.registration_id,
    registerNumber: member.register_number,
    department: member.department,
    degreeProgramme: member.degree_programme,
    yearOfStudy: member.year_of_study,
    section: member.section,
    batch: member.batch,
    headline: member.headline,
    bio: member.bio,
    githubUrl: member.github_url,
    linkedinUrl: member.linkedin_url,
    portfolioUrl: member.portfolio_url,
    createdAt: member.created_at,
    skills,
    interests,
    projects: ownedProjects || [],
  }
}
