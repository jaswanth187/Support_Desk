import type {
  TicketStatus,
  TicketPriority,
} from "./dashboard.types";

export interface CustomerDashboardTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
  assignedAgent: {
    id: string;
    name: string;
  } | null;
}

export interface CustomerDashboardData {
  totalTickets: number;
  statusBreakdown: {
    status: TicketStatus;
    count: number;
  }[];
  priorityBreakdown: {
    priority: TicketPriority;
    count: number;
  }[];
  recentTickets: CustomerDashboardTicket[];
}