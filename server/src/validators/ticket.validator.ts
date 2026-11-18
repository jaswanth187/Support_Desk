import {z} from "zod";
import { TicketPriority } from "../../generate/prisma/client";

export const createTicketSchema = z.object({
    title: z.string().trim().min(5).max(150),
    description: z.string().trim().min(10).max(5000),
    category: z.string().trim().min(2).max(50),
    priority: z.enum(TicketPriority).default(TicketPriority.MEDIUM),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>;


