
import type { Comment } from "./comment.types";
import type {
  TicketStatus,
  TicketPriority,
} from "./dashboard.types";
import type { TicketHistory } from "./ticket-history.types";

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedAgentId: string | null;
  customer?: TicketUser;
  assignedAgent?: TicketUser | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  ticketHistory?: TicketHistory[];
}

export interface TicketFilters {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  q?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TicketListResponse {
  success: boolean;
  message: string;
  data: Ticket[];
  pagination: TicketPagination;
}

export interface TicketUser {
  id: string;
  name: string;
  email: string;
}