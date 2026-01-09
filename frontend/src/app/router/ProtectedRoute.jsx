import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/sd" replace />;
    }
    
    return <Outlet />;
};