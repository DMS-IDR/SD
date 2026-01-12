import { useNavigate } from "react-router-dom"
import { HomeCard } from "./components"
import { getVisibleModules } from "../../config"


export const HomePage = () => {
    const navigate = useNavigate()

    const userPermissions = {
        can_view_reports: false,
        can_view_user_management: false,
        can_view_closing_sales: false,
        can_view_commission: false
    };

    const availableModules = getVisibleModules(userPermissions);

    return(
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Bienvenido a SDGestion</h2>
                <p className="text-slate-400 mt-2">Selecciona un módulo para comenzar a trabajar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableModules.map((module, index) => (
                    <HomeCard 
                        key={index}
                        module={module}
                    />
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