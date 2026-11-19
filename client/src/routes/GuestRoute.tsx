import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoadingSkeleton from "../components/common/PageLoadingSkeleton";

const GuestRoute = () =>{
    const {isAuthenticated, isLoading, user} = useAuth();

    if(isLoading){
        return <PageLoadingSkeleton />;
    }

    if(isAuthenticated && user){
        switch (user.role) {
            case "ADMIN":
                return <Navigate to="/admin/dashboard" replace />;

            case "AGENT":
                return <Navigate to="/agent/dashboard" replace />;

            case "CUSTOMER":
                return <Navigate to="/customer/dashboard" replace />;

            default:
                return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet/>;
}

export default GuestRoute;