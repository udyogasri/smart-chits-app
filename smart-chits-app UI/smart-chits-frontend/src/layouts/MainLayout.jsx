import { Outlet } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import useScrollToTop from '../hooks/useScrollToTop'

function MainLayout() {
  useScrollToTop()

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
