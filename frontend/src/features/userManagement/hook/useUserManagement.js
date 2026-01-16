import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sdGestionApi from "../../../shared/utils/clientApi";

export const useUserManagement = () => {
    const queryClient = useQueryClient();

    // Query to fetch all users
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await sdGestionApi.get('/users');
            console.log('data', data)
            return data;
        },
    });

    // Mutation to create a user
    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const { data } = await sdGestionApi.post('/users', userData);
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch users query to update the list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.log(error.response.data)
            console.error('Error creating user:', error);
        }
    });

    // Mutation to edit a user
    const editUserMutation = useMutation({
        mutationFn: async ({ id, userData }) => {
            console.log('userData', userData)
            const { data } = await sdGestionApi.patch(`/users/${id}`, userData);
            console.log('data', data)
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error editing user:', error);
        }
    });

    // Mutation to delete a user
    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await sdGestionApi.delete(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
        }
    });

    return {
        // Properties for the UI
        users: usersQuery.data?.data?.users || [],
        isLoading: usersQuery.isLoading,
        isError: usersQuery.isError,
        error: usersQuery.error,

        // Actions
        createUser: createUserMutation.mutateAsync,
        isCreating: createUserMutation.isPending,

        editUser: editUserMutation.mutateAsync,
        isEditing: editUserMutation.isPending,

        deleteUser: deleteUserMutation.mutateAsync,
        isDeleting: deleteUserMutation.isPending
    };
};