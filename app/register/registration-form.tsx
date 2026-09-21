'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const interests = ['Internet of Things', 'Embedded Systems', 'Robotics', 'Cybersecurity', 'Artificial Intelligence', 'Edge AI', 'Automation', 'Electronics', 'Cloud & Networking', 'Computer Vision']
const skills = { PROGRAMMING: ['C', 'C++', 'Python', 'Java', 'JavaScript'], HARDWARE: ['Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi', 'STM32'], TECHNOLOGY: ['MQTT', 'Node-RED', 'Home Assistant', 'Linux', 'Git / GitHub', 'Cloud', 'Networking'] } as const
type Skill = { category: keyof typeof skills; skill: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }
type Form = {
  full_name: string; date_of_birth: string; gender: string; mobile_number: string; personal_email: string;
  register_number: string; department: string; degree_programme: string; year_of_study: string; semester: string; section: string; batch: string;
  reason_for_joining: string; skill_level: Skill['level'] | ''; previous_iot_experience: boolean | null; experience_description: string;
  github_url: string; linkedin_url: string; portfolio_url: string;
  consent_accuracy: boolean; consent_rules: boolean; consent_data_use: boolean;
}

const initial: Form = {
  full_name: '', date_of_birth: '', gender: '', mobile_number: '', personal_email: '',
  register_number: '', department: '', degree_programme: '', year_of_study: '', semester: '', section: '', batch: '',
  reason_for_joining: '', skill_level: '', previous_iot_experience: null, experience_description: '',
  github_url: '', linkedin_url: '', portfolio_url: '', consent_accuracy: false, consent_rules: false, consent_data_use: false,
}

