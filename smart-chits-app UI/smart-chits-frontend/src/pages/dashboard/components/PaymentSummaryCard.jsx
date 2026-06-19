import { MdTrendingUp, MdTrendingDown, MdWarning, MdSchedule, MdCalendarToday, MdCheckCircle } from 'react-icons/md'
import { formatCurrency, formatDate } from '../../../utils/paymentUtils'

export default function PaymentSummaryCard({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-700 rounded-lg p-4 animate-pulse h-28"></div>
        ))}
      </div>
    )
  }

  if (!summary) return null

  const cards = [
    {
      icon: <MdTrendingUp className="text-orange-400" />,
      label: 'Total Pending',
      value: formatCurrency(summary.total_pending),
      color: 'orange',
    },
    {
      icon: <MdCheckCircle className="text-green-400" />,
      label: 'Paid This Month',
      value: formatCurrency(summary.paid_this_month),
      color: 'green',
    },
    {
      icon: <MdTrendingDown className="text-green-400" />,
      label: 'Total Paid',
      value: formatCurrency(summary.total_paid),
      color: 'green',
    },
    {
      icon: <MdWarning className="text-red-400" />,
      label: 'Overdue Amount',
      value: formatCurrency(summary.overdue_amount),
      color: 'red',
    },
    {
      icon: <MdSchedule className="text-blue-400" />,
      label: 'Upcoming Due',
      value: formatCurrency(summary.upcoming_due),
      color: 'blue',
    },
    {
      icon: <MdCalendarToday className="text-purple-400" />,
      label: 'Next Due Date',
      value: formatDate(summary.next_due_date),
      color: 'purple',
    },
  ]

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-2xl">{card.icon}</div>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1 truncate">{card.label}</p>
          <p className="text-white font-bold text-lg truncate">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
