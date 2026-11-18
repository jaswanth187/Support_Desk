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

const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await api.get<AgentsResponse>("/agents");
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