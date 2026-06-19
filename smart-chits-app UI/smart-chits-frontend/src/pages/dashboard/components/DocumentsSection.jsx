import { useState } from 'react'
import {
  MdDownload,
  MdDescription,
  MdFileDownload,
  MdArticle,
  MdAssignment,
} from 'react-icons/md'
import { useToast } from '../../../components/Toast'

function DocumentsSection({ chitId, isMember = false }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState({})
  
  // Sample documents - In production, these would come from backend
  const documents = [
    {
      id: 1,
      name: 'Chit Agreement',
      description: 'Original chit fund agreement document',
      icon: MdDescription,
      color: 'bg-indigo-900/20 text-indigo-400 border-indigo-600/30',
      badge: 'Legal',
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      type: 'pdf',
      requiresMembership: false,
    },
    {
      id: 2,
      name: 'Payment Receipts',
      description: 'Your payment receipts and confirmation documents',
      icon: MdArticle,
      color: 'bg-green-900/20 text-green-400 border-green-600/30',
      badge: 'Receipts',
      dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'pdf',
      requiresMembership: true,
    },
    {
      id: 3,
      name: 'Monthly Statements',
      description: 'Monthly chit fund status and payment statements',
      icon: MdFileDownload,
      color: 'bg-blue-900/20 text-blue-400 border-blue-600/30',
      badge: 'Statements',
      dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'pdf',
      requiresMembership: true,
    },
    {
      id: 4,
      name: 'Auction Reports',
      description: 'Historical auction reports and bidding details',
      icon: MdAssignment,
      color: 'bg-purple-900/20 text-purple-400 border-purple-600/30',
      badge: 'Reports',
      dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: 'pdf',
      requiresMembership: false,
    },
  ]

  const handleDownload = async (doc) => {
    // Check membership requirement
    if (doc.requiresMembership && !isMember) {
      showToast(
        'Join the chit to download this document',
        'error'
      )
      return
    }

    setLoading({ ...loading, [doc.id]: true })
    try {
      // Simulate API call
      // In production: const response = await fetcher(`/api/chits/${chitId}/documents/${doc.id}`)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${doc.name.replace(/\s+/g, '_')}.pdf`
      // In production, link.href would be the actual blob URL from backend
      // link.click()
      
      showToast(`Downloading ${doc.name}...`, 'success')
    } catch (error) {
      showToast('Failed to download document', 'error')
    } finally {
      setLoading({ ...loading, [doc.id]: false })
    }
  }

  const handleView = (doc) => {
    if (doc.requiresMembership && !isMember) {
      showToast(
        'Join the chit to view this document',
        'error'
      )
      return
    }

    // In production, open PDF viewer modal
    console.log('Opening document:', doc.name)
    showToast(`Opening ${doc.name}...`, 'info')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">Documents & Downloads</h2>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <MdDescription className="mx-auto text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">No documents available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {documents.map(doc => {
            const IconComponent = doc.icon
            const isRestricted = doc.requiresMembership && !isMember

            return (
              <div
                key={doc.id}
                className={`rounded-lg p-4 border transition-colors ${
                  isRestricted
                    ? 'opacity-60 bg-slate-700/20 border-slate-600'
                    : `${doc.color} bg-slate-700/30`
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <IconComponent className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">
                          {doc.name}
                        </h3>
                        {doc.badge && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-600 text-slate-300">
                            {doc.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  {/* Restriction Badge */}
                  {isRestricted && (
                    <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 ml-2 flex-shrink-0">
                      Members Only
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 py-2 border-t border-slate-600">
                  <span>Added: {formatDate(doc.dateAdded)}</span>
                  <span>{doc.type.toUpperCase()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(doc)}
                    disabled={isRestricted || loading[doc.id]}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      isRestricted
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isRestricted || loading[doc.id]}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                      isRestricted
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {loading[doc.id] ? (
                      <>
                        <span className="inline-block animate-spin">⟳</span>
                      </>
                    ) : (
                      <>
                        <MdDownload className="text-sm" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-slate-600">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <p className="text-slate-300 text-sm">
            <span className="font-medium block mb-2">📄 Document Management</span>
            <span className="text-slate-400">
              You can download all chit-related documents here including agreements, receipts,
              and statements. Some documents are only available to active members.
            </span>
          </p>
        </div>
      </div>

      {/* Download History */}
      <div className="mt-4">
        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          View Download History →
        </button>
      </div>
    </div>
  )
}

export default DocumentsSection
