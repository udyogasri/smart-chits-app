import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
        <div className="w-full max-w-4xl rounded-[36px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-slate-700/30 sm:p-12 lg:p-16">
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-r from-sky-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">Smarter</span>
              <span className="block">chit fund plans for</span>
              <span className="block bg-gradient-to-r from-sky-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">modern communities</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-gray-300 sm:text-xl">
              Create more visible savings journeys, smoother payout rhythms, and connected member experiences with a premium fintech platform built for modern chit fund operations.
            </p>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 px-8 py-4 text-sm font-semibold text-white shadow-[0_25px_80px_-34px_rgba(59,130,246,0.8)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="inline-flex min-w-[12rem] items-center justify-center rounded-full border border-white/10 bg-slate-900/85 px-8 py-4 text-sm font-semibold text-slate-200 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-slate-900/95 hover:shadow-2xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
