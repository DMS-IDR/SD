import axios from "axios";

const sdGestionApi = axios.create({
    baseURL: import.meta.env.VITE_API_BACKEND_URL
})

// Interceptor de request

sdGestionApi.interceptors.request.use(
    (config) => {
        // TODO: al momento de hacer login se debe solo guardar token en LS
        const token = localStorage.getItem('token-sdgestion')

        if(token) {
            console.log(token)
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
)

export default sdGestionApi;