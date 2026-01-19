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

export const useClosingSalesInfo = (params) => {
    const infoQuery = useQuery({
        queryKey: ['closing-sale-info', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.date) searchParams.append('date', params.date);
            if (params.entity) searchParams.append('entity', params.entity);
            if (params.channel) searchParams.append('channel', params.channel);
            if (params.cash) searchParams.append('cash', params.cash);

            const { data } = await sdGestionApi.get(`/closing-sale/info?${searchParams.toString()}`);

            console.log('Closing Sales Info', data.data)

            return data.data; // Correctly extract the array from { message, data, error }
        },
        enabled: !!(params.date && params.entity && params.chsannel && params.cash),
    });

    return {
        info: infoQuery.data || EMPTY_ARRAY,
        isLoading: infoQuery.isLoading,
        isError: infoQuery.isError,
        error: infoQuery.error,
    };
};
