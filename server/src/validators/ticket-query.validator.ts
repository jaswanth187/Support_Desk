import {z} from "zod";
import { TicketPriority, TicketStatus } from "../../generate/prisma/client";

export const ticketQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(50),
    status: z.enum(TicketStatus).optional(),
    priority: z.enum(TicketPriority).optional(),
    category: z.string().trim().optional(),
    q: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "priority"]).default("createdAt"),
    sortOrder: z.enum(["asc","desc"]).default("desc"),
})

export type TicketQueryInput = z.infer<typeof ticketQuerySchema>