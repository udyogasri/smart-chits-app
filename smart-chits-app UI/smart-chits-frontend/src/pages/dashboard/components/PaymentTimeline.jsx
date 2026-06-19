import { MdCheckCircle, MdSchedule, MdWarning, MdAlarm } from 'react-icons/md'
import { formatDate, calculatePaymentStats } from '../../../utils/paymentUtils'

export default function PaymentTimeline({ installments }) {
  if (!installments || installments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No payment records available</p>
      </div>
    )
  }

  const stats = calculatePaymentStats(installments)
  const paidCount = stats.paid || 0
  const totalCount = installments.length
  const progressPercentage = totalCount > 0 ? (paidCount / totalCount) * 100 : 0

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <MdCheckCircle className="text-green-400" size={20} />
      case 'Pending':
        return <MdSchedule className="text-orange-400" size={20} />
      case 'Overdue':
        return <MdWarning className="text-red-400" size={20} />
      case 'Upcoming':
        return <MdAlarm className="text-blue-400" size={20} />
      default:
        return <MdSchedule className="text-slate-400" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900/20 border-green-600/30'
      case 'Pending':
        return 'bg-orange-900/20 border-orange-600/30'
      case 'Overdue':
        return 'bg-red-900/20 border-red-600/30'
      case 'Upcoming':
        return 'bg-blue-900/20 border-blue-600/30'
      default:
        return 'bg-slate-900/20 border-slate-600/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Overall Progress</h3>
          <span className="text-slate-400 text-sm">
            {paidCount} of {totalCount} paid
          </span>
        </div>
        <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <p className="text-green-400 text-sm font-medium">Paid</p>
          <p className="text-white text-2xl font-bold">{stats.paid || 0}</p>
        </div>
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
          <p className="text-orange-400 text-sm font-medium">Pending</p>
          <p className="text-white text-2xl font-bold">{stats.pending || 0}</p>
        </div>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <p className="text-red-400 text-sm font-medium">Overdue</p>
          <p className="text-white text-2xl font-bold">{stats.overdue || 0}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <p className="text-blue-400 text-sm font-medium">Upcoming</p>
          <p className="text-white text-2xl font-bold">{stats.upcoming || 0}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold">Payment Timeline</h3>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="flex items-end gap-2 overflow-x-auto pb-4">
            {installments.map((installment, index) => (
              <div key={installment.id} className="flex flex-col items-center flex-shrink-0">
                {/* Node */}
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                  installment.status === 'Paid' ? 'bg-green-900/30 border-green-500' :
                  installment.status === 'Pending' ? 'bg-orange-900/30 border-orange-500' :
                  installment.status === 'Overdue' ? 'bg-red-900/30 border-red-500' :
                  'bg-blue-900/30 border-blue-500'
                }`}>
                  {getStatusIcon(installment.status)}
                </div>

                {/* Connector Line */}
                {index < installments.length - 1 && (
                  <div className="w-0.5 h-8 mb-2 bg-slate-700"></div>
                )}

                {/* Month Label */}
                <span className="text-xs text-slate-400 text-center whitespace-nowrap">
                  M{installment.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-3">
          {installments.map((installment) => (
            <div key={installment.id} className={`border rounded-lg p-3 ${getStatusColor(installment.status)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(installment.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">Month {installment.month}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      installment.status === 'Paid' ? 'text-green-400 bg-green-900/30' :
                      installment.status === 'Pending' ? 'text-orange-400 bg-orange-900/30' :
                      installment.status === 'Overdue' ? 'text-red-400 bg-red-900/30' :
                      'text-blue-400 bg-blue-900/30'
                    }`}>
                      {installment.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{formatDate(installment.due_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
