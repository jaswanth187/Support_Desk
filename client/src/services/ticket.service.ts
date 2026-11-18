
import { api } from "./api";

import type {
  Ticket,
  TicketFilters,
  TicketListResponse,
} from "../types/ticket.types";

import type { TicketStatus, TicketPriority } from "../types/dashboard.types";
import type { Comment } from "../types/comment.types";
import type { CreateTicketFormData } from "../schemas/ticket.schema";

export const ticketService = {
  // Get tickets with pagination and filters
  async getTickets(filters: TicketFilters): Promise<TicketListResponse> {
    const response = await api.get<TicketListResponse>(
      "/tickets",
      {
        params: filters,
      }
    );

    return response.data;
  },

  // Get a single ticket
  async getTicketById(id: string): Promise<Ticket> {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: Ticket;
    }>(`/tickets/${id}`);

    return response.data.data;
  },

  async updateTicketStatus(
    id: string,
    status: TicketStatus
  ): Promise<Ticket> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Ticket;
    }>(`/tickets/${id}/status`, { status });

    return response.data.data;
  },

  async updateTicketPriority(
    id: string,
    priority: TicketPriority
  ): Promise<Ticket> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Ticket;
    }>(`/tickets/${id}/priority`, { priority });

    return response.data.data;
  },

  async assignTicket(
    id: string,
    assignedAgentId: string | null
  ): Promise<Ticket> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Ticket;
    }>(`/tickets/${id}/assignment`, { assignedAgentId });

    return response.data.data;
  },

  async addComment(
    ticketId: string,
    message: string
  ): Promise<Comment> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Comment;
    }>(`/tickets/${ticketId}/comments`, { message });

    return response.data.data;
  },

  async createTicket(
  payload: CreateTicketFormData
): Promise<Ticket> {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Ticket;
  }>("/tickets", payload);

  return response.data.data;
},
};


