import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  registerSchema,
  updateProfileSchema,
} from "../src/validators/auth.validator";
import { ticketQuerySchema } from "../src/validators/ticket-query.validator";
import { createTicketSchema } from "../src/validators/ticket.validator";
import { updateAgentStatusSchema } from "../src/validators/agent-status.validator";
import { createAgentSchema } from "../src/validators/agent.validator";

describe("request validation", () => {
  it("normalizes registration email and rejects passwords exceeding bcrypt's byte limit", () => {
    const registration = registerSchema.safeParse({
      name: "  Agent Name ",
      email: "  USER@Example.COM ",
      password: "a secure password",
    });

    expect(registration.success).toBe(true);
    if (registration.success) {
      expect(registration.data.email).toBe("user@example.com");
      expect(registration.data.name).toBe("Agent Name");
    }

    expect(
      registerSchema.safeParse({
        name: "Valid Name",
        email: "user@example.com",
        password: "😀".repeat(19),
      }).success
    ).toBe(false);
  });

  it("requires at least one valid profile field and validates password changes", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
    expect(
      updateProfileSchema.safeParse({ email: "USER@Example.com" })
    ).toMatchObject({
      success: true,
      data: { email: "user@example.com" },
    });

    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "new-password",
      }).success
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "😀".repeat(19),
      }).success
    ).toBe(false);
  });

  it("applies safe ticket query defaults and rejects invalid pagination", () => {
    expect(ticketQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    expect(ticketQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(ticketQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
  });

  it("defaults ticket priority and requires a boolean agent status", () => {
    expect(
      createTicketSchema.parse({
        title: "Cannot access account",
        description: "The sign-in page rejects my credentials.",
        category: "Account",
      }).priority
    ).toBe("MEDIUM");

    expect(updateAgentStatusSchema.safeParse({ isActive: false }).success).toBe(
      true
    );
    expect(updateAgentStatusSchema.safeParse({ isActive: "false" }).success).toBe(
      false
    );
  });

  it("validates and normalizes agent creation details", () => {
    expect(
      createAgentSchema.safeParse({
        name: " New Agent ",
        email: " NEW@Example.com ",
        password: "secure-password",
      })
    ).toMatchObject({
      success: true,
      data: {
        name: "New Agent",
        email: "new@example.com",
      },
    });

    expect(
      createAgentSchema.safeParse({
        name: "A",
        email: "invalid",
        password: "short",
      }).success
    ).toBe(false);
  });
});
