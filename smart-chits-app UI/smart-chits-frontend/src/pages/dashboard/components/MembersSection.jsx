import { useState } from 'react'
import { MdAttachMoney } from 'react-icons/md'

function MembersSection({ members }) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 10
  
  if (!members || !members.members || members.members.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Joined Members</h2>
        <p className="text-slate-400">No members have joined yet.</p>
      </div>
    )
  }

  const displayMembers = members.members.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  )
  const totalPages = Math.ceil(members.total / itemsPerPage)

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">
        Joined Members ({members.total})
      </h2>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 border-b border-slate-600">
            <tr>
              <th className="text-left p-3 text-slate-300 font-medium">Name</th>
              <th className="text-left p-3 text-slate-300 font-medium">Email</th>
              <th className="text-center p-3 text-slate-300 font-medium">Joined Date</th>
              <th className="text-center p-3 text-slate-300 font-medium">Paid</th>
              <th className="text-center p-3 text-slate-300 font-medium">Pending</th>
              <th className="text-center p-3 text-slate-300 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {displayMembers.map(member => (
              <tr key={member.member_id} className="hover:bg-slate-700/30">
                <td className="p-3 text-white font-medium">{member.name}</td>
                <td className="p-3 text-slate-300 text-xs">{member.email}</td>
                <td className="p-3 text-center text-slate-300">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-center">
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium">
                    {member.paid_months}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded text-xs font-medium">
                    {member.pending_months}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {member.already_won ? (
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded text-xs font-medium">
                      ✓ Won
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-700 text-slate-400 rounded text-xs font-medium">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
          <p className="text-slate-400 text-sm">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white rounded transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white rounded transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Dividend Summary */}
      {members.members.some(m => m.total_dividend > 0) && (
        <div className="mt-6 pt-6 border-t border-slate-600 bg-slate-700/30 rounded p-4">
          <p className="text-slate-300 font-medium mb-3 flex items-center gap-2"><MdAttachMoney className="text-lg" /> <span>Dividend Summary</span></p>
          <div className="space-y-2">
            {members.members.filter(m => m.total_dividend > 0).slice(0, 3).map(member => (
              <div key={member.member_id} className="flex justify-between text-sm">
                <span className="text-slate-300">{member.name}</span>
                <span className="text-green-400 font-medium">₹{member.total_dividend.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MembersSection
