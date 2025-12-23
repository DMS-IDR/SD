import { useState, useEffect } from 'react'
import Login from './components/Login'
import ReportsView from './components/ReportsView'
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

        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-y-auto">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">SD</div>
                        <span className="font-bold text-xl tracking-tight">SDGestion</span>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            
            <main className="py-8">
                <ReportsView session={session} />
            </main>
        </div>
    )

}

export default App
