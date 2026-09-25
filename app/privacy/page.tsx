import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'How the IoT Club registration platform handles membership application information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Privacy notice</h1>
      <p>This notice describes the registration system currently implemented by the IoT Club at Sri Shakthi Institute of Engineering and Technology. It is not a promise of a retention period or a substitute for institutional policy.</p>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-slate-900">What is collected</h2>
        <p>The application collects your name, date of birth, gender, mobile number, one email address, register number, academic details, IoT interests, self-reported skills and experience, and any profile links you choose to provide. Supabase Auth manages your account email and password. The application also stores consent timestamps and review history.</p>
      </section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-slate-900">Why and where it is used</h2>
        <p>Application information is used to register and review membership, show your status, and administer the club. PostgreSQL through Supabase is the primary record. A Google Sheets outbox may copy registration details to an administrative reporting sheet; a delayed or failed copy does not undo your database submission. A temporary draft is also kept in this browser&apos;s session storage while you complete the form.</p>
      </section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-slate-900">Access</h2>
        <p>Your own authenticated account can access its permitted records. Club administrators can review applications. Access for other staff is limited by database permissions and assigned duties. The public website should not display your contact details, date of birth, or register number.</p>
      </section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-slate-900">Retention and requests</h2>
        <p>A fixed retention schedule and a verified electronic request address are not yet documented in this application. Until those are published, request corrections or deletion through the institute&apos;s official IoT Club administration channels. Deletion may need to be reviewed against institutional record-keeping requirements; it is not automatic.</p>
      </section>
      <Link href="/register" className="inline-block text-emerald-700 font-semibold underline">Return to registration</Link>
    </main>
  )
}
