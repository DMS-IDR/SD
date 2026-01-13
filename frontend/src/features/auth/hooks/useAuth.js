import { supabase } from "../../../shared/utils/clientSuperbase";
import { saveToLocalStorage } from "../../../shared/utils/localStorageManager";
import { useAuth as useAuthContext } from "../../../app/context/AuthContext";
import { useNavigate } from "react-router-dom";
import sdGestionApi from "../../../shared/utils/clientApi";

export const useAuth = () => {
    // ✅ Hook llamado en el nivel superior
    const { login: setUser, logOut: clearUser } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {

        let privileges = {};

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);

        saveToLocalStorage('token-sdgestion', data.session.access_token);

        // Traer los permisos del usuario

        try {
            const { data } = await sdGestionApi.get('/api/users/me/permissions');

            console.log('Login permisos obtenidos', data);

            // Crear objeto de permisos

            privileges = {
                can_view_closing_sales: data.can_view_closing_sales,
                can_view_commission: data.can_view_commission,
                can_view_reports: data.can_view_reports,
                can_view_user_management: data.can_view_user_management
            };

            // console.log('privileges', privileges);


        } catch (error) {
            console.log('Error al cargar los permisos', error)
        }

        console.log(data)

        // Actualizar el contexto global con los datos del usuario
        setUser({
            id: data.user.id,
            email: data.user.email,
            rol: data.user.rol,
            privileges
        })

        return data;
    }

    const logout = () => {
        clearUser();
        navigate('/sd', { replace: true });
    }

    return {
        login,
        logout
    }
}