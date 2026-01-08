// Add this component at the end of UserManagement.jsx, after CreateUserModal

function EditUserModal({ session, user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        company: user.company,
        role: user.role
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
                    <h3 className="text-xl font-bold text-white">Edit User</h3>
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
                    <p className="text-sm text-slate-400">Editing user:</p>
                    <p className="text-white font-medium">{user.email}</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
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

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
