import Link from 'next/link'

export const metadata = { title: 'Participation guidelines — IoT Club' }

export default function ClubRulesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Club participation guidelines</h1>
      <p>These are the participation expectations shown with the membership application. They do not replace institute rules or imply that a separate formal club constitution has been approved.</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide accurate application and account information.</li>
        <li>Treat other students and staff respectfully in club activities and online spaces.</li>
        <li>Use lab equipment only with the required permission and follow applicable safety instructions.</li>
        <li>Do not submit another person&apos;s work as your own or misrepresent project results.</li>
        <li>Report damaged or missing equipment to the responsible lab staff.</li>
      </ul>
      <p>Event-specific and laboratory operating rules may be provided separately by authorized staff.</p>
      <Link href="/register" className="inline-block text-emerald-700 font-semibold underline">Return to registration</Link>
    </main>
  )
}
