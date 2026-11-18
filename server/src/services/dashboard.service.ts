import type { UserRole } from "../../generate/prisma/client.js";
import * as dashboardRepository from "../respositories/dashboard.respository.js";

export const getDashboard = async (
  userId: string,
  role: UserRole
) => {
  return dashboardRepository.getDashboardData(userId, role);
};