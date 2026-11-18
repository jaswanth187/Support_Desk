export type TicketStatus = | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketPriority = | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface StatusBreakdown {
    status: TicketStatus;
    count: number;
}

export interface PriorityBreakdown {
  priority: TicketPriority;
  count: number;
}

export interface RecentTicket {
    id: number | string;
    ticketNumber: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
}

export interface AgentWorkload{
    id: number | string;
    name: string;
    email: string;
    assignedTickets: number;
}

export interface DashboardData{
    totalTickets: number;
    statusBreakdown: StatusBreakdown[];
    priorityBreakdown: PriorityBreakdown[];
    recentTickets: RecentTicket[];
    agentWorkloads?: AgentWorkload[];
}