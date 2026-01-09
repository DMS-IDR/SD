import { createContext, useContext, useState, useEffect } from 'react'
import { deleteLocalStorage, getFromLocalStorage } from '../../shared/utils/localStorageManager';
import { supabase } from '../../shared/utils/clientSuperbase';

const Authcontext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar sesión al cargar la aplicación
    useEffect(() => {
        const checkSession = async () => {
            const token = getFromLocalStorage('token-sdgestion');

            if (token) {
                try {
                    const { data: { user }, error } = await supabase.auth.getUser(token);

                    if (user && !error) {
                        setUser({
                            id: user.id,
                            email: user.email,
                        });
                    }
                } catch (error) {
                    console.error('Error al verificar sesión:', error);
                }
            }
            setLoading(false);
        };

        checkSession();
    }, []);

    const login = (userData) => setUser(userData);

    const logOut = () => {
        setUser(null);
        deleteLocalStorage();
    };

    // Mostrar loading mientras verifica la sesión
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#fff'
            }}>
                Cargando...
            </div>
        );
    }

    return (
        <Authcontext.Provider value={{ user, login, logOut }}>
            {children}
        </Authcontext.Provider>
    )
}

export const useAuth = () => useContext(Authcontext);