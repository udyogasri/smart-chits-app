import { useState } from 'react'
import { MdExpandMore, MdExpandLess, MdCheckCircle, MdSchedule, MdWarning, MdAlarm } from 'react-icons/md'
import { formatCurrency, formatDate, getStatusColor, getRemainingDaysText } from '../../../utils/paymentUtils'

export default function InstallmentCard({ installment, onPayNow, loading }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <MdCheckCircle className="text-green-400 text-xl" />
      case 'Pending':
        return <MdSchedule className="text-orange-400 text-xl" />
      case 'Overdue':
        return <MdWarning className="text-red-400 text-xl" />
      case 'Upcoming':
        return <MdAlarm className="text-blue-400 text-xl" />
      default:
        return <MdSchedule className="text-slate-400 text-xl" />
    }
  }

  const daysRemaining = installment.remaining_days
  const totalPayable = installment.total_payable

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all">
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {getStatusIcon(installment.status)}
          </div>

          {/* Main Info */}
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">{installment.chit_name}</p>
            <p className="text-slate-400 text-sm">
              Month {installment.month} • {formatDate(installment.due_date)}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold">{formatCurrency(installment.amount)}</p>
            <p className={`text-xs font-medium ${
              installment.status === 'Paid' ? 'text-green-400' :
              installment.status === 'Overdue' ? 'text-red-400' :
              installment.status === 'Upcoming' ? 'text-blue-400' :
              'text-orange-400'
            }`}>
              {installment.status}
            </p>
          </div>

          {/* Status Badge & Remaining Days */}
          <div className="text-right flex-shrink-0 ml-4">
            {daysRemaining >= 0 && installment.status !== 'Paid' && (
              <p className="text-slate-300 text-sm font-medium">{daysRemaining} days</p>
            )}
          </div>

          {/* Expand Icon */}
          <div className="flex-shrink-0 text-slate-400">
            {isExpanded ? (
              <MdExpandLess size={24} />
            ) : (
              <MdExpandMore size={24} />
            )}
          </div>
        </div>
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-slate-700 p-4 bg-slate-700/30 space-y-4">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Due Date</p>
              <p className="text-white font-medium">{formatDate(installment.due_date)}</p>
            </div>
            <div>
              <p className="text-slate-400">Installment Amount</p>
              <p className="text-white font-medium">{formatCurrency(installment.amount)}</p>
            </div>
            <div>
              <p className="text-slate-400">Penalty Amount</p>
              <p className="text-white font-medium">{formatCurrency(installment.penalty_amount)}</p>
            </div>
            <div>
              <p className="text-slate-400">Paid Date</p>
              <p className="text-white font-medium">
                {installment.paid_at ? formatDate(installment.paid_at) : 'Not paid yet'}
              </p>
            </div>
          </div>

          {/* Total Payable */}
          <div className="bg-slate-800 rounded p-3 border border-slate-600">
            <p className="text-slate-400 text-sm">Total Payable</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(totalPayable)}</p>
          </div>

          {/* Days Remaining / Status Text */}
          {installment.status !== 'Paid' && (
            <p className={`text-sm font-medium ${
              installment.status === 'Overdue' ? 'text-red-300' :
              installment.status === 'Pending' ? 'text-orange-300' :
              'text-blue-300'
            }`}>
              {getRemainingDaysText(daysRemaining)}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {installment.status !== 'Paid' && (
              <button
                onClick={() => onPayNow(installment)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
