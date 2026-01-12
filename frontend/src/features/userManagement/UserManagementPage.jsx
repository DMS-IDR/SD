import { useState, useEffect } from "react";
import { useUserManagement } from "./hook/useUserManagement";

export const UserManagementPage = () => {
    const { users = [], isLoading, isError } = useUserManagement();

    useEffect(() => {
        if (!isLoading) {
            console.log("Usuarios cargados:", users);
        }
    }, [users, isLoading]);


    // State for modals or other UI elements can remain here
    // const [showCreateModal, setShowCreateModal] = useState(false);
    // const [editingUser, setEditingUser] = useState(null);




    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-white text-xl">Cargando usuarios...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-red-500 text-xl">Error cargando usuarios</div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Administración de Usuarios
                    </h2>
                    <p className="text-slate-400 mt-2">Gestionar usuarios, roles y permisos</p>
                </div>
                <button
                    // onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Usuario
                </button>
            </div>

            {/* {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
                    {error}
                </div>
            )} */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Reportes</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Adm. Usu.</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Cierre V.</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Comis.</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-200">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded">
                                            {user.company}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleTogglePermission(user.id, 'can_view_reports', user.can_view_reports)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.can_view_reports ? 'bg-blue-600' : 'bg-slate-700'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.can_view_reports ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleTogglePermission(user.id, 'can_view_user_management', user.can_view_user_management)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.can_view_user_management ? 'bg-blue-600' : 'bg-slate-700'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.can_view_user_management ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleTogglePermission(user.id, 'can_view_closing_sales', user.can_view_closing_sales)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.can_view_closing_sales ? 'bg-blue-600' : 'bg-slate-700'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.can_view_closing_sales ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleTogglePermission(user.id, 'can_view_commission', user.can_view_commission)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.can_view_commission ? 'bg-blue-600' : 'bg-slate-700'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.can_view_commission ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${user.is_active
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Edit user"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Deactivate user"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    )
}