import sdGestionApi from "../../../shared/utils/clientApi";
import { supabase } from "../../../shared/utils/clientSuperbase";

export const useAuth = () => {

    const login = async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw  new Error(error.message);

            // console.log(data);
            
            return data;
    }

    return {
        login
    }
}