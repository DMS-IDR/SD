import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar({ session, userPermissions, onSignOut }) {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        {
            id: 'reports',
            name: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            path: '/reports',
            visible: userPermissions?.can_view_reports || false
        },
        {
            id: 'users',
            name: 'User Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            path: '/users',
            visible: userPermissions?.can_view_user_management || false
        }
    ]

    const visibleItems = menuItems.filter(item => item.visible)

    return (
        <div className={`bg-slate-900 border-r border-slate-700 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SD</span>
                        </div>
                        <span className="text-white font-semibold">SDGestion</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {visibleItems.map(item => {
                    const isActive = location.pathname === item.path
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.name : ''}
                        >
                            {item.icon}
                            {!collapsed && <span className="font-medium">{item.name}</span>}
                        </button>
                    )
                })}
            </nav>

            {/* User Info & Sign Out */}
            <div className="p-4 border-t border-slate-700">
                {!collapsed ? (
                    <div className="space-y-3">
                        <div className="text-xs text-slate-500">
                            <div className="font-medium text-slate-300 truncate">{session.user.email}</div>
                            {userPermissions?.role && (
                                <div className="mt-1">
                                    <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs">
                                        {userPermissions.role}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onSignOut}
                        className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}
