import { useQuery } from '@tanstack/react-query';
import sdGestionApi from "../../../shared/utils/clientApi";

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

export const useCashes = (entity) => {
    const cashesQuery = useQuery({
        queryKey: ['cashes', entity],
        queryFn: async () => {
            const { data } = await sdGestionApi.get(`/closing-sale/cashes?entity=${entity}`);
            console.log(`API Cashes for entity ${entity}:`, data);
            return data;
        },
        enabled: !!entity,
    });

    const rawData = cashesQuery.data;
    const cashes = Array.isArray(rawData)
        ? rawData
        : (Array.isArray(rawData?.data) ? rawData.data : EMPTY_ARRAY);

    return {
        cashes,
        isLoading: cashesQuery.isLoading,
        isError: cashesQuery.isError,
        error: cashesQuery.error,
    };
};

export const useChannels = () => {
    const channelsQuery = useQuery({
        queryKey: ['channels'],
        queryFn: async () => {
            const { data } = await sdGestionApi.get(`/closing-sale/channels`);
            console.log(`API Channels:`, data.data);
            return data.data;
        },
    });

    const rawData = channelsQuery.data;
    const channels = Array.isArray(rawData)
        ? rawData
        : (Array.isArray(rawData?.data) ? rawData.data : EMPTY_ARRAY);

    return {
        channels,
        isLoading: channelsQuery.isLoading,
        isError: channelsQuery.isError,
        error: channelsQuery.error,
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
            return data;
        },
        enabled: !!(params && params.date && params.entity && params.channel && params.cash),
    });

    const rawData = infoQuery.data;
    const info = (rawData && !Array.isArray(rawData) && typeof rawData === 'object')
        ? (rawData.data || rawData)
        : (rawData || EMPTY_OBJECT);

    return {
        info,
        isLoading: infoQuery.isLoading,
        isError: infoQuery.isError,
        error: infoQuery.error,
        isFetching: infoQuery.isFetching,
    };
};
