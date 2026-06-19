import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-800/80 bg-slate-950/80 p-10 text-center shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">404 error</p>
        <h1 className="mt-6 text-5xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">
          The route you followed does not exist yet. Head back to the landing page to explore plans and membership features.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
