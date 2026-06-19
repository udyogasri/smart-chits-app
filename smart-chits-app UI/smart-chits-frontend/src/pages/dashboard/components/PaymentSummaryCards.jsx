import { MdTrendingUp, MdTrendingDown, MdWarning, MdCheckCircle } from 'react-icons/md'

function PaymentSummaryCards({ paymentData = [], chit = {}, isMember = false }) {
  // Calculate totals from payment data
  const calculateTotals = () => {
    if (!paymentData || paymentData.length === 0) {
      return {
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalPayable: 0,
        nextDueDate: null,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      }
    }

    const paidPayments = paymentData.filter(p => p.status?.toLowerCase() === 'paid')
    const pendingPayments = paymentData.filter(
      p => p.status?.toLowerCase() === 'pending'
    )
    const overduePayments = paymentData.filter(
      p => p.status?.toLowerCase() === 'overdue'
    )

    const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Find next due date
    const nextDue = pendingPayments[0]?.due_date || pendingPayments[0]?.created_at
    
    return {
      totalPaid,
      totalPending,
      totalOverdue,
      totalPayable: totalPaid + totalPending + totalOverdue,
      nextDueDate: nextDue,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
    }
  }

  const totals = calculateTotals()

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate payment eligibility
  const canParticipateInAuction =
    isMember && totals.totalOverdue === 0 && totals.pendingCount === 0

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Paid Card */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 rounded-lg p-4 border border-green-600/30 hover:border-green-500/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-green-400 text-sm font-medium">Total Paid</p>
          <MdCheckCircle className="text-green-400 text-xl" />
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(totals.totalPaid)}
        </p>
        <p className="text-green-400 text-xs">
          {totals.paidCount} installments paid
        </p>
      </div>

      {/* Total Pending Card */}
      <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/10 rounded-lg p-4 border border-orange-600/30 hover:border-orange-500/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-orange-400 text-sm font-medium">Pending Amount</p>
          <MdTrendingDown className="text-orange-400 text-xl" />
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(totals.totalPending)}
        </p>
        <p className="text-orange-400 text-xs">
          {totals.pendingCount} payments due
        </p>
      </div>

      {/* Overdue Amount Card */}
      <div className="bg-gradient-to-br from-red-900/20 to-pink-900/10 rounded-lg p-4 border border-red-600/30 hover:border-red-500/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-red-400 text-sm font-medium">Overdue Amount</p>
          <MdWarning className="text-red-400 text-xl" />
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(totals.totalOverdue)}
        </p>
        {totals.totalOverdue > 0 && (
          <p className="text-red-400 text-xs">⚠ Action required</p>
        )}
        {totals.totalOverdue === 0 && (
          <p className="text-slate-400 text-xs">No overdue payments</p>
        )}
      </div>

      {/* Total Payable Card */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 rounded-lg p-4 border border-indigo-600/30 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="text-indigo-400 text-sm font-medium">Total Payable</p>
          <MdTrendingUp className="text-indigo-400 text-xl" />
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(totals.totalPayable)}
        </p>
        <p className="text-indigo-400 text-xs">
          Out of ₹{((chit.monthly_amount || 0) * (chit.total_months || 1)).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  )
}

export default PaymentSummaryCards
