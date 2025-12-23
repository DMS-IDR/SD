import { useState, useEffect } from 'react'

export default function ReportsView({ session }) {
    const [folders, setFolders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [downloading, setDownloading] = useState(null)
    const [expandedFolders, setExpandedFolders] = useState(new Set())

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/reports/list/', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) {
                if (res.status === 403) throw new Error('You do not have permission to view reports.')
                throw new Error('Failed to fetch reports')
            }

            const data = await res.json()
            setFolders(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(folderId)) {
                newSet.delete(folderId)
            } else {
                newSet.add(folderId)
            }
            return newSet
        })
    }

    const handleDownload = async (fileKey, fileName) => {
        setDownloading(fileKey)
        try {
            // Encode the key to handle slashes/spaces in URL
            const encodedKey = encodeURIComponent(fileKey)
            const res = await fetch(`http://localhost:8000/api/reports/download/?key=${encodedKey}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) throw new Error('Download failed')

            const data = await res.json()
            
            // Trigger download via temporary anchor
            const link = document.createElement('a')
            link.href = data.url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()

        } catch (err) {
            alert(err.message)
        } finally {
            setDownloading(null)
        }
    }

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KiB', 'MiB', 'GiB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Corporate Reports
                    </h2>
                    <p className="text-slate-400 mt-2">Access secure documents from cloud storage</p>
                </div>
                <div className="text-right">
                   <span className="text-xs text-slate-500 uppercase tracking-widest">Logged in as</span>
                   <div className="text-white font-medium">{session.user.email}</div>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-6 animate-pulse">
                     {[1,2].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-slate-800/50"></div>
                     ))}
                </div>
            ) : folders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                    No folders configured for your role.
                </div>
            ) : (
                <div className="space-y-4">
                    {folders.map(folder => {
                        const isExpanded = expandedFolders.has(folder.id)
                        
                        return (
                            <div key={folder.id} className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden transition-all">
                                {/* Folder Header - Clickable */}
                                <button 
                                    onClick={() => toggleFolder(folder.id)}
                                    className="w-full px-6 py-4 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Chevron Icon */}
                                        <svg 
                                            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        
                                        {/* Folder Icon */}
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        
                                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">
                                            {folder.name}
                                        </h3>
                                    </div>
                                    
                                    <span className="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">
                                        {folder.files.length} {folder.files.length === 1 ? 'file' : 'files'}
                                    </span>
                                </button>
                                
                                {/* Collapsible Content */}
                                <div 
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="divide-y divide-slate-800/50 border-t border-slate-700/50">
                                        {folder.files.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-sm italic">
                                                This folder is empty.
                                            </div>
                                        ) : folder.files.map(file => (
                                            <div key={file.key} className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-200 truncate pr-4 group-hover:text-blue-200 transition-colors">{file.name}</p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span>{formatBytes(file.size)}</span>
                                                            <span>•</span>
                                                            <span>{new Date(file.last_modified).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => handleDownload(file.key, file.name)}
                                                    disabled={downloading === file.key}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {downloading === file.key ? (
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    )}
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
