import type { UserRole } from "../../generate/prisma/client.js";
import * as dashboardRepository from "../repositories/dashboard.repository.js";

export const getDashboard = async (
  userId: string,
  role: UserRole
) => {
  return dashboardRepository.getDashboardData(userId, role);
};