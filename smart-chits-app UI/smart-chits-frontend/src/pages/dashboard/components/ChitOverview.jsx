function ChitOverview({ chit, remainingSlots }) {
  const memberPercentage = chit.total_members > 0 
    ? ((chit.current_members || chit.members || 0) / chit.total_members * 100) 
    : 0
  
  const durationPercentage = chit.total_months > 0
    ? ((chit.current_month || 1) / chit.total_months * 100)
    : 0

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">Chit Overview</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Amount */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-slate-400 text-sm mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-indigo-400">
            ₹{chit.total_chit_amount?.toLocaleString()}
          </p>
        </div>

        {/* Monthly Installment */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-slate-400 text-sm mb-1">Monthly Installment</p>
          <p className="text-2xl font-bold text-purple-400">
            ₹{chit.monthly_amount?.toLocaleString()}
          </p>
        </div>

        {/* Duration */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-slate-400 text-sm mb-1">Duration</p>
          <p className="text-2xl font-bold text-blue-400">
            {chit.total_months} Months
          </p>
        </div>

        {/* Current Month */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <p className="text-slate-400 text-sm mb-1">Current Month</p>
          <p className="text-2xl font-bold text-green-400">
            {chit.current_month || 1}
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-6">
        {/* Members Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 font-medium">Members Progress</span>
            <span className="text-slate-400 text-sm">
              {chit.current_members || chit.members || 0} / {chit.total_members} members
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-600">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all"
              style={{ width: `${memberPercentage}%` }}
            />
          </div>
          {remainingSlots > 0 && (
            <p className="text-slate-400 text-xs mt-1">{remainingSlots} slots remaining</p>
          )}
        </div>

        {/* Duration Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 font-medium">Duration Progress</span>
            <span className="text-slate-400 text-sm">
              {chit.current_month || 1} / {chit.total_months} months
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-600">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
              style={{ width: `${durationPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Details */}
      <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-600">
        <div>
          <p className="text-slate-400 text-sm mb-1">Bidding Status</p>
          <p className="text-white font-medium">
            {chit.bidding_open ? (
              <span className="text-green-400">🔓 Open</span>
            ) : (
              <span className="text-slate-400">🔒 Closed</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Installment Frequency</p>
          <p className="text-white font-medium">Monthly</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Chit Fund</p>
          <p className="text-white font-medium">
            ₹{chit.chit_fund?.toLocaleString() || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChitOverview
