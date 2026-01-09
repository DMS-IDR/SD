import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout, MainLayout } from '../layouts';
import { AuthPage } from '../../features/auth/AuthPage';
import { HomePage } from '../../features/home/HomePage';
import { ProtectedRoute } from './ProtectedRoute';

const AppRouter = () => {
    return (
        <BrowserRouter>

            <Routes>

                {/* Rutas Publicas */}
                <Route element={<AuthLayout />}>
                    <Route path="/sd" element={<AuthPage />} />
                </Route>

                {/* Rutas privadas */}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<MainLayout />}>
                        <Route path='/' element={<HomePage />} />
                    </Route>
                </Route>

            </Routes>

        </BrowserRouter>

    )
}

export default AppRouter;
