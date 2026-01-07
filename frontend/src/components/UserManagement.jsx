import { useState, useEffect } from 'react'

export default function UserManagement({ session }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/users/', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) {
                if (res.status === 403) throw new Error('You do not have permission to manage users.')
                throw new Error('Failed to fetch users')
            }

            const data = await res.json()
            setUsers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePermission = async (userId, field, currentValue) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [field]: !currentValue })
            })

            if (!res.ok) throw new Error('Failed to update permission')

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, [field]: !currentValue } : u
            ))
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return

        try {
            const res = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) throw new Error('Failed to deactivate user')

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_active: false } : u
            ))
        } catch (err) {
            alert(err.message)
        }
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
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Usuario
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
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
            )}

            {showCreateModal && (
                <CreateUserModal
                    session={session}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        fetchUsers()
                    }}
                />
            )}

            {editingUser && (
                <EditUserModal
                    session={session}
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null)
                        fetchUsers()
                    }}
                />
            )}
        </div>
    )
}

function CreateUserModal({ session, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        company: 'Dko',
        role: 'Comercial',
        can_view_reports: true,
        can_view_user_management: false,
        can_view_closing_sales: false,
        can_view_commission: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        // ... (keep same)
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('http://localhost:8000/api/users/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to create user')
            }

            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
                {/* ... header ... */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Crear Nuevo Usuario</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (email, password, company, role inputs match surrounding context, no need to replace all if I target carefully. But I will replace the form content to inject checkboxes) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña Temporal</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Empresa</label>
                        <select
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Dko">Dko</option>
                            <option value="Mv">Mv</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tienda">Tienda</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300">Permissions</label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_reports}
                                onChange={(e) => setFormData({ ...formData, can_view_reports: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Reportes</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_user_management}
                                onChange={(e) => setFormData({ ...formData, can_view_user_management: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Admin. Usuarios</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_closing_sales}
                                onChange={(e) => setFormData({ ...formData, can_view_closing_sales: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Cierre de Ventas</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_commission}
                                onChange={(e) => setFormData({ ...formData, can_view_commission: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Comisiones</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function EditUserModal({ session, user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        company: user.company,
        role: user.role,
        can_view_reports: user.can_view_reports,
        can_view_user_management: user.can_view_user_management,
        can_view_closing_sales: user.can_view_closing_sales,
        can_view_commission: user.can_view_commission
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update user')
            }

            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-400">Editando usuario:</p>
                    <p className="text-white font-medium">{user.email}</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Empresa</label>
                        <select
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Dko">Dko</option>
                            <option value="Mv">Mv</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tienda">Tienda</option>
                        </select>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300">Permissions</label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_reports}
                                onChange={(e) => setFormData({ ...formData, can_view_reports: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Reportes</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_user_management}
                                onChange={(e) => setFormData({ ...formData, can_view_user_management: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Admin. Usuarios</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_closing_sales}
                                onChange={(e) => setFormData({ ...formData, can_view_closing_sales: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Cierre de Ventas</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.can_view_commission}
                                onChange={(e) => setFormData({ ...formData, can_view_commission: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">Ver Comisiones</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
