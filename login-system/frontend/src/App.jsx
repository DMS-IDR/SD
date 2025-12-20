import { useState, useEffect } from 'react'
import Login from './components/Login'
import { supabase } from './lib/supabase'

function App() {
    const [session, setSession] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (!session) {
        return <Login />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Welcome
                </h1>
                <p className="mb-8 text-gray-300">
                    You are logged in as <span className="text-white font-medium">{session.user.email}</span>
                </p>
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-6 py-2 bg-red-500/80 hover:bg-red-500 transition-colors rounded-lg font-semibold"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default App
