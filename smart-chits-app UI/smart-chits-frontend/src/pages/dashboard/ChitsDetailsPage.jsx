import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { fetcher } from '../../services/api'
import { useToast, ToastContainer } from '../../components/Toast'
import { MdArrowBack, MdShare, MdMoreVert } from 'react-icons/md'
import ChitOverview from './components/ChitOverview'
import PaymentSummaryCards from './components/PaymentSummaryCards'
import InstallmentTrackingSection from './components/InstallmentTrackingSection'
import MembersSection from './components/MembersSection'
import PaymentSection from './components/PaymentSection'
import AuctionSection from './components/AuctionSection'
import ActivityTimelineSection from './components/ActivityTimelineSection'
import DocumentsSection from './components/DocumentsSection'

function ChitsDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [chit, setChit] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [membersData, setMembersData] = useState(null)
  const [auctionsData, setAuctionsData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchChitDetails = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        
        // Fetch chit details
        const chitRes = await fetcher(`/chits/${id}`)
        setChit(chitRes)
        
        // Check if user is member
        try {
          const memberRes = await fetcher(`/chits/${id}/is-member`)
          setIsMember(memberRes.is_member)
        } catch (e) {
          console.log('Member check failed:', e)
        }
        
        // Fetch related data
        await Promise.all([
          fetchPaymentData(),
          fetchMembersData(),
          fetchAuctionsData()
        ])
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch chit details:', err)
        setError('Failed to load chit details')
      } finally {
        setLoading(false)
      }
    }

    const fetchPaymentData = async () => {
      try {
        const data = await fetcher(`/chits/${id}/payments`)
        setPaymentData(data)
      } catch (e) {
        console.log('Payment data fetch failed:', e)
      }
    }

    const fetchMembersData = async () => {
      try {
        const data = await fetcher(`/chits/${id}/members`)
        setMembersData(data)
      } catch (e) {
        console.log('Members data fetch failed:', e)
      }
    }

    const fetchAuctionsData = async () => {
      try {
        const data = await fetcher(`/chits/${id}/auctions`)
        setAuctionsData(data)
      } catch (e) {
        console.log('Auctions data fetch failed:', e)
      }
    }

    fetchChitDetails()
  }, [id])

  const handleJoinChit = async () => {
    try {
      await fetcher(`/chits/${id}/join`, {
        method: 'POST'
      })
      setIsMember(true)
      showToast('Successfully joined chit!', 'success')
      // Refresh payment data
      fetchPaymentData()
    } catch (err) {
      console.error('Failed to join chit:', err)
      showToast('Failed to join chit', 'error')
    }
  }

  const fetchPaymentData = async () => {
    try {
      const data = await fetcher(`/chits/${id}/payments`)
      setPaymentData(data)
    } catch (e) {
      console.log('Payment data fetch failed:', e)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg animate-pulse" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-700 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error || !chit) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">{error || 'Chit not found'}</p>
        <button
          onClick={() => navigate('/dashboard/browse')}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <MdArrowBack /> Back to Browse Chits
        </button>
      </div>
    )
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'completed':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  const remainingSlots = chit.total_members - (chit.current_members || chit.members || 0)

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 border border-indigo-500/20">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => navigate('/dashboard/browse')}
                className="p-2 hover:bg-indigo-500/20 rounded-lg transition-colors"
                title="Go back"
              >
                <MdArrowBack className="text-lg text-indigo-100" />
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{chit.name}</h1>
            <p className="text-indigo-100 mb-4 max-w-2xl">{chit.description}</p>
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusBadgeColor(chit.status)}`}>
                {chit.status || 'Active'}
              </span>
              <span className="text-indigo-100 text-sm">Created: {new Date(chit.created_at).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              className="p-3 hover:bg-indigo-500/20 rounded-lg transition-colors"
              title="Share"
            >
              <MdShare className="text-lg text-indigo-100" />
            </button>
            <button
              className="p-3 hover:bg-indigo-500/20 rounded-lg transition-colors"
              title="More options"
            >
              <MdMoreVert className="text-lg text-indigo-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {!isMember ? (
          <button
            onClick={handleJoinChit}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-green-500/20"
          >
            ✓ Join Chit
          </button>
        ) : (
          <>
            <div className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium opacity-75">
              ✓ Already Joined
            </div>
            <button
              onClick={() => navigate(`/dashboard/payment-history/${id}`)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Payment History
            </button>
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'installments', label: 'Installments' },
          { id: 'payments', label: 'Payments', hidden: !isMember },
          { id: 'members', label: 'Members' },
          { id: 'auctions', label: 'Auctions' },
          { id: 'activity', label: 'Activity', hidden: !isMember },
          { id: 'documents', label: 'Documents' },
        ]
          .filter(tab => !tab.hidden)
          .map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            <ChitOverview chit={chit} remainingSlots={remainingSlots} />
          </div>
          
          {isMember && paymentData && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Payment Status</h3>
              <PaymentSummaryCards paymentData={paymentData} chit={chit} isMember={isMember} />
            </div>
          )}
        </div>
      )}

      {/* Installments Tab */}
      {activeTab === 'installments' && (
        <>
          {isMember && paymentData ? (
            <InstallmentTrackingSection payments={paymentData} chit={chit} />
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <p className="text-slate-400">Join the chit to view installment details</p>
            </div>
          )}
        </>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <>
          {isMember && paymentData ? (
            <PaymentSection paymentData={paymentData} chitId={id} chit={chit} isMember={isMember} />
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <p className="text-slate-400">Join the chit to view payment details</p>
            </div>
          )}
        </>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <>
          {membersData ? (
            <MembersSection members={membersData} />
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <p className="text-slate-400">No member data available</p>
            </div>
          )}
        </>
      )}

      {/* Auctions Tab */}
      {activeTab === 'auctions' && (
        <>
          {auctionsData ? (
            <AuctionSection auctions={auctionsData} isMember={isMember} paymentData={paymentData || []} chitId={id} />
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <p className="text-slate-400">No auction data available</p>
            </div>
          )}
        </>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <>
          {isMember ? (
            <ActivityTimelineSection activities={[]} chitId={id} />
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <p className="text-slate-400">Join the chit to view activity</p>
            </div>
          )}
        </>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <DocumentsSection chitId={id} isMember={isMember} />
      )}

      {/* Footer Info */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-sm font-bold text-white mb-3">Need Help?</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Organization</p>
            <p className="text-white font-medium">{chit.organization_name || 'SmartChits'}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Duration</p>
            <p className="text-white font-medium">{chit.total_months} Months</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Total Members</p>
            <p className="text-white font-medium">{chit.total_members}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChitsDetailsPage
