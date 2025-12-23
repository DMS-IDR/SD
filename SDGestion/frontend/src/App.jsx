import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import ReportsView from './components/ReportsView'
import UserManagement from './components/UserManagement'
import { supabase } from './lib/supabase'

function App() {
    const [session, setSession] = useState(null)
    const [userPermissions, setUserPermissions] = useState(null)
    const [loadingPermissions, setLoadingPermissions] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) {
                fetchUserPermissions(session)
            } else {
                setLoadingPermissions(false)
            }
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                fetchUserPermissions(session)
            } else {
                setUserPermissions(null)
                setLoadingPermissions(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserPermissions = async (session) => {
        try {
            const res = await fetch('http://localhost:8000/api/users/me/permissions/', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setUserPermissions(data)
            } else {
                console.error('Failed to fetch permissions')
                setUserPermissions(null)
            }
        } catch (err) {
            console.error('Error fetching permissions:', err)
            setUserPermissions(null)
        } finally {
            setLoadingPermissions(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUserPermissions(null)
    }

    if (!session) {
        return <Login />
    }

    if (loadingPermissions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-slate-400 mt-4">Loading permissions...</p>
                </div>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex">
                <Sidebar 
                    session={session} 
                    userPermissions={userPermissions} 
                    onSignOut={handleSignOut}
                />
                
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route 
                            path="/reports" 
                            element={
                                userPermissions?.can_view_reports ? (
                                    <ReportsView session={session} />
                                ) : (
                                    <Navigate to="/unauthorized" replace />
                                )
                            } 
                        />
                        <Route 
                            path="/users" 
                            element={
                                userPermissions?.can_view_user_management ? (
                                    <UserManagement session={session} />
                                ) : (
                                    <Navigate to="/unauthorized" replace />
                                )
                            } 
                        />
                        <Route 
                            path="/unauthorized" 
                            element={
                                <div className="flex items-center justify-center h-screen">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                                        <p className="text-slate-400">You don't have permission to view this page.</p>
                                    </div>
                                </div>
                            } 
                        />
                        <Route 
                            path="/" 
                            element={
                                <Navigate 
                                    to={
                                        userPermissions?.can_view_reports ? '/reports' : 
                                        userPermissions?.can_view_user_management ? '/users' : 
                                        '/unauthorized'
                                    } 
                                    replace 
                                />
                            } 
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}

export default App
