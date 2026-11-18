export interface AgentWorkload {
  total: number;
  byStatus: {
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  workload: AgentWorkload;
}

export interface AgentsResponse {
  success: boolean;
  message: string;
  data: Agent[];
}