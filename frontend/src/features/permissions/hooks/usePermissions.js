
import sdGestionApi from "../../../shared/utils/clientApi"


export const usePermissions = () => {

    const { user } = useAuthContext();


    const getPermissions = async () => {

        try {
            const p = await sdGestionApi.get('/api/users/me/permissions');

        } catch (error) {

        }
    }

    return {

    }
}