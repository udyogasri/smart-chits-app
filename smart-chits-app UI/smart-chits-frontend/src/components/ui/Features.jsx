const features = [
  {
    title: 'Automated collections',
    description: 'Schedule reminders, maintain contribution records, and reduce manual follow-ups for every member.',
  },
  {
    title: 'Transparent payouts',
    description: 'Keep all stakeholders aligned with payout summaries, ledger views, and project-wide notifications.',
  },
  {
    title: 'Member analytics',
    description: 'Track participation, performance, and payment behavior through intuitive dashboards.',
  },
  {
    title: 'Secure ledger',
    description: 'Protect every transaction using encrypted storage and auditable fund history.',
  },
]

function Features() {
  return (
    <section id="features" className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.06),_transparent_50%)]" />
      <div className="pointer-events-none absolute right-1/4 top-16 h-24 w-24 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Why choose SmartChits</p>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Built for{' '}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                trust, growth, and clarity
              </span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-[24px] border border-white/10 bg-white/[0.02] p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-violet-400/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]"
              >
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
