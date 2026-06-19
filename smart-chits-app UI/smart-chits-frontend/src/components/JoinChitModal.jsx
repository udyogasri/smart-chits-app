import { useState } from 'react'

export function JoinChitModal({ isOpen, chit, onClose, onConfirm, isLoading, isMember }) {
  const [agreed, setAgreed] = useState(false)

  if (!isOpen || !chit) return null

  const isFull = chit.current_members >= chit.total_members
  const isInactive = chit.status !== 'active'
  const canJoin = !isFull && !isInactive && !isMember

  const handleConfirm = () => {
    if (agreed && canJoin) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Join Chit Group</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Chit Name */}
          <div>
            <label className="text-sm font-medium text-slate-400">Chit Name</label>
            <p className="text-lg font-semibold text-white mt-1">{chit.name}</p>
          </div>

          {/* Chit Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Total Chit Amount</p>
              <p className="text-lg font-semibold text-white mt-1">₹{((chit.chit_fund || chit.amount) || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Monthly Installment</p>
              <p className="text-lg font-semibold text-white mt-1">₹{((chit.installment_amount || chit.monthlyContribution) || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-lg font-semibold text-white mt-1">{chit.duration || chit.total_months} months</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Total Members</p>
              <p className="text-lg font-semibold text-white mt-1">{chit.total_members}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Current Members</p>
              <p className="text-lg font-semibold text-white mt-1">{chit.current_members || chit.members}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Available Slots</p>
              <p className="text-lg font-semibold text-green-400 mt-1">
                {Math.max(0, (chit.total_members || 0) - (chit.current_members || chit.members || 0))}
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {isMember && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
              <p className="text-sm text-blue-200">✓ You are already a member of this chit group</p>
            </div>
          )}

          {isFull && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-200">✕ This chit group is full</p>
            </div>
          )}

          {isInactive && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-sm text-yellow-200">⚠ This chit group is not accepting new members</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="bg-slate-700 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-white">Terms and Conditions</p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Monthly installment must be paid on time</li>
              <li>Participation in auctions is mandatory</li>
              <li>Earned dividends will be credited automatically</li>
              <li>Once joined, you cannot withdraw midway</li>
              <li>All disputes will be resolved by the organization</li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          {canJoin && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-sm text-slate-300">
                I agree to the terms and conditions and wish to join this chit group
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-700 bg-slate-700/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-white hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canJoin || !agreed || isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              canJoin && agreed && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading && <span className="inline-block animate-spin">⟳</span>}
            {isMember ? 'Already Joined' : isFull ? 'Full' : isInactive ? 'Closed' : 'Confirm Join'}
          </button>
        </div>
      </div>
    </div>
  )
}
