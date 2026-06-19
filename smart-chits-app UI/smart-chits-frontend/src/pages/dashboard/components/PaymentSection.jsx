import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdWarning, MdCheckCircle, MdSchedule } from 'react-icons/md'

function PaymentSection({ paymentData, chitId, chit = {}, isMember = false }) {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('date')
  const [expandedPayment, setExpandedPayment] = useState(null)

  if (!paymentData || paymentData.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
        <p className="text-slate-400">No payment records found.</p>
      </div>
    )
  }

  // Calculate totals
  const paidPayments = paymentData.filter(p => p.status?.toLowerCase() === 'paid')
  const pendingPayments = paymentData.filter(p => p.status?.toLowerCase() === 'pending')
  const overduePayments = paymentData.filter(p => p.status?.toLowerCase() === 'overdue')
  
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPayable = totalPaid + totalPending + totalOverdue

  // Determine if user can participate in auction
  const canParticipateInAuction = totalOverdue === 0 && pendingPayments.length === 0

  // Sort payments
  let sortedPayments = [...paymentData]
  if (sortBy === 'amount') {
    sortedPayments.sort((a, b) => (b.amount || 0) - (a.amount || 0))
  } else if (sortBy === 'status') {
    sortedPayments.sort((a, b) => {
      const statusOrder = { paid: 0, pending: 1, overdue: 2 }
      return (statusOrder[a.status?.toLowerCase()] || 3) - (statusOrder[b.status?.toLowerCase()] || 3)
    })
  } else {
    sortedPayments.sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <MdCheckCircle className="text-green-400 text-lg" />
      case 'pending':
        return <MdSchedule className="text-orange-400 text-lg" />
      case 'overdue':
        return <MdWarning className="text-red-400 text-lg" />
      default:
        return <MdSchedule className="text-slate-400 text-lg" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Eligibility Alert */}
      {!canParticipateInAuction && isMember && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex items-start gap-3">
          <MdWarning className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Auction Eligibility Blocked</p>
            <p className="text-red-400 text-sm mt-1">
              You have {totalOverdue > 0 ? 'overdue payments' : 'pending installments'}. Clear all pending and overdue payments to participate in auctions.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Payable</p>
          <p className="text-3xl font-bold text-indigo-400">
            ₹{totalPayable.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-green-700/30">
          <p className="text-slate-400 text-sm mb-2">Paid Amount</p>
          <p className="text-3xl font-bold text-green-400">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-500 text-xs mt-1">{paidPayments.length} payments</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-orange-700/30">
          <p className="text-slate-400 text-sm mb-2">Pending Amount</p>
          <p className="text-3xl font-bold text-orange-400">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-500 text-xs mt-1">{pendingPayments.length} payments</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-red-700/30">
          <p className="text-slate-400 text-sm mb-2">Overdue Amount</p>
          <p className="text-3xl font-bold text-red-400">
            ₹{totalOverdue.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-500 text-xs mt-1">{overduePayments.length} payments</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Payment History</h2>
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded px-3 py-1 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Payment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50 border-b border-slate-600">
              <tr>
                <th className="text-left p-3 text-slate-300 font-medium">Month</th>
                <th className="text-left p-3 text-slate-300 font-medium">Amount</th>
                <th className="text-left p-3 text-slate-300 font-medium">Due Date</th>
                <th className="text-left p-3 text-slate-300 font-medium">Payment Date</th>
                <th className="text-center p-3 text-slate-300 font-medium">Status</th>
                <th className="text-center p-3 text-slate-300 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedPayments.map((payment, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => setExpandedPayment(expandedPayment === idx ? null : idx)}
                >
                  <td className="p-3 text-white font-medium">
                    Month {payment.month || idx + 1}
                  </td>
                  <td className="p-3 text-slate-300">
                    ₹{(payment.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-slate-300">
                    {payment.due_date 
                      ? new Date(payment.due_date).toLocaleDateString('en-IN')
                      : 'N/A'
                    }
                  </td>
                  <td className="p-3 text-slate-300">
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString('en-IN')
                      : '-'
                    }
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded text-xs font-medium flex items-center justify-center gap-1 ${getStatusBadgeColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status?.toLowerCase() === 'paid'
                        ? '✓ Paid'
                        : payment.status?.toLowerCase() === 'overdue'
                        ? 'Overdue'
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {payment.status?.toLowerCase() === 'pending' || payment.status?.toLowerCase() === 'overdue' ? (
                      <button
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-xs"
                        title="Pay installment"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        className="text-slate-400 text-xs hover:text-slate-300"
                        title="Download receipt"
                      >
                        Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-600 flex-wrap">
          {pendingPayments.length > 0 && (
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Pay Next Installment
            </button>
          )}
          {overduePayments.length > 0 && (
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Pay Overdue Amount
            </button>
          )}
          <button
            onClick={() => navigate(`/dashboard/payment-history/${chitId}`)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            View Full History
          </button>
        </div>
      </div>

      {/* Payment Tips */}
      <div className="bg-indigo-900/10 border border-indigo-600/20 rounded-lg p-4">
        <p className="text-indigo-300 text-sm">
          <span className="font-medium block mb-2">💡 Payment Tips</span>
          <span className="text-indigo-400 block text-xs leading-relaxed">
            • Pay your installments on time to avoid penalties and maintain auction eligibility
            {'\n'}• Keep payment receipts for your records
            {'\n'}• Overdue payments may prevent you from participating in auctions
          </span>
        </p>
      </div>
    </div>
  )
}

export default PaymentSection
