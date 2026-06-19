import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../utils/constants'

function NavButton({ to, className, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none ${className}`}
    >
      {children}
    </Link>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-base font-bold text-white shadow-lg shadow-indigo-500/20">
            SC
          </span>
          SmartChits
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/80 text-slate-200 transition-all duration-300 hover:border-slate-500 hover:bg-slate-900/95 md:hidden"
        >
          <span className="block h-0.5 w-5 rounded-full bg-slate-200" />
          <span className="mt-1 block h-0.5 w-5 rounded-full bg-slate-200" />
          <span className="mt-1 block h-0.5 w-5 rounded-full bg-slate-200" />
        </button>

        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <nav className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isHome = item.href === '/'
              const isActive = isHome ? location.pathname === '/' : false

              return isHome ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-semibold transition-all duration-300 ${isActive ? 'text-white underline decoration-indigo-400/70 underline-offset-4' : 'text-slate-300 hover:text-white hover:underline hover:underline-offset-4 hover:decoration-sky-400/40'}`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold text-slate-300 transition-all duration-300 hover:text-white hover:underline hover:underline-offset-4 hover:decoration-sky-400/40"
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <NavButton
              to="/login"
              className="border border-sky-400/20 bg-slate-900/80 text-slate-100 shadow-[0_12px_30px_-22px_rgba(56,189,248,0.9)] hover:border-sky-300/50 hover:bg-slate-900/95 hover:text-white"
            >
              Login
            </NavButton>
            <NavButton
              to="/signup"
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 hover:shadow-2xl"
            >
              Sign Up
            </NavButton>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-800/70 bg-slate-950/95 px-4 py-5 shadow-2xl shadow-slate-950/10 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) =>
              item.href === '/' ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-200 transition-all duration-300 hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-200 transition-all duration-300 hover:text-white"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="mt-5 flex flex-col gap-3">
            <NavButton
              to="/login"
              className="w-full border border-sky-400/20 bg-slate-900/80 text-slate-100 shadow-[0_12px_30px_-22px_rgba(56,189,248,0.9)] hover:border-sky-300/50 hover:bg-slate-900/95 hover:text-white"
            >
              Login
            </NavButton>
            <NavButton
              to="/signup"
              className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 hover:shadow-2xl"
            >
              Sign Up
            </NavButton>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
