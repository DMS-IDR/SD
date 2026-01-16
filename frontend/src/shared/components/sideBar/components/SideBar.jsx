import { useState } from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../app/context/AuthContext';

export const SideBar = ({
    session = null,
    // userPermissions = null,
    onSignOut = null,
    location: locationProp = null
}) => {
    const [collapsed, setCollapsed] = useState(true)

    const { logOut, user } = useAuth();

    console.log('sideBar userdata: ', user)

    const userPermissions = {
        can_view_reports: false,
        can_view_user_management: false,
        can_view_closing_sales: false,
        can_view_commission: false
    }

    // Usar props si están disponibles, sino usar window.location como fallback

    const location = locationProp || {
        pathname: window.location.pathname
    }

    // Función por defecto para onSignOut si no se proporciona
    const handleSignOut = onSignOut || (() => {
        logOut();
    })

    // Si userPermissions es null, mostrar todos los items (modo desarrollo/demo)
    const showAllItems = user.privileges === null

    const menuItems = [
        {
            id: 'home',
            name: 'Inicio',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            path: '/',
            visible: true
        },
        {
            id: 'reports',
            name: 'Reportes',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            path: '/reports',
            visible: user.privileges?.can_view_reports || false
        },
        {
            id: 'users',
            name: 'Administración',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            path: '/users',
            visible: user.privileges?.can_view_user_management || false
        },
        {
            id: 'closing-sales',
            name: 'Cierre de Ventas',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            path: '/closing-sales',
            visible: user.privileges?.can_view_closing_sales || false
        },
        {
            id: 'commissions',
            name: 'Comisiones',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            path: '/commissions',
            visible: user.privileges?.can_view_commission || false
        }
    ]

    const visibleItems = menuItems.filter(item => item.visible)

    return (
        <div className={`bg-slate-900 border-r border-slate-700 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header (logo, nombre de la app, boton de collapse) */}
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

            {/* Navigation (menu items) */}
            <nav className="flex-1 p-4 space-y-2">
                {visibleItems.map(item => {
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.name : ''}
                        >
                            {item.icon}
                            {!collapsed && <span className="font-medium">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info & Sign Out (nombre de usuario, rol, boton de cerrar sesion)*/}
            <div className="p-4 border-t border-slate-700">
                {!collapsed ? (
                    <div className="space-y-3">
                        {user?.email && (
                            <div className="text-xs text-slate-500">
                                <div className="font-medium text-slate-300 truncate">{user?.email}</div>
                                {user?.rol && (
                                    <div className="mt-1">
                                        <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs">
                                            {user.rol}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSignOut}
                        className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Cerrar Sesión"
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
