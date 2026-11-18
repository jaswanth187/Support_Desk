import type {
  TicketStatus,
  TicketPriority,
} from "./dashboard.types";

import type { UserRole } from "./auth.types";

interface HistoryAgent {
  id: string;
  name: string;
}

export interface TicketHistory {
  id: string;

  oldStatus: TicketStatus | null;
  newStatus: TicketStatus | null;

  oldPriority: TicketPriority | null;
  newPriority: TicketPriority | null;

  oldAssignedAgentId: string | null;
  newAssignedAgentId: string | null;

  oldAssignedAgent: HistoryAgent | null;
  newAssignedAgent: HistoryAgent | null;

  createdAt: string;

  changedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
}