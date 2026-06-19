import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300">
            SmartChits
          </div>
          <p className="text-sm leading-7 text-slate-400">
            A modern chit fund platform crafted for fintech communities who want transparency, better member engagement, and secure collections.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Product</h3>
            <ul className="space-y-3 text-slate-300">
              <li><a href="#plans" className="hover:text-white">Plans</a></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Company</h3>
            <ul className="space-y-3 text-slate-300">
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Connect</h3>
            <ul className="space-y-3 text-slate-300">
              <li><a href="#" className="hover:text-white">Contact us</a></li>
              <li><a href="#" className="hover:text-white">Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800/80 px-4 pt-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        © 2026 SmartChits. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
