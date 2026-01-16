import { saveToLocalStorage } from "../../../shared/utils/localStorageManager";
import { useAuth as useAuthContext } from "../../../app/context/AuthContext";
import { useNavigate } from "react-router-dom";
import sdGestionApi from "../../../shared/utils/clientApi";

export const useAuth = () => {
    const { login: setUser, logOut: clearUser } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            const response = await sdGestionApi.post('/auth/login', { email, password });

            const payload = response.data.data;

            if (!payload) {
                console.error('API Response missing data property:', response.data);
                throw new Error('Respuesta de API inválida: falta propiedad data');
            }

            const user = payload.user || {};
            const token = payload.token || response.data.token;

            if (!token) {
                throw new Error('No se recibió el token de autenticación');
            }

            // Guardar token
            saveToLocalStorage('token-sdgestion', token);

            // Mapeo defensivo de permisos
            const privileges = {
                can_view_closing_sales: payload.can_view_closing_sales ?? user.can_view_closing_sales,
                can_view_commission: payload.can_view_commission ?? user.can_view_commission,
                can_view_reports: payload.can_view_reports ?? user.can_view_reports,
                can_view_user_management: payload.can_view_user_management ?? user.can_view_user_management
            };

            const userData = {
                id: user.id || payload.id,
                email: user.email || payload.email,
                role: user.role || user.rol || payload.role || payload.rol,
                privileges
            };

            // ✅ Persistir el usuario completo para evitar perder sesión al refrescar
            saveToLocalStorage('user-sdgestion', userData);

            setUser(userData);

            return payload;

        } catch (error) {
            console.error('Error en el proceso de login:', error);
            throw error;
        }
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