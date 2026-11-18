import { api } from "./api";

import type { CustomerDashboardData } from "../types/customer-dashboard.types";
import type { AdminDashboardData } from "../types/admin-dashboard.types";

interface DashboardResponse {
  success: boolean;
  message: string;
  data: CustomerDashboardData;
}

interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

const dashboardService = {
  async getDashboard(): Promise<CustomerDashboardData> {
    const response = await api.get<DashboardResponse>("/dashboard");

    return response.data.data;
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await api.get<AdminDashboardResponse>("/dashboard");

    return response.data.data;
  },
};

export default dashboardService;