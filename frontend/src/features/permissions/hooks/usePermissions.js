import { useAuth as useAuthContext } from "../../../app/context/AuthContext";
import sdGestionApi from "../../../shared/utils/clientApi"


export const usePermissions = () => {

    const {  } = useAuthContext();


    const getPermissions = async () => {

        try {
            const p = await sdGestionApi.get('/api/users/me/permissions/pos');
            
        } catch (error) {
            
        }
    } 

    return{

    }
}