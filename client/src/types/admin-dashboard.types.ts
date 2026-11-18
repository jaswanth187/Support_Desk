import type { CustomerDashboardData } from "./customer-dashboard.types";

export interface AgentWorkload {
  id: string;
  name: string;
  email: string;
  assignedTickets: number;
}

export interface AdminDashboardData extends CustomerDashboardData {
  agentWorkloads: AgentWorkload[];
}