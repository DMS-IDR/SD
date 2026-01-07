import { useNavigate } from 'react-router-dom'

export default function HomeView({ userPermissions }) {
    const navigate = useNavigate()

    const modules = [
        {
            title: 'Reportes',
            description: 'Visualizar informes de ventas detallados',
            path: '/reports',
            color: 'from-purple-500 to-indigo-500',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            visible: userPermissions?.can_view_reports
        },
        {
            title: 'Administración',
            description: 'Gestionar usuarios, roles y permisos del sistema',
            path: '/users',
            color: 'from-blue-500 to-cyan-500',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            visible: userPermissions?.can_view_user_management
        },
        {
            title: 'Cierre de Ventas',
            description: 'Revisar cierres diarios y detalles de transacciones',
            path: '/closing-sales',
            color: 'from-emerald-500 to-teal-500',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            visible: userPermissions?.can_view_closing_sales
        },
        {
            title: 'Comisiones',
            description: 'Calcular comisiones de vendedores por período y empresa',
            path: '/commissions',
            color: 'from-orange-500 to-amber-500',
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            visible: userPermissions?.can_view_commission
        }
    ]

    const availableModules = modules.filter(m => m.visible)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Bienvenido a SDGestion</h2>
                <p className="text-slate-400 mt-2">Selecciona un módulo para comenzar a trabajar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableModules.map((module, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(module.path)}
                        className="group relative bg-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />

                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                {module.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                                {module.title}
                            </h3>

                            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                {module.description}
                            </p>
                        </div>

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {availableModules.length === 0 && (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-700/50">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">Acceso Restringido</h3>
                    <p className="text-slate-400">No tienes permisos habilitados para ver ningún módulo.</p>
                    <p className="text-slate-500 text-sm mt-2">Contacta a un administrador para solicitar acceso.</p>
                </div>
            )}
        </div>
    )
}
