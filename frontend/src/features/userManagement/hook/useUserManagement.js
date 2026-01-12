import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sdGestionApi from "../../../shared/utils/clientApi";

export const useUserManagement = () => {
    const queryClient = useQueryClient();

    // Query to fetch all users
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await sdGestionApi.get('/api/users');
            return data;
        },
    });

    // Mutation to create a user
    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const { data } = await sdGestionApi.post('/api/users/', userData);
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch users query to update the list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });

    // Mutation to edit a user
    const editUserMutation = useMutation({
        mutationFn: async ({ id, userData }) => {
            const { data } = await sdGestionApi.put(`/api/users/${id}/`, userData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error editing user:', error);
        }
    });

    return {
        // Properties for the UI
        users: usersQuery.data,
        isLoading: usersQuery.isLoading,
        isError: usersQuery.isError,
        error: usersQuery.error,

        // Actions
        createUser: createUserMutation.mutateAsync,
        isCreating: createUserMutation.isPending,

        editUser: editUserMutation.mutateAsync,
        isEditing: editUserMutation.isPending
    };
};