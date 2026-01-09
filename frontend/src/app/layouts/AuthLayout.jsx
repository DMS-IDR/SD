import { Outlet } from "react-router-dom"
import { AuthPage } from "../../features/auth/AuthPage"

export const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

            <div className="relative w-full max-w-md p-8 m-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Iniciar Sesión</h1>
                    <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder al sistema</p>
                </div>

                <Outlet />

            </div>
        </div>
    )
}