import { z } from "zod";
import {
  TicketStatus,
  TicketPriority,
} from "../../generate/prisma/client.js";

export const updateTicketStatusSchema = z.object({
  status: z.enum(TicketStatus),
});

export const updateTicketPrioritySchema = z.object({
  priority: z.enum(TicketPriority),
});