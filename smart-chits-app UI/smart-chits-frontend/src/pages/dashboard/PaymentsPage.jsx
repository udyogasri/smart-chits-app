import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import PaymentSummaryCard from './components/PaymentSummaryCard'
import InstallmentCard from './components/InstallmentCard'
import PaymentModal from './components/PaymentModal'
import PaymentTimeline from './components/PaymentTimeline'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'installments', label: 'Pending Installments' },
  { id: 'timeline', label: 'Payment Timeline' },
]

export default function PaymentsPage() {
  const { currentUser, token } = useAuth()
  const { toast } = useToast()
  const refreshIntervalRef = useRef(null)

  // State Management
  const [summary, setSummary] = useState(null)
  const [installments, setInstallments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInstallment, setSelectedInstallment] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Fetch Payment Data
  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const authToken = token || localStorage.getItem('authToken')
      if (!authToken) {
        setError('Authentication required')
        return
      }

      // Fetch summary and installments in parallel
      const [summaryRes, installmentsRes] = await Promise.all([
        fetch('http://localhost:8000/payments/summary', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('http://localhost:8000/payments/installments', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ])

      if (!summaryRes.ok || !installmentsRes.ok) {
        throw new Error('Failed to fetch payment data')
      }

      const summaryData = await summaryRes.json()
      const installmentsData = await installmentsRes.json()

      setSummary(summaryData)
      setInstallments(Array.isArray(installmentsData) ? installmentsData : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch payment data')
      console.error('Payment fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!currentUser) return

    // Initial fetch
    fetchPaymentData()

    // Setup auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchPaymentData()
    }, 30000)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [currentUser, token])

  // Handle Payment Confirmation
  const handleConfirmPayment = async (paymentData) => {
    try {
      setIsProcessingPayment(true)

      const authToken = token || localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/payments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chit_id: paymentData.installment.chit_id,
          amount: paymentData.amount,
          month: paymentData.month,
          payment_method: paymentData.paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()

      // Success
      toast('Payment successful!', 'success')
      setIsPaymentModalOpen(false)
      setSelectedInstallment(null)

      // Refresh data
      await fetchPaymentData()

      return {
        success: true,
        transaction_id: result.transaction_id || 'TXN' + Date.now(),
      }
    } catch (err) {
      toast(err.message || 'Payment failed. Please try again.', 'error')
      return { success: false }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Handle Pay Now
  const handlePayNow = (installment) => {
    setSelectedInstallment(installment)
    setIsPaymentModalOpen(true)
  }

  // Filter installments based on status
  const filteredInstallments = installments.filter((inst) => {
    if (statusFilter === 'all') return true
    return inst.status.toLowerCase() === statusFilter.toLowerCase()
  })

  // Payment tips for Overview tab
  const paymentTips = [
    {
      title: 'Pay On Time',
      description: 'Pay your installments by the due date to avoid penalties',
    },
    {
      title: 'Multiple Payment Methods',
      description: 'We support UPI, Cards, Net Banking, and Wallet payments',
    },
    {
      title: 'Instant Receipts',
      description: 'Get payment confirmation and downloadable receipts instantly',
    },
    {
      title: 'No Hidden Charges',
      description: 'Transparent pricing with clear breakdown of all amounts',
    },
  ]

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Please log in to view payments</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
        <p className="text-slate-400">Manage and track your chit fund installments</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              selectedTab === tab.id
                ? 'text-indigo-400 border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Payment Summary</h2>
            <PaymentSummaryCard summary={summary} loading={loading} />
          </div>

          {/* Payment Tips */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Tips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{tip.title}</h3>
                  <p className="text-slate-400 text-sm">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'installments' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <span className="text-slate-400 text-sm self-center">
              {filteredInstallments.length} installment(s)
            </span>
          </div>

          {/* Installments List */}
          {loading && !installments.length ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800 rounded-lg h-24 animate-pulse border border-slate-700"
                ></div>
              ))}
            </div>
          ) : filteredInstallments.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400">
                {statusFilter === 'all'
                  ? 'No installments found'
                  : `No ${statusFilter} installments`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInstallments.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  installment={installment}
                  onPayNow={handlePayNow}
                  loading={isProcessingPayment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'timeline' && (
        <div>
          {loading && !installments.length ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading timeline...</p>
            </div>
          ) : (
            <PaymentTimeline installments={installments} />
          )}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        installment={selectedInstallment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedInstallment(null)
        }}
        onConfirm={handleConfirmPayment}
        loading={isProcessingPayment}
      />
    </div>
  )
}
