import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .refine(
    (value) => Buffer.byteLength(value, "utf-8") <= 72,
    "Password is too long"
  );

export const createAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: passwordSchema,
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
