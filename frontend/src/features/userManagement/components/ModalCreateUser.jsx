import { useState, useEffect } from "react";
import { useUserManagement } from "../hook/useUserManagement";

const INITIAL_STATE = {
    email: '',
    password: '',
    company: 'Dko',
    role: 'Comercial',
    can_view_reports: false,
    can_view_user_management: false,
    can_view_closing_sales: false,
    can_view_commission: false,
    is_active: true
};


export const ModalCreateUser = ({ isOpen, onClose }) => {

    const { createUser, isCreating } = useUserManagement();

    const [newUser, setNewUser] = useState(INITIAL_STATE);

    useEffect(() => {
        if (isOpen) {
            setNewUser({
                ...INITIAL_STATE,
            });
        } else {
            setNewUser(INITIAL_STATE);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { type, name, value, checked } = e.target;

        setNewUser(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Datos capturados:", newUser);


        try {
            await createUser(newUser);
            onClose();
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
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


                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ... (email, password, company, role inputs match surrounding context, no need to replace all if I target carefully. But I will replace the form content to inject checkboxes) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={newUser.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña Temporal</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={newUser.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Empresa</label>
                            <select
                                name="company"
                                value={newUser.company}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="Dko">Dko</option>
                                <option value="Mv">Mv</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                            <select
                                name="role"
                                value={newUser.role}
                                onChange={handleChange}
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
                                    name="can_view_reports"
                                    checked={newUser.can_view_reports}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-300">Ver Reportes</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="can_view_user_management"
                                    checked={newUser.can_view_user_management}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-300">Ver Admin. Usuarios</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="can_view_closing_sales"
                                    checked={newUser.can_view_closing_sales}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-300">Ver Cierre de Ventas</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="can_view_commission"
                                    checked={newUser.can_view_commission}
                                    onChange={handleChange}
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
                                disabled={isCreating}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
};
