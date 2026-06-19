import { useState } from 'react'
import { MdGavel, MdWarning, MdCheckCircle, MdBlock } from 'react-icons/md'

function AuctionSection({ auctions, isMember = false, paymentData = [], chitId = '' }) {
  const [selectedAuction, setSelectedAuction] = useState(null)

  // Calculate eligibility
  const hasOverduePayments = paymentData?.some(p => p.status?.toLowerCase() === 'overdue') || false
  const hasPendingPayments = paymentData?.some(p => p.status?.toLowerCase() === 'pending') || false
  const isEligibleForAuction = isMember && !hasOverduePayments && !hasPendingPayments

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-600/30'
      case 'ONGOING':
      case 'ACTIVE':
        return 'bg-blue-900/30 text-blue-400 border-blue-600/30'
      case 'PENDING':
        return 'bg-slate-900/30 text-slate-400 border-slate-600'
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-600'
    }
  }

  const getStatusBadgeText = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '✓ Completed'
      case 'ONGOING':
      case 'ACTIVE':
        return '● Active'
      case 'PENDING':
        return '⟳ Pending'
      default:
        return status
    }
  }

  if (!auctions || !auctions.auctions || auctions.auctions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Auction History</h2>
        <div className="text-center py-8">
          <MdGavel className="mx-auto text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">No auctions have been held yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Auction History</h2>

        {/* Eligibility Status */}
        {isMember && (
          <div className={`rounded-lg p-4 border flex items-start gap-3 mb-6 ${
            isEligibleForAuction
              ? 'bg-green-900/10 border-green-600/30'
              : 'bg-red-900/10 border-red-600/30'
          }`}>
            {isEligibleForAuction ? (
              <MdCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
            ) : (
              <MdBlock className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${
                isEligibleForAuction ? 'text-green-300' : 'text-red-300'
              }`}>
                {isEligibleForAuction
                  ? 'You are eligible to participate in auctions'
                  : 'You are not eligible to participate in auctions'}
              </p>
              {!isEligibleForAuction && (
                <p className={`text-sm mt-1 ${
                  isEligibleForAuction ? 'text-green-400' : 'text-red-400'
                }`}>
                  {hasOverduePayments && 'Clear your overdue payments to become eligible. '}
                  {hasPendingPayments && 'Pay your pending installments to become eligible.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {auctions.auctions.map((auction, idx) => (
          <div
            key={auction.auction_id || idx}
            className={`bg-slate-700/30 rounded-lg p-4 border transition-all cursor-pointer ${
              getStatusColor(auction.status)
            } ${selectedAuction === idx ? 'ring-2 ring-indigo-500' : 'hover:border-indigo-500/50'}`}
            onClick={() => setSelectedAuction(selectedAuction === idx ? null : idx)}
          >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold">
                    Auction #{auction.auction_number || idx + 1}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(auction.status)}`}>
                    {getStatusBadgeText(auction.status)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Month {auction.auction_month || idx + 1}
                </p>
              </div>
              <span className="text-slate-400 text-lg">
                {selectedAuction === idx ? '▼' : '▶'}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">Date</p>
                <p className="text-white text-sm font-medium">
                  {auction.auction_date
                    ? new Date(auction.auction_date).toLocaleDateString('en-IN')
                    : 'Pending'
                  }
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Pool Amount</p>
                <p className="text-white text-sm font-medium">
                  ₹{(auction.total_pool || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Winning Bid</p>
                <p className="text-green-400 text-sm font-medium">
                  ₹{(auction.winning_bid_amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Dividend/Member</p>
                <p className="text-purple-400 text-sm font-medium">
                  ₹{(auction.dividend_per_member || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedAuction === idx && (
              <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
                {/* Winner Info */}
                {auction.winner_name && auction.winner_name !== 'Pending' && (
                  <div className="bg-indigo-900/20 rounded p-3 border border-indigo-600/30">
                    <p className="text-indigo-300 text-sm">
                      <span className="font-medium">🏆 Winner:</span> {auction.winner_name}
                    </p>
                    {auction.winning_bid_amount && (
                      <p className="text-indigo-400 text-xs mt-1">
                        Bid: ₹{(auction.winning_bid_amount).toLocaleString('en-IN')}
                      </p>
                    )}
                    {auction.winner_prize_amount && (
                      <p className="text-indigo-400 text-xs">
                        Prize: ₹{(auction.winner_prize_amount).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {/* Auction Details */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Max Bid Limit</p>
                    <p className="text-white font-medium">
                      ₹{(auction.max_bid_limit || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Foreman Commission</p>
                    <p className="text-white font-medium">
                      ₹{(auction.foreman_commission_amount || 0).toLocaleString('en-IN')} ({auction.foreman_commission_percent || 0}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Started</p>
                    <p className="text-white font-medium">
                      {auction.started_at
                        ? new Date(auction.started_at).toLocaleString('en-IN')
                        : 'Not started'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Ended</p>
                    <p className="text-white font-medium">
                      {auction.ended_at
                        ? new Date(auction.ended_at).toLocaleString('en-IN')
                        : 'Ongoing'
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {auction.status?.toUpperCase() === 'ONGOING' || auction.status?.toUpperCase() === 'ACTIVE' ? (
                  <div className="flex gap-2">
                    {isEligibleForAuction ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors">
                          Place Bid
                        </button>
                        <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm transition-colors">
                          View Details
                        </button>
                      </>
                    ) : (
                      <button disabled className="w-full px-4 py-2 bg-slate-600 text-slate-400 rounded-lg font-medium text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                        <MdBlock className="text-lg" />
                        Not Eligible
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm transition-colors">
                    View Auction Report
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Auctions Summary */}
      {auctions.total > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-600 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-slate-400 text-xs mb-1">Total Auctions</p>
            <p className="text-white font-bold text-lg">{auctions.total}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Completed</p>
            <p className="text-green-400 font-bold text-lg">
              {auctions.auctions?.filter(a => a.status?.toUpperCase() === 'COMPLETED').length || 0}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Active</p>
            <p className="text-blue-400 font-bold text-lg">
              {auctions.auctions?.filter(a => a.status?.toUpperCase() === 'ACTIVE' || a.status?.toUpperCase() === 'ONGOING').length || 0}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Pending</p>
            <p className="text-slate-400 font-bold text-lg">
              {auctions.auctions?.filter(a => a.status?.toUpperCase() === 'PENDING').length || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuctionSection

