import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute";
import { UnauthorizedPage, NotFoundPage } from "../pages/PlaceholderPages";
import GuestRoute from "./GuestRoute";
import PageLoadingSkeleton from "../components/common/PageLoadingSkeleton";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AdminDashboard = lazy(() => import("../pages/dashboard/AdminDashboard"));
const TicketListPage = lazy(() => import("../components/tickets/TicketListPage"));
const TicketDetailsPage = lazy(() => import("../pages/tickets/TicketDetailsPage"));
const CreateTicketPage = lazy(() => import("../pages/tickets/CreateTicketPage"));
const CustomerDashboard = lazy(() => import("../pages/dashboard/CustomerDashboard"));
const AgentDashboard = lazy(() => import("../pages/dashboard/AgentDashboard"));
const AgentManagementPage = lazy(() => import("../pages/admin/AgentManagementPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

const DashboardRedirect = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

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

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoadingSkeleton />}>
                <Routes>
                    {/* Public routes */}
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Authentication check */}
                    <Route element={<ProtectedRoute />}>
                        {/* Common dashboard redirect */}
                        <Route path="/dashboard" element={<DashboardRedirect />} />

                        <Route element={<DashboardLayout />}>
                            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                                <Route
                                    path="/admin/dashboard"
                                    element={<AdminDashboard />}
                                />

                                <Route
                                    path="/admin/tickets"
                                    element={<TicketListPage />}
                                />

                                <Route
                                    path="/admin/tickets/:id"
                                    element={<TicketDetailsPage />}
                                />

                                <Route path="/admin/profile" element={<ProfilePage />} />

                                <Route path="/admin/agents" element={<AgentManagementPage />} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={["AGENT"]} />}>
                                <Route
                                    path="/agent/dashboard"
                                    element={<AgentDashboard />}
                                />

                                <Route
                                    path="/agent/tickets"
                                    element={<TicketListPage />}
                                />

                                <Route
                                    path="/agent/tickets/:id"
                                    element={<TicketDetailsPage />}
                                />

                                <Route path="/agent/profile" element={<ProfilePage />} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>
                                <Route
                                    path="/customer/dashboard"
                                    element={<CustomerDashboard />}
                                />

                                <Route
                                    path="/customer/tickets"
                                    element={<TicketListPage />}
                                />

                                <Route
                                    path="/customer/tickets/new"
                                    element={<CreateTicketPage />}
                                />

                                <Route
                                    path="/customer/tickets/:id"
                                    element={<TicketDetailsPage />}
                                />

                                <Route path="/customer/profile" element={<ProfilePage />} />
                            </Route>

                            <Route path="/tickets/:id" element={<TicketDetailsPage />} />
                        </Route>
                    </Route>

                    <Route
                        path="/unauthorized"
                        element={<UnauthorizedPage />}
                    />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRoutes