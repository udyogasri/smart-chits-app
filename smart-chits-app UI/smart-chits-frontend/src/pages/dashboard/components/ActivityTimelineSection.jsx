import { MdEvent, MdPayment, MdGavel, MdTrendingUp, MdPeople } from 'react-icons/md'

function ActivityTimelineSection({ activities = [], chitId }) {
  // If no activities provided, generate sample structure for now
  // In production, this would come from GET /api/chits/:id/activity
  const defaultActivities = activities.length === 0 ? [
    {
      id: 1,
      type: 'joined',
      title: 'Joined Chit',
      description: 'You joined this chit',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: null,
      status: 'success'
    }
  ] : activities

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'joined':
        return <MdPeople className="text-blue-400 text-lg" />
      case 'payment':
        return <MdPayment className="text-green-400 text-lg" />
      case 'missed_payment':
        return <MdPayment className="text-red-400 text-lg" />
      case 'auction':
        return <MdGavel className="text-purple-400 text-lg" />
      case 'auction_won':
        return <MdTrendingUp className="text-yellow-400 text-lg" />
      case 'dividend':
        return <MdTrendingUp className="text-green-400 text-lg" />
      default:
        return <MdEvent className="text-slate-400 text-lg" />
    }
  }

  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'joined':
        return 'bg-blue-900/20 border-blue-600/30'
      case 'payment':
        return 'bg-green-900/20 border-green-600/30'
      case 'missed_payment':
        return 'bg-red-900/20 border-red-600/30'
      case 'auction':
        return 'bg-purple-900/20 border-purple-600/30'
      case 'auction_won':
        return 'bg-yellow-900/20 border-yellow-600/30'
      case 'dividend':
        return 'bg-emerald-900/20 border-emerald-600/30'
      default:
        return 'bg-slate-700/30 border-slate-600'
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getTitleColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'joined':
        return 'text-blue-300'
      case 'payment':
        return 'text-green-300'
      case 'missed_payment':
        return 'text-red-300'
      case 'auction':
        return 'text-purple-300'
      case 'auction_won':
        return 'text-yellow-300'
      case 'dividend':
        return 'text-emerald-300'
      default:
        return 'text-slate-300'
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>

      {defaultActivities.length === 0 ? (
        <div className="text-center py-8">
          <MdEvent className="mx-auto text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timeline */}
          <div className="space-y-4">
            {defaultActivities.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className={`rounded-lg p-4 border transition-colors hover:border-indigo-500/50 ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium ${getTitleColor(activity.type)}`}>
                        {activity.title}
                      </h3>
                      <span className="text-slate-400 text-xs flex-shrink-0">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    <p className="text-slate-300 text-sm mb-2">
                      {activity.description}
                    </p>

                    {/* Amount if applicable */}
                    {activity.amount && (
                      <div className="inline-block">
                        <span className="text-sm font-medium">
                          {activity.type?.toLowerCase().includes('payment') ||
                          activity.type?.toLowerCase().includes('dividend')
                            ? '₹'
                            : ''}
                          {activity.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {activity.status && (
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            activity.status === 'success'
                              ? 'bg-green-900/30 text-green-400'
                              : activity.status === 'pending'
                              ? 'bg-orange-900/30 text-orange-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {activity.status === 'success'
                            ? '✓ Success'
                            : activity.status === 'pending'
                            ? 'Pending'
                            : 'Failed'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  {activity.details && (
                    <div className="flex-shrink-0 text-slate-400">→</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View More Link */}
          {defaultActivities.length > 0 && (
            <div className="text-center pt-4 border-t border-slate-600">
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                View All Activity →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Stats */}
      {defaultActivities.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-600 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-slate-400 text-xs mb-1">Total Activities</p>
            <p className="text-white font-bold text-lg">
              {defaultActivities.length}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Latest</p>
            <p className="text-white font-bold text-lg">
              {formatDate(defaultActivities[0]?.timestamp)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Payments</p>
            <p className="text-green-400 font-bold text-lg">
              {defaultActivities.filter(a =>
                a.type?.toLowerCase().includes('payment')
              ).length}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Auctions</p>
            <p className="text-purple-400 font-bold text-lg">
              {defaultActivities.filter(a =>
                a.type?.toLowerCase().includes('auction')
              ).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityTimelineSection
