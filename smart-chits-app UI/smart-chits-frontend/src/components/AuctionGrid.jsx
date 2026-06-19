import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetcher } from '../services/api'
import { connectAuctionSocket, disconnectAllAuctionSockets } from '../services/socket'
import { MdAttachMoney, MdEmojiEvents } from 'react-icons/md'

function AuctionGrid({ endpoint, title }) {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const connectedAuctionIds = useRef(new Set())

  const updateAuction = useCallback((auctionId, payload) => {
    setAuctions((prev) =>
      prev.map((auction) => {
        if (auction.id !== auctionId) {
          return auction
        }

        return {
          ...auction,
          status: payload.status ?? auction.status,
          winning_bid_amount: payload.highestBid ?? payload.winningBidAmount ?? auction.winning_bid_amount,
          winner_member_id: payload.winnerMemberId ?? auction.winner_member_id,
          winner_prize_amount: payload.prizeAmount ?? auction.winner_prize_amount,
          dividend_per_member: payload.dividendPerMember ?? auction.dividend_per_member,
          started_at: payload.startedAt ?? auction.started_at,
          ...payload,
        }
      })
    )
  }, [])

  const handleSocketMessage = useCallback(
    (message) => {
      if (!message || typeof message !== 'object') {
        return
      }

      const { auctionId, payload } = message
      if (!auctionId || !payload) {
        return
      }

      updateAuction(auctionId, payload)
    },
    [updateAuction]
  )

  const location = useLocation()
  const navigate = useNavigate()

  const currentBasePath = () => {
    const segments = location.pathname.split('/').filter(Boolean)
    return `/${segments.slice(0, 2).join('/')}`
  }

  const connectToAuction = useCallback(
    (auctionId) => {
      if (connectedAuctionIds.current.has(auctionId)) {
        return
      }

      connectedAuctionIds.current.add(auctionId)
      connectAuctionSocket(auctionId, handleSocketMessage, (error) => {
        console.error('Auction socket error:', error)
      })
    },
    [handleSocketMessage]
  )

  useEffect(() => {
    async function loadAuctions() {
      setLoading(true)
      try {
        const data = await fetcher(endpoint)
        setAuctions(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Failed to load auctions:', err)
        setError('Failed to load auctions')
        setAuctions([])
      } finally {
        setLoading(false)
      }
    }

    loadAuctions()
  }, [endpoint])

  useEffect(() => {
    auctions.forEach((auction) => {
      if (auction?.id) {
        connectToAuction(auction.id)
      }
    })
  }, [auctions, connectToAuction])

  useEffect(() => {
    return () => {
      disconnectAllAuctionSockets()
      connectedAuctionIds.current.clear()
    }
  }, [])

  const formatDate = (value) => {
    if (!value) return 'N/A'
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading auctions...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-300 text-lg">No auctions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2">{auction.auction_number || `Auction #${auction.id}`}</h3>
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2">📅 <span>Date: {formatDate(auction.auction_date)}</span></p>
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><MdAttachMoney className="text-base" /> <span>Highest Bid: {auction.winning_bid_amount ?? 'No bids'}</span></p>
              <p className="text-slate-400 text-sm mb-1">🎁 Prize: ₹{auction.winner_prize_amount ?? 0}</p>
              <p className="text-slate-400 text-sm mb-1">👤 Winner: {auction.winner_member_id ? `Member ${auction.winner_member_id}` : 'TBD'}</p>
              <p className="text-slate-400 text-sm mb-4 flex items-center gap-2"><MdEmojiEvents className="text-base" /> <span>Status: {auction.status || 'Pending'}</span></p>
              <button
                type="button"
                onClick={() => navigate(`${currentBasePath()}/${auction.id}`)}
                className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AuctionGrid
