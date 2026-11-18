import { z } from "zod";

export const ticketAssignmentSchema = z.object({
  assignedAgentId: z.string().min(1).nullable(),
});

export type TicketAssignmentInput = z.infer<
  typeof ticketAssignmentSchema
>;