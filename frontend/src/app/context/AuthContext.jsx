import { createContext, useContext, useState, useEffect } from 'react'
import { deleteLocalStorage, getFromLocalStorage } from '../../shared/utils/localStorageManager';
import { LoadingSpinner } from '../../shared/components';

const Authcontext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar sesión al cargar la aplicación
    useEffect(() => {
        const checkSession = async () => {
            try {
                // ✅ Intentar recuperar el usuario guardado en localStorage
                const savedUser = getFromLocalStorage('user-sdgestion');
                const token = getFromLocalStorage('token-sdgestion');

                if (savedUser && token) {
                    setUser(savedUser);
                } else {
                    // Si falta alguno, limpiar por seguridad
                    if (token || savedUser) deleteLocalStorage();
                }
            } catch (error) {
                console.error('Error al verificar sesión:', error);
                deleteLocalStorage();
            } finally {
                setLoading(false);
            }
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
            <LoadingSpinner />
        );
    }

    return (
        <Authcontext.Provider value={{ user, login, logOut }}>
            {children}
        </Authcontext.Provider>
    )
}

export const useAuth = () => useContext(Authcontext);