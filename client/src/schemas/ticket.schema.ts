import { z } from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Subject must contain at least 5 characters")
    .max(150, "Subject cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  category: z
    .string()
    .min(1, "Please select a category"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type CreateTicketFormData = z.infer<
  typeof createTicketSchema
>;