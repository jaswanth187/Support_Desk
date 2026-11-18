import { z } from "zod";

export const updateAgentStatusSchema = z.object({
  isActive: z.boolean(),
});
