import Hero from '../components/ui/Hero'
import ChitPlans from '../components/ui/ChitPlans'
import Features from '../components/ui/Features'
import Testimonials from '../components/ui/Testimonials'
import FAQ from '../components/ui/FAQ'

function HomePage() {
  return (
    <div className="space-y-32">
      <Hero />
      <ChitPlans />
      <Features />
      <Testimonials />
      <FAQ />
    </div>
  )
}

export default HomePage
