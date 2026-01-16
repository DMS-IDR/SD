import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout, MainLayout } from '../layouts';
import { AuthPage } from '../../features/auth/AuthPage';
import { HomePage } from '../../features/home/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { UserManagementPage } from '../../features/userManagement/UserManagementPage';
import { ClosingSalesPage } from '../../features/closingSales/ClosingSalesPage';

const AppRouter = () => {
    return (
        <BrowserRouter>

            <Routes>

                {/* Rutas Publicas */}
                <Route element={<AuthLayout />}>
                    <Route path="/sd" element={<AuthPage />} />
                </Route>

                {/* Rutas privadas */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/users' element={<UserManagementPage />} />
                        <Route path='/closing-sales' element={<ClosingSalesPage />} />
                    </Route>
                </Route>

            </Routes>

        </BrowserRouter>

    )
}

export default AppRouter;
