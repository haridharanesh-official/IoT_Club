import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-[#f4f6f8] text-slate-800">
      <section className="bg-gradient-to-br from-[#032b2b] via-[#064c43] to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-7">
          <p className="text-xs font-mono uppercase tracking-widest text-emerald-200">Sri Shakthi Institute of Engineering and Technology</p>
          <h1 className="max-w-3xl text-4xl sm:text-6xl font-extrabold leading-tight">Internet of Things Club</h1>
          <p className="max-w-2xl text-base sm:text-lg text-emerald-50 leading-relaxed">A student community for learning connected systems, exploring hardware, and building thoughtful engineering projects.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold">Apply to join</Link>
            <Link href="/about" className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 text-white font-semibold">About the club</Link>
          </div>
        </div>
      </section>
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <h2 className="text-3xl font-bold text-slate-900">A place to learn and build</h2>
        <p className="max-w-3xl text-slate-600 leading-relaxed">The IoT Club brings together students interested in embedded systems, sensors, networking, software, and responsible experimentation. Project showcases, event registrations, and lab availability will appear here only when their records and operational status are verified.</p>
        <div id="roadmap" className="grid md:grid-cols-3 gap-5">
          {[
            ['Learn', 'Build a foundation in connected systems and safe hands-on practice.'],
            ['Build', 'Turn a problem into a documented prototype and reviewable result.'],
            ['Share', 'Collaborate, present evidence, and learn from feedback.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-800">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
