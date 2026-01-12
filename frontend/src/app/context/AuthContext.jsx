import { createContext, useContext, useState, useEffect } from 'react'
import { deleteLocalStorage, getFromLocalStorage } from '../../shared/utils/localStorageManager';
import { supabase } from '../../shared/utils/clientSuperbase';
import sdGestionApi from '../../shared/utils/clientApi';

const Authcontext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar sesión al cargar la aplicación
    useEffect(() => {
        const checkSession = async () => {
            console.log('context/AuthProvider')
            const token = getFromLocalStorage('token-sdgestion');

            if (token) {
                try {


                    const { data: { user }, error } = await supabase.auth.getUser(token);
                    console.log(user)


                    if (user && !error) {
                        // 1. Ya tenemos el usuario de supabase, ahora traemos permisos
                        let privileges = {};
                        try {
                            const { data } = await sdGestionApi.get('/api/users/me/permissions/');
                            privileges = {
                                can_view_closing_sales: data.can_view_closing_sales,
                                can_view_commission: data.can_view_commission,
                                can_view_reports: data.can_view_reports,
                                can_view_user_management: data.can_view_user_management
                            };
                        } catch (err) {
                            console.error('Error cargando permisos al restaurar sesión', err);
                        }

                        setUser({
                            id: user.id,
                            email: user.email,
                            privileges
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