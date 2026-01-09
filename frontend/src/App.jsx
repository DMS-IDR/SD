import { AuthProvider } from "./app/context/AuthContext";
import { AuthLayout, MainLayout } from "./app/layouts";
import AppRouter from "./app/router/AppRouter";


export default function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}