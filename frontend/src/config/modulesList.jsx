

// Lista de modulos
export const modules = [
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
        permission: 'can_view_reports'
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
        permission: 'can_view_user_management'
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
        permission: 'can_view_closing_sales'
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
        permission: 'can_view_commission'
    }
]

// Helper para filtrar por permisos
export const getVisibleModules = (userPermissions) => {
    if (!userPermissions) return [];

    return modules.filter(module => {
        // Si el modulo no requiere permisos específicos, es visible
        if (!module.permission) return true

        // Verifica si el usuario tiene el permiso especifico
        return userPermissions[module.permission] === true
    })
}