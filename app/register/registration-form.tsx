'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { signIn, signInWithGoogle, signUp, validateEmail, validatePassword } from '@/lib/auth/client'

const INTEREST_OPTIONS = [
  'Internet of Things',
  'Embedded Systems',
  'Robotics',
  'Sensors & Actuators',
  'Wireless & LoRa',
  'Cloud & AIoT',
  'Cybersecurity',
  'Artificial Intelligence',
  'Edge AI',
  'Automation',
  'Electronics',
  'Cloud & Networking',
  'Computer Vision',
] as const

const SKILLS = {
  PROGRAMMING: ['C', 'C++', 'Python', 'Java', 'JavaScript'],
  HARDWARE: ['Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi', 'STM32'],
  TECHNOLOGY: ['MQTT', 'Node-RED', 'Home Assistant', 'Linux', 'Git / GitHub', 'Cloud', 'Networking'],
} as const

type Skill = {
  category: keyof typeof SKILLS
  skill: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

type Form = {
  // Step 1: Personal
  full_name: string
  gender: string
  date_of_birth: string
  mobile_number: string
  email_address: string
  email_kind: 'PERSONAL' | 'COLLEGE' | ''
  // Step 2: Academic
  register_number: string
  department: string
  degree_programme: string
  year_of_study: string
  semester: string
  section: string
  batch: string
  // Step 3: IoT & Skills
  skill_level: Skill['level'] | ''
  previous_iot_experience: boolean | null
  experience_description: string
  github_url: string
  linkedin_url: string
  portfolio_url: string
  // Step 5: Consent
  consent_accuracy: boolean
  consent_rules: boolean
  consent_data_use: boolean
}

const initialForm: Form = {
  full_name: '',
  gender: '',
  date_of_birth: '',
  mobile_number: '',
  email_address: '',
  email_kind: '',
  register_number: '',
  department: '',
  degree_programme: '',
  year_of_study: '',
  semester: '',
  section: '',
  batch: '',
  skill_level: '',
  previous_iot_experience: null,
  experience_description: '',
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
  consent_accuracy: false,
  consent_rules: false,
  consent_data_use: false,
}

const DRAFT_STORAGE_KEY = 'iot_club_registration_draft'

export default function RegistrationForm({
  initialUser,
}: {
  initialUser: { id: string; email: string } | null
}) {
  const router = useRouter()
  const submitting = useRef(false)
  const pollTimer = useRef<NodeJS.Timeout | null>(null)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(() => ({
    ...initialForm,
    email_address: initialUser?.email ?? '',
  }))
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])

  // Auth & Step 4 states (NEVER stored in draft or sessionStorage!)
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(initialUser)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [waitingVerification, setWaitingVerification] = useState(false)
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendNotice, setResendNotice] = useState('')
  const [existingAccountSignIn, setExistingAccountSignIn] = useState(false)
  const [existingPassword, setExistingPassword] = useState('')
  const [isSigningInExisting, setIsSigningInExisting] = useState(false)

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // 1. Hydrate non-sensitive form state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          const { college_email, personal_email, account_email, reason_for_joining, ...draft } = parsed
          setForm((prev) => ({
            ...prev,
            ...draft,
            // Older local drafts used separate emails; migrate only to one contact address.
            email_address: initialUser?.email || parsed.email_address || account_email || college_email || personal_email || prev.email_address,
          }))
          if (Array.isArray(parsed.selectedInterests)) {
            setSelectedInterests(parsed.selectedInterests)
          }
          if (Array.isArray(parsed.selectedSkills)) {
            setSelectedSkills(parsed.selectedSkills)
          }
          if (typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 5) {
            setStep(parsed.step)
          }
        }
      }
    } catch {}

    // Check client session
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser({ id: user.id, email: user.email ?? '' })
        setForm((prev) => ({
          ...prev,
          email_address: user.email || prev.email_address,
        }))
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email ?? '' })
        setForm((prev) => ({ ...prev, email_address: session.user.email || prev.email_address }))
        setWaitingVerification(false)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [initialUser])

  // 2. Persist non-sensitive draft to sessionStorage whenever form values change
  useEffect(() => {
    try {
      const draft = {
        ...form,
        selectedInterests,
        selectedSkills,
        step,
      }
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    } catch {}
  }, [form, selectedInterests, selectedSkills, step])

  // 3. Polling when waiting for email verification in Step 4
  useEffect(() => {
    if (waitingVerification && !authUser) {
      pollTimer.current = setInterval(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email_confirmed_at) {
          setAuthUser({ id: user.id, email: user.email ?? '' })
          setWaitingVerification(false)
          setError('')
          if (pollTimer.current) clearInterval(pollTimer.current)
          setStep(5)
        }
      }, 3000)
    } else if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [waitingVerification, authUser])

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  function validateStep(s: number): string {
    if (s === 1) {
      if (!form.full_name.trim()) return 'Please enter your full name.'
      if (form.full_name.trim().length > 160) return 'Full name must not exceed 160 characters.'
      if (!form.gender.trim()) return 'Please select your gender.'
      if (!form.date_of_birth) return 'Please select your date of birth.'
      if (form.date_of_birth > new Date().toISOString().slice(0, 10)) return 'Date of birth cannot be in the future.'
      if (form.date_of_birth < '1900-01-01') return 'Please enter a reasonable date of birth.'
      if (!form.mobile_number.trim() || !/^[0-9+() -]{7,20}$/.test(form.mobile_number.trim())) {
        return 'Please enter a valid mobile number.'
      }
      if (!form.email_address.trim() || !validateEmail(form.email_address)) {
        return 'Please enter a valid email address.'
      }
      if (!form.email_kind) return 'Please select whether this is a personal or college email.'
    }

    if (s === 2) {
      if (!form.register_number.trim()) return 'Please enter your college register number.'
      if (form.register_number.trim().length > 40) return 'Register number must not exceed 40 characters.'
      if (!form.department.trim()) return 'Please enter your department.'
      if (!form.degree_programme.trim()) return 'Please enter your degree / programme.'
      const year = Number(form.year_of_study)
      if (isNaN(year) || year < 1 || year > 6) return 'Year of study must be between 1 and 6.'
      const sem = Number(form.semester)
      if (isNaN(sem) || sem < 1 || sem > 12) return 'Semester must be between 1 and 12.'
      if (!form.batch.trim()) return 'Please enter your graduation batch (e.g. 2024-2028).'
    }

    if (s === 3) {
      if (selectedInterests.length === 0) return 'Please select at least one area of interest.'
      if (selectedInterests.length > 10) return 'You can select at most 10 areas of interest.'
      if (!form.skill_level) return 'Please select your overall IoT skill level.'
      if (form.previous_iot_experience === null) return 'Please indicate whether you have previous IoT experience.'
      if (form.previous_iot_experience && !form.experience_description.trim()) {
        return 'Please briefly describe your previous IoT experience.'
      }
      if (form.github_url && !/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/i.test(form.github_url.trim())) {
        return 'Please enter a valid GitHub profile URL (e.g. https://github.com/your-handle).'
      }
      if (form.linkedin_url && !/^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+\/?$/i.test(form.linkedin_url.trim())) {
        return 'Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/your-handle).'
      }
      if (form.portfolio_url && !/^https:\/\/[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]+)?(\/\S*)?$/.test(form.portfolio_url.trim())) {
        return 'Please enter a valid HTTPS portfolio URL.'
      }
    }

    if (s === 4) {
      if (!authUser) {
        return 'Please create your student account or sign in to continue.'
      }
    }

    if (s === 5) {
      if (!form.consent_accuracy || !form.consent_rules || !form.consent_data_use) {
        return 'Please confirm all three consent statements to complete submission.'
      }
    }

    return ''
  }

  function handleNext() {
    const issue = validateStep(step)
    setError(issue)
    if (issue) return

    setStep(Math.min(step + 1, 5))
  }

  function handleBack() {
    setError('')
    setStep(Math.max(1, step - 1))
  }

  // Handle Account Creation in Step 4
  async function handleCreateAccount() {
    setError('')
    setResendNotice('')

    const targetEmail = form.email_address.trim()
    if (!validateEmail(targetEmail)) {
      setError('Please enter a valid login email address.')
      return
    }

    if (!validatePassword(password)) {
      setError('Use at least 8 characters with uppercase, lowercase, a number, and a special character.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsCreatingAccount(true)
    try {
      const result = await signUp(targetEmail, password)
      // Clear passwords from memory immediately
      setPassword('')
      setConfirmPassword('')

      if (!result.ok) {
        if (result.message.toLowerCase().includes('already exists') || result.message.toLowerCase().includes('already registered')) {
          setExistingAccountSignIn(true)
          setError('An account with this email already exists. Enter your password below to sign in and link your application.')
        } else {
          setError(result.message)
        }
        return
      }

      if (result.needsConfirmation) {
        setWaitingVerification(true)
      } else {
        // Direct session established
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setAuthUser({ id: user.id, email: user.email ?? '' })
          setStep(5)
        }
      }
    } catch {
      setError('Authentication service is temporarily unavailable. Please try again.')
    } finally {
      setIsCreatingAccount(false)
    }
  }

  // Handle Sign-in for existing account inside Step 4
  async function handleSignInExisting() {
    setError('')
    if (!existingPassword) {
      setError('Please enter your password.')
      return
    }

    setIsSigningInExisting(true)
    try {
      const targetEmail = form.email_address.trim()
      const result = await signIn(targetEmail, existingPassword)
      setExistingPassword('')

      if (!result.ok) {
        setError(result.message)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAuthUser({ id: user.id, email: user.email ?? '' })
        setForm((prev) => ({ ...prev, email_address: user.email || prev.email_address }))
        setExistingAccountSignIn(false)
        setStep(5)
      }
    } catch {
      setError('Unable to sign in. Please check your password.')
    } finally {
      setIsSigningInExisting(false)
    }
  }

  // Handle Google OAuth in Step 4
  async function handleGoogleOAuth() {
    setIsGoogleLoading(true)
    setError('')
    try {
      // Draft is already preserved in sessionStorage
      const result = await signInWithGoogle('/register')
      if (!result.ok) {
        setError(result.message)
        setIsGoogleLoading(false)
      }
    } catch {
      setError('Google authentication is temporarily unavailable. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  // Check email confirmation status manually
  async function checkEmailConfirmation() {
    setIsCheckingConfirmation(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email_confirmed_at) {
        setAuthUser({ id: user.id, email: user.email ?? '' })
        setWaitingVerification(false)
        setStep(5)
      } else {
        setError('Email not yet confirmed. Please click the verification link sent to your inbox, then try again.')
      }
    } catch {
      setError('Unable to check confirmation status. Please try again.')
    } finally {
      setIsCheckingConfirmation(false)
    }
  }

  // Resend verification email
  async function resendVerificationEmail() {
    setIsResending(true)
    setResendNotice('')
    setError('')
    try {
      const supabase = createClient()
      const targetEmail = form.email_address.trim()
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
      })
      if (resendErr) {
        setError('Unable to resend verification email. Please try again.')
      } else {
        setResendNotice(`Verification email resent to ${targetEmail}.`)
      }
    } catch {
      setError('Unable to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  // Final submission in Step 5
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const issue = validateStep(5)
    setError(issue)
    if (issue) return

    if (!authUser) {
      setError('Authentication required. Please complete Step 4.')
      setStep(4)
      return
    }

    submitting.current = true
    setBusy(true)

    try {
      const payload = {
        full_name: form.full_name.trim(),
        gender: form.gender.trim() || null,
        date_of_birth: form.date_of_birth,
        mobile_number: form.mobile_number.trim(),
        email_address: authUser.email,
        email_kind: form.email_kind,
        register_number: form.register_number.trim(),
        department: form.department.trim(),
        degree_programme: form.degree_programme.trim(),
        year_of_study: Number(form.year_of_study),
        semester: Number(form.semester),
        section: form.section.trim() || null,
        batch: form.batch.trim(),
        interests: selectedInterests,
        skill_level: form.skill_level,
        previous_iot_experience: form.previous_iot_experience,
        experience_description: form.previous_iot_experience ? form.experience_description.trim() : null,
        skills: selectedSkills.map((item) => ({
          category: item.category,
          skill: item.skill,
          level: item.level || form.skill_level || 'BEGINNER',
        })),
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
        consent_accuracy: form.consent_accuracy,
        consent_rules: form.consent_rules,
        consent_data_use: form.consent_data_use,
      }

      const supabase = createClient()
      const { error: submitError } = await supabase.rpc('submit_membership_application', { payload })

      if (submitError) {
        if (submitError.code === '23505') {
          setError('This account or college register number already has a membership application.')
        } else {
          setError('Unable to submit your application. Please verify your details and try again.')
        }
        return
      }

      // Application successfully submitted to PostgreSQL
      // Clean up local draft
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      } catch {}

      // Trigger asynchronous Google Sheets outbox sync
      fetch('/api/internal/google-sheets/sync/self', { method: 'POST' }).catch(() => {})

      router.replace('/membership/status')
      router.refresh()
    } catch {
      setError('The registration service is temporarily unavailable. Please try again.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-slate-800">
      {/* Header & Recruitment Status */}
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-mono font-bold text-emerald-700 tracking-wider uppercase">
            IoT Club Registration Portal
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Recruitment 2026 • Registration Open
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Membership Application
          </h1>
          <span className="text-xs font-bold text-emerald-700">
            Step {step} of 5 ({step * 20}% completed)
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Complete all 5 steps to apply for IoT Club membership. Account creation is integrated in Step 4.
        </p>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Step Indicator Pills */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2" aria-label={`Step ${step} of 5`}>
          {['Personal', 'Academic', 'IoT & Skills', 'Account', 'Review'].map((name, index) => {
            const stepNum = index + 1
            const isCurrent = stepNum === step
            const isCompleted = stepNum < step
            return (
              <div
                key={name}
                className={`text-center text-[10px] sm:text-xs rounded-xl py-2 px-1 transition font-semibold truncate ${
                  isCurrent
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">{stepNum}. </span>
                {name}
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ============================================================ */}
          {/* STEP 1: PERSONAL DETAILS */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Step 1 — Personal Details</h2>
                <p className="text-xs text-slate-500">Provide your official identification and contact details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="field-full-name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    placeholder="e.g. Priyadharshini R"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-gender" className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="field-gender"
                    required
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-dob" className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    id="field-dob"
                    type="date"
                    required
                    value={form.date_of_birth}
                    onChange={(e) => update('date_of_birth', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-mobile" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    id="field-mobile"
                    type="tel"
                    required
                    value={form.mobile_number}
                    onChange={(e) => update('mobile_number', e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-email-address" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="field-email-address"
                    type="email"
                    required
                    readOnly={!!authUser}
                    value={form.email_address}
                    onChange={(e) => update('email_address', e.target.value)}
                    placeholder="e.g. student@example.com"
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Use the same email you will use to sign in. It may be your personal or college email.</p>
                </div>

                <div>
                  <label htmlFor="field-email-kind" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Type *
                  </label>
                  <select
                    id="field-email-kind"
                    required
                    value={form.email_kind}
                    onChange={(e) => update('email_kind', e.target.value as Form['email_kind'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  >
                    <option value="">Select email type</option>
                    <option value="PERSONAL">Personal email</option>
                    <option value="COLLEGE">College email</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">This only records how you identify the address; no college-domain assumption is made.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: ACADEMIC DETAILS */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Step 2 — Academic Details</h2>
                <p className="text-xs text-slate-500">Enter your college registration and department information.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-register-number" className="block text-xs font-semibold text-slate-700 mb-1">
                    Register Number *
                  </label>
                  <input
                    id="field-register-number"
                    type="text"
                    required
                    value={form.register_number}
                    onChange={(e) => update('register_number', e.target.value)}
                    placeholder="e.g. 714022104001 or TEST-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-department" className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <input
                    id="field-department"
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => update('department', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-degree" className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree / Programme *
                  </label>
                  <input
                    id="field-degree"
                    type="text"
                    required
                    value={form.degree_programme}
                    onChange={(e) => update('degree_programme', e.target.value)}
                    placeholder="e.g. B.E. or B.Tech"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-batch" className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch *
                  </label>
                  <input
                    id="field-batch"
                    type="text"
                    required
                    value={form.batch}
                    onChange={(e) => update('batch', e.target.value)}
                    placeholder="e.g. 2024-2028"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-year" className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Study (1–6) *
                  </label>
                  <input
                    id="field-year"
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={form.year_of_study}
                    onChange={(e) => update('year_of_study', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-semester" className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester (1–12) *
                  </label>
                  <input
                    id="field-semester"
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={form.semester}
                    onChange={(e) => update('semester', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-section" className="block text-xs font-semibold text-slate-700 mb-1">
                    Section
                  </label>
                  <input
                    id="field-section"
                    type="text"
                    value={form.section}
                    onChange={(e) => update('section', e.target.value)}
                    placeholder="e.g. A or B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: IOT & SKILLS */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Step 3 — IoT Interests & Technical Skills</h2>
                <p className="text-xs text-slate-500">Help us understand your technical background and club interests.</p>
              </div>

              {/* Areas of Interest */}
              <fieldset>
                <legend className="text-xs font-semibold text-slate-700 mb-2">
                  Areas of Interest * <span className="text-slate-400 font-normal">(Select 1 to 10)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const checked = selectedInterests.includes(interest)
                    return (
                      <label
                        key={interest}
                        className={`text-xs px-3 py-2 border rounded-xl cursor-pointer transition flex items-center gap-2 ${
                          checked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedInterests((prev) =>
                              checked ? prev.filter((i) => i !== interest) : [...prev, interest]
                            )
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{interest}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              {/* Skill Level */}
              <div>
                <label htmlFor="field-skill-level" className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall IoT Skill Level *
                </label>
                <select
                  id="field-skill-level"
                  required
                  value={form.skill_level}
                  onChange={(e) => update('skill_level', e.target.value as Skill['level'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="">Select skill level</option>
                  <option value="BEGINNER">BEGINNER — New to microcontrollers and electronics</option>
                  <option value="INTERMEDIATE">INTERMEDIATE — Built projects with Arduino/ESP32</option>
                  <option value="ADVANCED">ADVANCED — Experienced with RTOS, PCB design, or cloud IoT</option>
                </select>
              </div>

              {/* Previous Experience */}
              <fieldset>
                <legend className="text-xs font-semibold text-slate-700 mb-1">
                  Previous IoT Experience *
                </legend>
                <div className="flex gap-6 mt-1">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="previous-iot-experience"
                      checked={form.previous_iot_experience === true}
                      onChange={() => update('previous_iot_experience', true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yes, I have prior experience</span>
                  </label>
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="previous-iot-experience"
                      checked={form.previous_iot_experience === false}
                      onChange={() => update('previous_iot_experience', false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>No prior experience</span>
                  </label>
                </div>
              </fieldset>

              {form.previous_iot_experience && (
                <div>
                  <label htmlFor="field-experience-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe Your Previous Experience *
                  </label>
                  <textarea
                    id="field-experience-desc"
                    required
                    value={form.experience_description}
                    onChange={(e) => update('experience_description', e.target.value)}
                    placeholder="Briefly describe hardware platforms, sensors, or projects you have previously worked on..."
                    className="w-full min-h-20 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              )}

              {/* Skills Chips */}
              <fieldset>
                <legend className="text-xs font-semibold text-slate-700 mb-2">Technical Skills</legend>
                {Object.entries(SKILLS).map(([cat, names]) => (
                  <div key={cat} className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {names.map((name) => {
                        const active = selectedSkills.some((s) => s.category === cat && s.skill === name)
                        return (
                          <label
                            key={name}
                            className={`text-xs px-2.5 py-1.5 border rounded-lg cursor-pointer transition flex items-center gap-1.5 ${
                              active
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {
                                setSelectedSkills((prev) =>
                                  active
                                    ? prev.filter((item) => !(item.category === cat && item.skill === name))
                                    : [
                                        ...prev,
                                        {
                                          category: cat as Skill['category'],
                                          skill: name,
                                          level: form.skill_level || 'BEGINNER',
                                        },
                                      ]
                                )
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </fieldset>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label htmlFor="field-github" className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    id="field-github"
                    type="url"
                    value={form.github_url}
                    onChange={(e) => update('github_url', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-linkedin" className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    id="field-linkedin"
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => update('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="field-portfolio" className="block text-xs font-semibold text-slate-700 mb-1">
                    Portfolio URL
                  </label>
                  <input
                    id="field-portfolio"
                    type="url"
                    value={form.portfolio_url}
                    onChange={(e) => update('portfolio_url', e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: CREATE STUDENT ACCOUNT */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Step 4 — Create Student Account</h2>
                <p className="text-xs text-slate-500">
                  This email and password will be used to sign in to the IoT Club student portal.
                </p>
              </div>

              {/* Scenario 1: Already Authenticated */}
              {authUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Account Authenticated</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    You are connected as <strong>{authUser.email}</strong>. Your authentication account is confirmed.
                  </p>
                  <p className="text-xs text-slate-600">
                    Your password is handled exclusively by Supabase Auth and is never stored in the club database.
                    Proceed to review and submit your application.
                  </p>
                </div>
              ) : waitingVerification ? (
                /* Scenario 2: Verification Email Sent, Waiting Confirmation */
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                    <Mail className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Verify your email to continue</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    We sent a confirmation link to <strong>{form.email_address}</strong>.
                    Please check your inbox and click the verification link.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Once verified, click the button below to continue to the final review step.
                  </p>

                  {resendNotice && (
                    <div role="status" className="text-xs text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-xl p-2.5">
                      {resendNotice}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={checkEmailConfirmation}
                      disabled={isCheckingConfirmation}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConfirmation ? 'animate-spin' : ''}`} />
                      <span>{isCheckingConfirmation ? 'Checking confirmation...' : "I've Verified My Email"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resendVerificationEmail}
                      disabled={isResending}
                      className="px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
                    </button>
                  </div>
                </div>
              ) : existingAccountSignIn ? (
                /* Scenario 3: Email already exists, offer inline sign in */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Account Already Exists — Sign In to Continue</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    An account for <strong>{form.email_address}</strong> is already registered. Enter your password to link your application:
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={existingPassword}
                        onChange={(e) => setExistingPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSignInExisting}
                        disabled={isSigningInExisting}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <span>{isSigningInExisting ? 'Signing in...' : 'Sign In & Continue'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExistingAccountSignIn(false)}
                        className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Scenario 4: New Student Account Creation Form */
                <div className="space-y-5">
                  {/* Google OAuth Option */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleOAuth}
                      disabled={isGoogleLoading || busy}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1">Google accounts do not require creating a password.</p>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">
                      or create email & password
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>

                  <div>
                    <label htmlFor="account-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="account-email"
                        type="email"
                        autoComplete="email"
                        readOnly
                        value={form.email_address}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">This is the email address from Step 1. Go back to change it.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="account-password" className="block text-xs font-semibold text-slate-700 mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="account-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Minimum 8 characters with letters and numbers.</p>
                    </div>

                    <div>
                      <label htmlFor="account-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="account-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={isCreatingAccount}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isCreatingAccount ? 'Creating account...' : 'Create Account & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: REVIEW & CONSENT */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Step 5 — Review & Consent</h2>
                <p className="text-xs text-slate-500">
                  Please review all your submitted details carefully. Passwords and tokens are never shown or stored in application records.
                </p>
              </div>

              {/* Review Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Personal Details</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                    <p><strong className="text-slate-800">Full Name:</strong> {form.full_name || '—'}</p>
                    <p><strong className="text-slate-800">Gender:</strong> {form.gender || '—'}</p>
                    <p><strong className="text-slate-800">Date of Birth:</strong> {form.date_of_birth || '—'}</p>
                    <p><strong className="text-slate-800">Mobile:</strong> {form.mobile_number || '—'}</p>
                    <p><strong className="text-slate-800">Email Address:</strong> {authUser?.email || form.email_address || '—'}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/70 pt-3">
                  <h3 className="font-bold text-slate-900 mb-1.5">Academic Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                    <p><strong className="text-slate-800">Register Number:</strong> {form.register_number || '—'}</p>
                    <p><strong className="text-slate-800">Department:</strong> {form.department || '—'}</p>
                    <p><strong className="text-slate-800">Programme:</strong> {form.degree_programme || '—'}</p>
                    <p><strong className="text-slate-800">Year / Semester:</strong> Year {form.year_of_study}, Sem {form.semester}</p>
                    <p><strong className="text-slate-800">Section / Batch:</strong> {form.section ? `Sec ${form.section}, ` : ''}{form.batch}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/70 pt-3">
                  <h3 className="font-bold text-slate-900 mb-1.5">IoT & Skills</h3>
                  <div className="space-y-1 text-slate-600">
                    <p><strong className="text-slate-800">Interests:</strong> {selectedInterests.join(', ') || '—'}</p>
                    <p><strong className="text-slate-800">Skill Level:</strong> {form.skill_level || '—'}</p>
                    <p><strong className="text-slate-800">Previous IoT Experience:</strong> {form.previous_iot_experience ? `Yes — ${form.experience_description}` : 'No'}</p>
                    <p>
                      <strong className="text-slate-800">Programming Skills:</strong>{' '}
                      {selectedSkills.filter((s) => s.category === 'PROGRAMMING').map((s) => s.skill).join(', ') || 'None selected'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Hardware Skills:</strong>{' '}
                      {selectedSkills.filter((s) => s.category === 'HARDWARE').map((s) => s.skill).join(', ') || 'None selected'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Technology Skills:</strong>{' '}
                      {selectedSkills.filter((s) => s.category === 'TECHNOLOGY').map((s) => s.skill).join(', ') || 'None selected'}
                    </p>
                  </div>
                </div>

                {(form.github_url || form.linkedin_url || form.portfolio_url) && (
                  <div className="border-t border-slate-200/70 pt-3">
                    <h3 className="font-bold text-slate-900 mb-1.5">Profiles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                      {form.github_url && <p><strong className="text-slate-800">GitHub:</strong> {form.github_url}</p>}
                      {form.linkedin_url && <p><strong className="text-slate-800">LinkedIn:</strong> {form.linkedin_url}</p>}
                      {form.portfolio_url && <p><strong className="text-slate-800">Portfolio:</strong> {form.portfolio_url}</p>}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200/70 pt-3">
                  <h3 className="font-bold text-slate-900 mb-1">Account Credentials</h3>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Account Login Email:</strong>{' '}
                    {authUser?.email || form.email_address}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Password is protected by Supabase Auth and never shown in reviews.</p>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent_accuracy}
                    onChange={(e) => update('consent_accuracy', e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I confirm that the information I supplied is accurate and true. *</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent_rules}
                    onChange={(e) => update('consent_rules', e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I agree to the <Link href="/club-rules" target="_blank" className="text-emerald-700 underline">club participation guidelines</Link>. *</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent_data_use}
                    onChange={(e) => update('consent_data_use', e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I have read the <Link href="/privacy" target="_blank" className="text-emerald-700 underline">privacy notice</Link> and agree to the described membership data use. *</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || busy}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && authUser && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="submit"
                disabled={busy || !form.consent_accuracy || !form.consent_rules || !form.consent_data_use}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{busy ? 'Submitting application...' : 'Submit Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
