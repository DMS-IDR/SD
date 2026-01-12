import sdGestionApi from "../../../shared/utils/clientApi"


export const useUserManagement = () => {

    const getAllUser = async () => {
        try {
            const { data } = await sdGestionApi.get('/api/users');
        } catch (error) {
            console.log('getAllUser', error);  
        }
    }

    const createUser = async (data) => {
        try {
            const { data } = await sdGestionApi.post('api/users/', data);
            console.log(data)
        } catch (error) {
            console.log('error: ', error)
        }
    }

    const editUser = async (userId) => {
        try {
            const { data } = await sdGestionApi.put(`/api/users/${user.id}`);
            console.log(data)
        } catch (error) {
            console.log('editUser: ', error)
        }
    }

    return (
        getAllUser,
        createUser,
        editUser
    )

}