export default function RegistrationForm({ collegeEmail }: { collegeEmail: string }) {
  const router = useRouter()
  const submitting = useRef(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(initial)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm(previous => ({ ...previous, [key]: value }))
  const field = (label: string, key: keyof Form, type = 'text', required = false) => <label className="block text-xs font-semibold text-slate-700">{label}{required && ' *'}<input type={type} value={String(form[key])} onChange={event => update(key, event.target.value as never)} required={required} className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500" /></label>

  function validateCurrent() {
    if (step === 1 && (!form.full_name.trim() || !form.date_of_birth || form.date_of_birth > new Date().toISOString().slice(0, 10) || !/^[0-9+() -]{7,20}$/.test(form.mobile_number) || !/^\S+@\S+\.\S+$/.test(form.personal_email))) return 'Complete all required personal details.'
    if (step === 2 && (!form.register_number.trim() || !form.department.trim() || !form.degree_programme.trim() || !form.batch.trim() || !(Number(form.year_of_study) >= 1 && Number(form.year_of_study) <= 6) || !(Number(form.semester) >= 1 && Number(form.semester) <= 12))) return 'Complete all required academic details.'
    if (step === 3 && (!form.reason_for_joining.trim() || selectedInterests.length === 0 || !form.skill_level || form.previous_iot_experience === null || (form.previous_iot_experience && !form.experience_description.trim()))) return 'Complete the required IoT and skills details.'
    if (step === 3 && ((form.github_url && !/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/i.test(form.github_url)) || (form.linkedin_url && !/^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+\/?$/i.test(form.linkedin_url)) || (form.portfolio_url && !/^https:\/\/[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]+)?(\/\S*)?$/.test(form.portfolio_url)))) return 'Enter valid HTTPS profile URLs.'
    if (step === 5 && (!form.consent_accuracy || !form.consent_rules || !form.consent_data_use)) return 'Please confirm all three consent statements.'
    return ''
  }

  function next() { const issue = validateCurrent(); setError(issue); if (!issue) setStep(Math.min(step + 1, 5)) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const issue = validateCurrent(); setError(issue); if (issue || submitting.current) return
    submitting.current = true; setBusy(true)
    try {
      const payload = { ...form, college_email: collegeEmail, year_of_study: Number(form.year_of_study), semester: Number(form.semester), interests: selectedInterests, skills: selectedSkills.map(item => ({ ...item, level: form.skill_level })) }
      const { error: submitError } = await createClient().rpc('submit_membership_application', { payload })
      if (submitError) {
        setError(submitError.code === '23505' ? 'This account or register number already has an application.' : 'Unable to submit. Check your details and try again.')
        return
      }
      fetch('/api/internal/google-sheets/sync', { method: 'POST' }).catch(() => {})
      router.replace('/membership/status'); router.refresh()
    } catch { setError('The registration service is temporarily unavailable. Please try again.') }
    finally { submitting.current = false; setBusy(false) }
  }

  return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-slate-800"><div className="mb-6"><p className="text-xs font-mono text-emerald-700">MEMBERSHIP APPLICATION</p><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">IoT Club Registration</h1><p className="text-xs text-slate-500 mt-1">Your application will be reviewed before membership access is granted.</p></div><div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6"><div className="flex gap-2" aria-label={`Step ${step} of 5`}>{['Personal', 'Academic', 'IoT & Skills', 'Account', 'Review'].map((name, index) => <div key={name} className={`flex-1 text-center text-[10px] sm:text-xs rounded-xl py-2 ${index + 1 === step ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-50 text-slate-500'}`}>{name}</div>)}</div><form onSubmit={submit} className="space-y-5">
    {step === 1 && <div className="grid sm:grid-cols-2 gap-4">{field('Full name', 'full_name', 'text', true)}{field('Date of birth', 'date_of_birth', 'date', true)}{field('Gender', 'gender')}{field('Mobile number', 'mobile_number', 'tel', true)}{field('Personal email', 'personal_email', 'email', true)}<div className="text-xs font-semibold text-slate-700">College email<div className="mt-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700">{collegeEmail}</div></div></div>}
    {step === 2 && <div className="grid sm:grid-cols-2 gap-4">{field('Register number', 'register_number', 'text', true)}{field('Department', 'department', 'text', true)}{field('Degree / programme', 'degree_programme', 'text', true)}{field('Year of study', 'year_of_study', 'number', true)}{field('Semester', 'semester', 'number', true)}{field('Section', 'section')}{field('Batch', 'batch', 'text', true)}</div>}
    {step === 3 && <div className="space-y-4"><label className="block text-xs font-semibold text-slate-700">Reason for joining *<textarea value={form.reason_for_joining} onChange={event => update('reason_for_joining', event.target.value)} className="block w-full mt-1 min-h-24 bg-slate-50 border border-slate-200 rounded-xl p-3" /></label><fieldset><legend className="text-xs font-semibold text-slate-700 mb-2">Areas of interest *</legend><div className="flex flex-wrap gap-2">{interests.map(interest => <label key={interest} className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"><input type="checkbox" checked={selectedInterests.includes(interest)} onChange={() => setSelectedInterests(previous => previous.includes(interest) ? previous.filter(item => item !== interest) : [...previous, interest])} className="mr-2" />{interest}</label>)}</div></fieldset><label className="block text-xs font-semibold text-slate-700">Skill level *<select value={form.skill_level} onChange={event => update('skill_level', event.target.value as Skill['level'])} className="block w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3"><option value="">Select skill level</option><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></label><fieldset><legend className="text-xs font-semibold text-slate-700">Previous IoT experience *</legend><div className="flex gap-4 mt-2"><label className="text-xs"><input type="radio" name="previous-experience" checked={form.previous_iot_experience === true} onChange={() => update('previous_iot_experience', true)} className="mr-2" />Yes</label><label className="text-xs"><input type="radio" name="previous-experience" checked={form.previous_iot_experience === false} onChange={() => update('previous_iot_experience', false)} className="mr-2" />No</label></div></fieldset>{form.previous_iot_experience && field('Experience description', 'experience_description', 'text', true)}<fieldset><legend className="text-xs font-semibold text-slate-700 mb-2">Skills</legend>{Object.entries(skills).map(([category, names]) => <div key={category} className="mb-3"><p className="text-[10px] font-bold text-slate-500 mb-1">{category}</p><div className="flex flex-wrap gap-2">{names.map(name => { const active = selectedSkills.some(item => item.category === category && item.skill === name); return <label key={name} className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"><input type="checkbox" checked={active} onChange={() => setSelectedSkills(previous => active ? previous.filter(item => !(item.category === category && item.skill === name)) : [...previous, { category: category as Skill['category'], skill: name, level: form.skill_level || 'BEGINNER' }])} className="mr-2" />{name}</label> })}</div></div>)}</fieldset><div className="grid sm:grid-cols-3 gap-4">{field('GitHub URL', 'github_url', 'url')}{field('LinkedIn URL', 'linkedin_url', 'url')}{field('Portfolio URL', 'portfolio_url', 'url')}</div></div>}
    {step === 4 && <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2"><p className="font-bold">Your account is ready</p><p>Signed in as {collegeEmail}. Your password is handled by Supabase Auth and is never stored in the club application database.</p><p>Google accounts can complete this form without creating another password when local OAuth becomes available.</p></div>}
    {step === 5 && <div className="space-y-4 text-xs"><div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">{([
      ['Full name', form.full_name], ['Date of birth', form.date_of_birth], ['Gender', form.gender], ['Mobile number', form.mobile_number], ['Personal email', form.personal_email], ['College email', collegeEmail],
      ['Register number', form.register_number], ['Department', form.department], ['Degree / programme', form.degree_programme], ['Year', form.year_of_study], ['Semester', form.semester], ['Section', form.section], ['Batch', form.batch],
      ['Reason for joining', form.reason_for_joining], ['Interests', selectedInterests.join(', ')], ['Skill level', form.skill_level], ['Previous IoT experience', form.previous_iot_experience ? 'Yes' : 'No'], ['Experience description', form.previous_iot_experience ? form.experience_description : ''],
      ['Programming skills', selectedSkills.filter(item => item.category === 'PROGRAMMING').map(item => item.skill).join(', ')], ['Hardware skills', selectedSkills.filter(item => item.category === 'HARDWARE').map(item => item.skill).join(', ')], ['Technology skills', selectedSkills.filter(item => item.category === 'TECHNOLOGY').map(item => item.skill).join(', ')],
      ['GitHub', form.github_url], ['LinkedIn', form.linkedin_url], ['Portfolio', form.portfolio_url],
    ] as const).map(([label, value]) => <p key={label}><strong>{label}:</strong> {value || '—'}</p>)}</div>{([['consent_accuracy', 'I confirm that the information I supplied is accurate.'], ['consent_rules', 'I agree to the IoT Club rules and guidelines.'], ['consent_data_use', 'I agree to academic, membership, and administrative use of my application data.']] as const).map(([key, label]) => <label key={key} className="block text-slate-700"><input type="checkbox" checked={form[key]} onChange={event => update(key, event.target.checked)} className="mr-2" />{label}</label>)}</div>}
    {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}<div className="flex justify-between gap-3"><button type="button" onClick={() => { setError(''); setStep(Math.max(1, step - 1)) }} disabled={step === 1 || busy} className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40">Back</button>{step < 5 ? <button type="button" onClick={next} className="px-5 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold">Continue</button> : <button type="submit" disabled={busy} className="px-5 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-50">{busy ? 'Submitting...' : 'Submit application'}</button>}</div>
  </form></div></div>
}
