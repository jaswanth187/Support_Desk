import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import PageLoadingSkeleton from "../components/common/PageLoadingSkeleton";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoadingSkeleton />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
export default ProtectedRoute