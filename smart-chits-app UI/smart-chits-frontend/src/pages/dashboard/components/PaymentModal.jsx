import { useState } from 'react'
import { MdClose, MdCheckCircle, MdError, MdDownload } from 'react-icons/md'
import { formatCurrency, formatDate } from '../../../utils/paymentUtils'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', emoji: '📱' },
  { id: 'debit', label: 'Debit Card', emoji: '💳' },
  { id: 'credit', label: 'Credit Card', emoji: '💰' },
  { id: 'netbanking', label: 'Net Banking', emoji: '🏦' },
  { id: 'wallet', label: 'Wallet', emoji: '👛' },
]

export default function PaymentModal({ installment, isOpen, onClose, onConfirm, loading }) {
  const [state, setState] = useState(null) // null = form, 'success' = success, 'failed' = failed
  const [selectedMethod, setSelectedMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')

  if (!isOpen || !installment) return null

  const totalPayable = installment.total_payable

  const handleConfirm = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method')
      return
    }

    const result = await onConfirm({
      installment,
      amount: totalPayable,
      month: installment.month,
      paymentMethod: selectedMethod,
    })

    if (result.success) {
      setTransactionId(result.transaction_id)
      setState('success')
    } else {
      setState('failed')
    }
  }

  const handleReset = () => {
    setState(null)
    setSelectedMethod('')
    setTransactionId('')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleReset}
        ></div>
      )}

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              {state === 'success' ? 'Payment Successful' :
               state === 'failed' ? 'Payment Failed' :
               'Confirm Payment'}
            </h2>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {state === null && (
              <>
                {/* Order Summary */}
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wide text-slate-300">
                    Order Summary
                  </h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3 border border-slate-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Chit</span>
                      <span className="text-white font-medium">{installment.chit_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Installment Month</span>
                      <span className="text-white font-medium">Month {installment.month}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Due Date</span>
                      <span className="text-white font-medium">{formatDate(installment.due_date)}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-3 flex justify-between text-sm">
                      <span className="text-slate-400">Installment Amount</span>
                      <span className="text-white font-medium">{formatCurrency(installment.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Penalty Amount</span>
                      <span className="text-red-400 font-medium">{formatCurrency(installment.penalty_amount)}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-3 flex justify-between">
                      <span className="text-white font-semibold">Total Payable</span>
                      <span className="text-2xl font-bold text-indigo-400">{formatCurrency(totalPayable)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wide text-slate-300">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedMethod === method.id
                            ? 'border-indigo-500 bg-indigo-500/20'
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.emoji}</div>
                        <p className="text-white text-xs font-medium text-center">{method.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedMethod || loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </>
            )}

            {state === 'success' && (
              <>
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-full p-4">
                    <MdCheckCircle className="text-green-400 text-5xl" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center space-y-2">
                  <p className="text-white font-semibold text-lg">Payment Successful!</p>
                  <p className="text-slate-400 text-sm">Your payment has been processed</p>
                </div>

                {/* Transaction Details */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-white text-sm font-mono">{transactionId}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(transactionId)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount</span>
                    <span className="text-white font-medium">{formatCurrency(totalPayable)}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MdDownload /> Download Receipt
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              </>
            )}

            {state === 'failed' && (
              <>
                {/* Error Icon */}
                <div className="flex justify-center">
                  <div className="bg-red-500/20 border border-red-500/50 rounded-full p-4">
                    <MdError className="text-red-400 text-5xl" />
                  </div>
                </div>

                {/* Error Message */}
                <div className="text-center space-y-2">
                  <p className="text-white font-semibold text-lg">Payment Failed</p>
                  <p className="text-slate-400 text-sm">Please try again or contact support</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setState(null)
                      setSelectedMethod('')
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
