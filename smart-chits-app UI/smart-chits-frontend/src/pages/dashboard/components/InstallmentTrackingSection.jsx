import { useState } from 'react'
import { MdCheck, MdClose, MdSchedule, MdWarning } from 'react-icons/md'

function InstallmentTrackingSection({ payments, chit }) {
  const [expandedMonth, setExpandedMonth] = useState(null)

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Installment Tracking</h2>
        <p className="text-slate-400">No installment records available.</p>
      </div>
    )
  }

  // Sort payments by month
  const sortedPayments = [...payments].sort((a, b) => {
    const monthA = parseInt(a.month) || 0
    const monthB = parseInt(b.month) || 0
    return monthA - monthB
  })

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <MdCheck className="text-green-400 text-lg" />
      case 'pending':
        return <MdSchedule className="text-orange-400 text-lg" />
      case 'overdue':
        return <MdWarning className="text-red-400 text-lg" />
      default:
        return <MdClose className="text-slate-400 text-lg" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-900/20 border-green-600/30'
      case 'pending':
        return 'bg-orange-900/20 border-orange-600/30'
      case 'overdue':
        return 'bg-red-900/20 border-red-600/30'
      default:
        return 'bg-slate-700/30 border-slate-600'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-900/30 text-green-400'
      case 'pending':
        return 'bg-orange-900/30 text-orange-400'
      case 'overdue':
        return 'bg-red-900/30 text-red-400'
      default:
        return 'bg-slate-700 text-slate-400'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '✓ Paid'
      case 'pending':
        return 'Pending'
      case 'overdue':
        return '⚠ Overdue'
      default:
        return 'Upcoming'
    }
  }

  // Calculate summary
  const paidCount = sortedPayments.filter(p => p.status?.toLowerCase() === 'paid').length
  const pendingCount = sortedPayments.filter(p => p.status?.toLowerCase() === 'pending').length
  const overdueCount = sortedPayments.filter(p => p.status?.toLowerCase() === 'overdue').length

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Installment Tracking</h2>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-600/30">
            <p className="text-green-400 text-sm font-medium">{paidCount} Paid</p>
            <p className="text-slate-300 text-xs text-slate-400">Completed</p>
          </div>
          <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-600/30">
            <p className="text-orange-400 text-sm font-medium">{pendingCount} Pending</p>
            <p className="text-slate-300 text-xs text-slate-400">Due Soon</p>
          </div>
          <div className="bg-red-900/20 rounded-lg p-3 border border-red-600/30">
            <p className="text-red-400 text-sm font-medium">{overdueCount} Overdue</p>
            <p className="text-slate-300 text-xs text-slate-400">Attention</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
            <p className="text-indigo-400 text-sm font-medium">
              {paidCount + pendingCount + overdueCount}/{sortedPayments.length}
            </p>
            <p className="text-slate-300 text-xs text-slate-400">Progress</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden border border-slate-600">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all"
            style={{
              width: `${(paidCount / sortedPayments.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-slate-400 text-xs mt-2">
          {Math.round((paidCount / sortedPayments.length) * 100)}% installments paid
        </p>
      </div>

      {/* Installments Timeline */}
      <div className="space-y-3">
        {sortedPayments.map((payment, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border cursor-pointer transition-all ${getStatusColor(
              payment.status
            )} ${expandedMonth === idx ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => setExpandedMonth(expandedMonth === idx ? null : idx)}
          >
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {getStatusIcon(payment.status)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    Month {payment.month || idx + 1}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {payment.due_date
                      ? new Date(payment.due_date).toLocaleDateString('en-IN')
                      : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white font-bold">
                    ₹{(payment.amount || 0).toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(
                    payment.status
                  )}`}>
                    {getStatusLabel(payment.status)}
                  </p>
                </div>
                <span className="text-slate-400 text-lg">
                  {expandedMonth === idx ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedMonth === idx && (
              <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Amount</p>
                    <p className="text-white font-medium">
                      ₹{(payment.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Status</p>
                    <p className="text-white font-medium">
                      {getStatusLabel(payment.status)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Due Date</p>
                    <p className="text-white font-medium">
                      {payment.due_date
                        ? new Date(payment.due_date).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Payment Date</p>
                    <p className="text-white font-medium">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('en-IN')
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Penalties if any */}
                {payment.penalty_amount && payment.penalty_amount > 0 && (
                  <div className="bg-red-900/20 rounded p-3 border border-red-600/20">
                    <p className="text-red-400 text-sm font-medium">
                      Penalty: ₹{payment.penalty_amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {payment.status?.toLowerCase() === 'pending' ||
                  (payment.status?.toLowerCase() === 'overdue' && (
                    <button className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors">
                      Pay Now
                    </button>
                  ))}

                {payment.status?.toLowerCase() === 'paid' && (
                  <button className="w-full mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg font-medium transition-colors">
                    Download Receipt
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      <div className="mt-6 pt-6 border-t border-slate-600 bg-indigo-900/10 rounded-lg p-4">
        <p className="text-indigo-300 text-sm">
          <span className="font-medium">Note:</span> Keep your installments paid on
          time to maintain eligibility for auctions and avoid penalties.
        </p>
      </div>
    </div>
  )
}

export default InstallmentTrackingSection
