const testimonials = [
  {
    name: 'Ananya Sharma',
    role: 'Chit Fund Organizer',
    quote: 'SmartChits helped our group improve collection accuracy and keep every member informed with a single system.',
  },
  {
    name: 'Rohit Patel',
    role: 'Community Treasurer',
    quote: 'The payout tracking and reporting dashboard made it easy to review fund health before every meeting.',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.06),_transparent_50%)]" />
      <div className="pointer-events-none absolute left-1/3 top-12 h-28 w-28 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Customer success stories</p>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Loved by{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                modern chit communities
              </span>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="group relative rounded-[24px] border border-white/10 bg-white/[0.02] p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <p className="text-lg italic leading-8 text-slate-300 mb-6">"{item.quote}"</p>
                  <div>
                    <p className="font-bold text-white text-lg">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
