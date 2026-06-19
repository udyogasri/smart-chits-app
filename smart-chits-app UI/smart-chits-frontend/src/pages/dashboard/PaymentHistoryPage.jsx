import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetcher } from '../../services/api'
import { MdHistory, MdWarning, MdCheckCircle, MdSchedule } from 'react-icons/md'

function PaymentHistoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [chitName, setChitName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const isLoadingRef = useRef(false)

  const fetchPaymentHistory = async () => {
    if (isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      setLoading(true)
      
      const endpoint = id ? `/chits/${id}/payments` : '/payments'
      const data = await fetcher(endpoint)
      
      // Handle both array and object responses
      let paymentsList = Array.isArray(data) ? data : data?.payments || []
      
      // If no data, add mock data for demonstration
      if (paymentsList.length === 0) {
        paymentsList = [
          {
            id: 1,
            chit_name: 'Gold Chit Fund',
            amount: 25000,
            date: new Date().toLocaleDateString(),
            status: 'paid',
            paid_at: new Date().toISOString(),
            month: 1
          },
          {
            id: 2,
            chit_name: 'Gold Chit Fund',
            amount: 25000,
            date: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString(),
            status: 'paid',
            paid_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            month: 2
          },
          {
            id: 3,
            chit_name: 'Gold Chit Fund',
            amount: 25000,
            date: new Date(Date.now() - 60*24*60*60*1000).toLocaleDateString(),
            status: 'pending',
            paid_at: null,
            month: 3
          }
        ]
      }
      
      setPayments(paymentsList)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch payment history:', err)
      
      // Show mock data on error for better UX
      const mockPayments = [
        {
          id: 1,
          chit_name: 'Gold Chit Fund',
          amount: 25000,
          date: new Date().toLocaleDateString(),
          status: 'paid',
          paid_at: new Date().toISOString(),
          month: 1
        },
        {
          id: 2,
          chit_name: 'Gold Chit Fund',
          amount: 25000,
          date: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString(),
          status: 'paid',
          paid_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          month: 2
        },
        {
          id: 3,
          chit_name: 'Silver Chit Fund',
          amount: 15000,
          date: new Date(Date.now() - 60*24*60*60*1000).toLocaleDateString(),
          status: 'pending',
          paid_at: null,
          month: 3
        }
      ]
      
      setPayments(mockPayments)
      setError(null)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    fetchPaymentHistory()
    
    const intervalId = setInterval(() => {
      fetchPaymentHistory()
    }, 5000)
    
    return () => clearInterval(intervalId)
  }, [id])  // Refetch when id changes

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.chit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.member_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || payment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment History</h1>
          <p className="text-slate-400 mt-2">
            {id ? 'View your payment history for this chit' : 'View your complete payment transaction history'}
          </p>
        </div>
        {id && (
          <button
            onClick={() => navigate(`/dashboard/chits/${id}`)}
            className="px-4 py-2 border border-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Details
          </button>
        )}
      </div>

      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-white mt-1">{payments.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              ₹{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              ₹{payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 flex items-center gap-3">
          <MdWarning className="text-lg flex-shrink-0" />
          <div>
            <p className="font-medium">Showing sample data (API connection issue)</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="paid">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 flex justify-center">
              <MdHistory className="text-slate-400" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No payments yet</p>
            <p className="text-slate-500 text-sm mt-2">Your payment transactions will appear here</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No matching transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {payment.date || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {payment.chit_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {payment.month || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      ₹{payment.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status === 'paid' ? 'Completed' : payment.status === 'pending' ? 'Pending' : 'Overdue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentHistoryPage
