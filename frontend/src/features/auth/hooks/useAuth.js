import { supabase } from "../../../shared/utils/clientSuperbase";
import { saveToLocalStorage } from "../../../shared/utils/localStorageManager";
import { useAuth as useAuthContext } from "../../../app/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    // ✅ Hook llamado en el nivel superior
    const { login: setUser, logOut: clearUser } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw new Error(error.message);

        saveToLocalStorage('token-sdgestion', data.session.access_token)

        // Actualizar el contexto global con los datos del usuario
        setUser({
            id: data.user.id,
            email: data.user.email
        })

        return data;
    }

    const logout = () => {
        clearUser();
        navigate('/sd', {replace: true});
    }

    return {
        login,
        logout
    }
}