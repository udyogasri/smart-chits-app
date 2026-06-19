const plans = [
  {
    name: 'Starter Plan',
    price: '₹2,500',
    cadence: 'monthly',
    benefits: ['24-member circle', 'Automated payout reminders', 'Digital receipts'],
  },
  {
    name: 'Growth Plan',
    price: '₹4,750',
    cadence: 'monthly',
    benefits: ['48-member circle', 'Dynamic payment schedules', 'Performance dashboard'],
    featured: true,
  },
  {
    name: 'Enterprise Plan',
    price: '₹8,900',
    cadence: 'monthly',
    benefits: ['Customized chapters', 'Priority support', 'Advanced reports'],
  },
]

function ChitPlans() {
  return (
    <section id="plans" className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_50%)]" />
      <div className="pointer-events-none absolute -right-16 top-20 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 bottom-20 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Plans that scale with your circle</p>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Flexible chit plans for{' '}
              <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
                every community
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300">
              Choose a plan that matches your fund cycle, member count, and payout cadence with transparent pricing and simplified operations.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`group relative rounded-[28px] border bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] ${
                  plan.featured
                    ? 'border-cyan-400/30 bg-white/[0.05] shadow-cyan-500/20 hover:border-cyan-400/50 hover:bg-white/[0.08] hover:shadow-[0_0_50px_rgba(34,211,238,0.3)]'
                    : 'border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.05]'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xl font-bold text-white">{plan.name}</p>
                  </div>

                  <div className="mt-8 space-y-2">
                    <p className="text-6xl font-extrabold text-white">{plan.price}</p>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{plan.cadence}</p>
                  </div>

                  <ul className="mt-10 space-y-4 text-slate-300">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs text-white shadow-sm">
                          ✓
                        </span>
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="mt-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1">
                    Start {plan.name}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChitPlans
