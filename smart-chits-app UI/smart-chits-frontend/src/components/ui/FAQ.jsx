import { useState } from 'react'

const faqItems = [
  {
    question: 'How quickly can I launch a chit fund plan?',
    answer: 'You can create a new plan and invite members in minutes, with automated reminders and payout scheduling built in.',
  },
  {
    question: 'Can I manage multiple groups from one dashboard?',
    answer: 'Yes. The dashboard supports multiple chit chapters, member groups, and configurable payout cycles in a single view.',
  },
  {
    question: 'Is member contribution tracking secure?',
    answer: 'All contribution records are stored with encrypted auditing, and access controls keep sensitive fund details private.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.06),_transparent_50%)]" />
      <div className="pointer-events-none absolute right-1/4 top-8 h-24 w-24 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300">FAQ</p>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Frequently asked{' '}
              <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group w-full rounded-[24px] border border-white/10 bg-white/[0.02] p-8 text-left shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(147,51,234,0.15)]"
                >
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-lg font-bold text-white">{item.question}</span>
                      <span className="text-2xl text-violet-400 transition-transform duration-300 group-hover:scale-110">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-6 text-slate-300 leading-relaxed">{item.answer}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
