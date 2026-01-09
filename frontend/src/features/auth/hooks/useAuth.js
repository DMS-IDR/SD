import { supabase } from "../../../shared/utils/clientSuperbase";
import { saveToLocalStorage } from "../../../shared/utils/localStorageManager";

export const useAuth = () => {

    const login = async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw  new Error(error.message);

            // console.log();

            saveToLocalStorage('token-sdgestion', data.session.access_token )

            return data;
    }

    return {
        login
    }
}