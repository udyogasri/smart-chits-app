import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAllChits, joinChit, checkMembership } from '../../services/chitService'
import { JoinChitModal } from '../../components/JoinChitModal'
import { useToast, ToastContainer } from '../../components/Toast'

function ListChitsPage() {
  const navigate = useNavigate()
  const { t } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [chits, setChits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states
  const [selectedChit, setSelectedChit] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [memberStatus, setMemberStatus] = useState({})

  useEffect(() => {
    const fetchChits = async () => {
      try {
        const data = await getAllChits()
        console.log('Raw backend data:', data)
        setChits(data)
        
        const memberStatusMap = {}
        for (const chit of data) {
          try {
            const result = await checkMembership(chit.id)
            memberStatusMap[chit.id] = result.is_member
          } catch (error) {
            console.error(`Failed to check membership for chit ${chit.id}:`, error)
            memberStatusMap[chit.id] = false
          }
        }
        setMemberStatus(memberStatusMap)
      } catch (error) {
        console.error('Failed to fetch chits:', error)
        showToast('Failed to fetch chits. Using offline data.', 'warning')
        
        const mockChits = [
          {
            id: 1,
            name: "Gold Savings Plan",
            description: "Premium gold savings chit fund for long-term wealth creation",
            organizer: "SmartChits",
            chit_fund: 500000,
            total_months: 20,
            members: 15,
            current_members: 15,
            installment_amount: 25000,
            status: "active",
            bidding_open: true,
            total_members: 20,
            nextAuction: "2026-06-15"
          },
          {
            id: 2,
            name: "Silver Investment Plan",
            description: "Mid-range silver investment plan for moderate returns",
            organizer: "SmartChits",
            chit_fund: 300000,
            total_months: 20,
            members: 18,
            current_members: 18,
            installment_amount: 15000,
            status: "active",
            bidding_open: true,
            total_members: 20,
            nextAuction: "2026-06-20"
          },
          {
            id: 3,
            name: "Bronze Starter Plan",
            description: "Entry-level chit fund for first-time investors",
            organizer: "SmartChits",
            chit_fund: 100000,
            total_months: 20,
            members: 20,
            current_members: 20,
            installment_amount: 5000,
            status: "completed",
            bidding_open: false,
            total_members: 20,
            nextAuction: "Completed"
          },
          {
            id: 4,
            name: "Premium Diamond Plan",
            description: "High-value chit fund for serious investors",
            organizer: "SmartChits",
            chit_fund: 1000000,
            total_months: 20,
            members: 10,
            current_members: 10,
            installment_amount: 50000,
            status: "upcoming",
            bidding_open: false,
            total_members: 20,
            nextAuction: "2026-07-01"
          },
          {
            id: 5,
            name: "Monthly Savings Challenge",
            description: "Short-term savings challenge for quick returns",
            organizer: "SmartChits",
            chit_fund: 50000,
            total_months: 10,
            members: 10,
            current_members: 10,
            installment_amount: 5000,
            status: "active",
            bidding_open: true,
            total_members: 10,
            nextAuction: "2026-06-10"
          }
        ]
        
        setChits(mockChits)
        setError('')
      } finally {
        setLoading(false)
      }
    }

    fetchChits()
  }, [])

  const filteredChits = chits.filter(chit => {
    const matchesSearch = 
      (chit.name && chit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chit.description && chit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((chit.organizer || 'SmartChits').toLowerCase().includes(searchTerm.toLowerCase()))
    
    const chitStatus = chit.status || (chit.bidding_open ? 'active' : 'upcoming')
    const matchesFilter = filterStatus === 'all' || chitStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleJoinClick = (chit) => {
    setSelectedChit(chit)
    setIsModalOpen(true)
  }

  const handleConfirmJoin = async () => {
    if (!selectedChit) return

    setIsJoining(true)
    try {
      await joinChit(selectedChit.id)
      showToast(`Successfully joined ${selectedChit.name}!`, 'success')
      
      setChits(prevChits => 
        prevChits.map(c => 
          c.id === selectedChit.id 
            ? { ...c, current_members: (c.current_members || c.members || 0) + 1 }
            : c
        )
      )

      setMemberStatus(prev => ({
        ...prev,
        [selectedChit.id]: true
      }))

      setIsModalOpen(false)
      setSelectedChit(null)
    } catch (error) {
      console.error('Join error:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to join chit'
      showToast(errorMsg, 'error')
    } finally {
      setIsJoining(false)
    }
  }

  const getJoinButtonState = (chit) => {
    const isMember = memberStatus[chit.id]
    const currentMembers = Math.min(chit.current_members || chit.members || 0, chit.total_members || 20)
    const totalMembers = chit.total_members || 20
    const isFull = currentMembers >= totalMembers
    const isInactive = !chit.bidding_open && chit.status !== 'active'
    
    if (isMember) return { text: 'Already Joined', state: 'joined', disabled: true }
    if (isFull) return { text: 'Full', state: 'full', disabled: true }
    if (isInactive) return { text: 'Closed', state: 'closed', disabled: true }
    return { text: 'Join Now', state: 'available', disabled: false }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-white">Browse All Chits</h1>
            <p className="text-slate-400 mt-2">Explore and join available chit fund plans</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search chits by name, organizer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Total Chits</p>
              <p className="text-2xl font-bold text-white mt-1">{chits.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Active</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{chits.filter(c => c.bidding_open || c.status === 'active').length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{chits.filter(c => !c.bidding_open && c.status === 'upcoming').length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{chits.filter(c => c.status === 'completed').length}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Chit Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Monthly</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredChits.map((chit) => {
                    const buttonState = getJoinButtonState(chit)
                    const chitStatus = chit.status || (chit.bidding_open ? 'active' : 'upcoming')
                    const currentMembers = chit.current_members || chit.members || 0
                    const totalMembers = chit.total_members || 20
                    return (
                      <tr key={chit.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{chit.name}</div>
                            <div className="text-xs text-slate-400 line-clamp-1">{chit.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">₹{(chit.chit_fund || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{chit.total_months || chit.duration} months</td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>{currentMembers}/{totalMembers}</span>
                            {currentMembers >= totalMembers && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Full</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">₹{(chit.installment_amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            chitStatus === 'active' ? 'bg-green-100 text-green-800' :
                            chitStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {chitStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/chits/${chit.id}`)}
                            className="px-3 py-1 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleJoinClick(chit)}
                            disabled={buttonState.disabled}
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                              buttonState.state === 'available'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                : buttonState.state === 'joined'
                                ? 'bg-green-500/20 text-green-300 cursor-default'
                                : buttonState.state === 'full'
                                ? 'bg-red-500/20 text-red-300 cursor-default'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {buttonState.text}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredChits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No chits found matching your criteria</p>
            </div>
          )}

          <JoinChitModal
            isOpen={isModalOpen}
            chit={selectedChit}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedChit(null)
            }}
            onConfirm={handleConfirmJoin}
            isLoading={isJoining}
            isMember={memberStatus[selectedChit?.id] || false}
          />
        </>
      )}
    </div>
  )
}

export default ListChitsPage
