import { Navigate,Outlet } from "react-router-dom";
import type { UserRole } from "../types/auth.types";
import { useAuth } from "../context/AuthContext";

interface RoleRouteProps{
    allowedRoles: UserRole[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};
export default RoleRoute