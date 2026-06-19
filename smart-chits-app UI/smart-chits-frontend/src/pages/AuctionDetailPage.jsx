import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { fetcher } from '../services/api'
import { connectAuctionSocket, disconnectAuctionSocket } from '../services/socket'

function AuctionDetailPage() {
  const { auctionId } = useParams()
  const location = useLocation()
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [socketError, setSocketError] = useState(null)

  const isAdminView = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin')

  const loadAuction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detail, bidsList] = await Promise.all([
        fetcher(`/auction/${auctionId}`),
        fetcher(`/auction/${auctionId}/bids`),
      ])
      setAuction(detail)
      setBids(Array.isArray(bidsList) ? bidsList : [])
    } catch (err) {
      setError(err.info?.detail || err.message || 'Failed to load auction')
    } finally {
      setLoading(false)
    }
  }, [auctionId])

  const refreshBids = useCallback(async () => {
    try {
      const bidsList = await fetcher(`/auction/${auctionId}/bids`)
      setBids(Array.isArray(bidsList) ? bidsList : [])
    } catch (err) {
      console.error('Failed to refresh bids:', err)
    }
  }, [auctionId])

  const handleSocketMessage = useCallback(
    (message) => {
      if (!message || typeof message !== 'object') {
        return
      }

      const { event, payload } = message
      if (!payload) {
        return
      }

      setAuction((prev) => ({
        ...prev,
        ...payload,
      }))

      if (event === 'auction:newBid' || event === 'auction:highestBid') {
        refreshBids()
      }
    },
    [refreshBids]
  )

  useEffect(() => {
    loadAuction()
  }, [loadAuction])

  useEffect(() => {
    connectAuctionSocket(auctionId, handleSocketMessage, setSocketError)
    return () => {
      disconnectAuctionSocket(auctionId)
    }
  }, [auctionId, handleSocketMessage])

  const handleBidSubmit = async (event) => {
    event.preventDefault()
    if (!bidAmount) {
      setError('Enter a bid amount')
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      await fetcher(`/auction/${auctionId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ bid_amount: Number(bidAmount) }),
      })
      setMessage('Bid placed successfully')
      setBidAmount('')
      await loadAuction()
      await refreshBids()
    } catch (err) {
      setError(err.info?.detail || err.message || 'Failed to place bid')
    } finally {
      setSaving(false)
    }
  }

  const handleAuctionAction = async (action) => {
    if (!action) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await fetcher(`/auction/${auctionId}/${action}`, {
        method: 'POST',
      })
      setMessage(`Auction ${action} request completed successfully`)
      await loadAuction()
    } catch (err) {
      setError(err.info?.detail || err.message || `Failed to ${action} auction`)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Auction Details</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100">
          {message}
        </div>
      )}

      {socketError && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-100">
          Live update error: {String(socketError)}
        </div>
      )}

      {loading || !auction ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading auction details...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">{auction.auction_number || `Auction #${auction.id}`}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white">{formatDate(auction.auction_date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <p className="text-white">{auction.status || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total pool</p>
                  <p className="text-white">₹{auction.total_pool_amount?.toLocaleString() ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Max bid</p>
                  <p className="text-white">₹{auction.max_bid_limit?.toLocaleString() ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Highest bid</p>
                  <p className="text-white">₹{auction.highest_bid_amount ?? auction.winning_bid_amount ?? 'No bids'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Winner</p>
                  <p className="text-white">{auction.highest_bid_member_name || auction.winner_member_id ? `Member ${auction.winner_member_id}` : 'TBD'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Auction metrics</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-slate-400 text-sm">Eligible members</p>
                  <p className="text-white">{auction.eligible_member_count ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total members</p>
                  <p className="text-white">{auction.member_count ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Prize amount</p>
                  <p className="text-white">₹{auction.winner_prize_amount?.toLocaleString() ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Dividend per member</p>
                  <p className="text-white">₹{auction.dividend_per_member?.toLocaleString() ?? 'N/A'}</p>
                </div>
              </div>
            </div>

            {isAdminView && (
              <div className="space-y-3">
                {auction.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleAuctionAction('start')}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Starting...' : 'Start Auction'}
                  </button>
                )}
                {auction.status === 'LIVE' && (
                  <button
                    type="button"
                    onClick={() => handleAuctionAction('complete')}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Completing...' : 'Complete Auction'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Place a bid</h3>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300" htmlFor="bidAmount">
                    Bid amount
                  </label>
                  <input
                    id="bidAmount"
                    type="number"
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    min="0"
                    step="0.01"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || auction.status !== 'LIVE'}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Submitting bid...' : 'Submit Bid'}
                </button>
                {auction.status !== 'LIVE' && (
                  <p className="text-sm text-slate-400">Bidding is only available while the auction is live.</p>
                )}
              </form>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent bids</h3>
              {bids.length === 0 ? (
                <p className="text-slate-400">No bids have been placed yet.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div key={bid.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                      <p className="text-sm text-slate-400">Member</p>
                      <p className="text-white">{bid.member_name || `Member ${bid.member_id}`}</p>
                      <p className="text-sm text-slate-400">Amount</p>
                      <p className="text-white">₹{bid.bid_amount.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">Time</p>
                      <p className="text-white">{formatDate(bid.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuctionDetailPage
