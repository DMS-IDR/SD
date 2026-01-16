import { useQuery } from '@tanstack/react-query';
import sdGestionApi from "../../../shared/utils/clientApi";

const EMPTY_ARRAY = [];

export const useCashes = (entity) => {
    const cashesQuery = useQuery({
        queryKey: ['cashes', entity],
        queryFn: async () => {
            const { data } = await sdGestionApi.get(`/closing-sale/cashes?entity=${entity}`);
            return data.data; // Correctly extract the array from { message, data, error }
        },
        enabled: !!entity,
    });

    return {
        cashes: cashesQuery.data || EMPTY_ARRAY,
        isLoading: cashesQuery.isLoading,
        isError: cashesQuery.isError,
        error: cashesQuery.error,
    };
};
