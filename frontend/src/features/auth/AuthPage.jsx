import { useState } from "react";
import { useAuth } from "./hooks/useAuth";

export const AuthPage = () => {

    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const executeLogin = await login(email, password);
            console.log('inicio correcto')
        } catch (error) {
            console.log(error.message)
            setErrorLogin(true)
            setErrorMessage('Credenciales invalidas')
            setTimeout(() => {
                setErrorLogin(false)
            }, 5000);
        }finally {
            setLoading(false);
        }


    }

    return (
        <>
            {errorLogin && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                    {errorMessage}
                </div>
                )
            }

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                        Correo Electrónicoa
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all duration-200"
                        placeholder="correo@empresa.com"
                    />
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all duration-200"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Iniciando sesión...
                            </span>
                        ) : (
                            'Ingresar'
                        )}
                </button>
            </form>
        </>
    )
}