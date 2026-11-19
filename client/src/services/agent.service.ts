import { api } from "./api";
import type { AgentsResponse, Agent } from "../types/agent.types";

interface AgentStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isActive: boolean;
  };
}

export interface CreateAgentInput {
  name: string;
  email: string;
  password: string;
}

export interface CreatedAgent {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateAgentResponse {
  success: boolean;
  message: string;
  data: CreatedAgent;
}

const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await api.get<AgentsResponse>("/agents");
    return response.data.data;
  },

  async createAgent(input: CreateAgentInput): Promise<CreatedAgent> {
    const response = await api.post<CreateAgentResponse>("/agents", input);
    return response.data.data;
  },

  async updateAgentStatus(
    agentId: string,
    isActive: boolean
  ): Promise<AgentStatusResponse["data"]> {
    const response = await api.patch<AgentStatusResponse>(
      `/agents/${agentId}/status`,
      { isActive }
    );

    return response.data.data;
  },
};

export default agentService;