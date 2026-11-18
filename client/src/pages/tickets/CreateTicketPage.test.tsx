import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ticketService } from "../../services/ticket.service";
import CreateTicketPage from "./CreateTicketPage";

vi.mock("../../services/ticket.service", () => ({
  ticketService: {
    createTicket: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createdTicket = {
  id: "ticket-1",
  ticketNumber: "SD-TEST-1",
  title: "Unable to access account",
  description: "The account page fails to load for the customer.",
  category: "Account",
  status: "OPEN" as const,
  priority: "MEDIUM" as const,
  customerId: "customer-1",
  assignedAgentId: null,
  createdAt: "2026-11-17T00:00:00.000Z",
  updatedAt: "2026-11-17T00:00:00.000Z",
};

const renderCreateTicketPage = () =>
  render(
    <MemoryRouter initialEntries={["/customer/tickets/new"]}>
      <Routes>
        <Route
          path="/customer/tickets/new"
          element={<CreateTicketPage />}
        />
        <Route
          path="/customer/tickets/:id"
          element={<p>Ticket details destination</p>}
        />
      </Routes>
    </MemoryRouter>
  );

describe("CreateTicketPage", () => {
  beforeEach(() => {
    vi.mocked(ticketService.createTicket).mockResolvedValue(createdTicket);
  });

  it("validates required ticket fields before submitting", async () => {
    renderCreateTicketPage();

    fireEvent.click(screen.getByRole("button", { name: "Submit Ticket" }));

    expect(
      await screen.findByText("Subject must contain at least 5 characters")
    ).toBeTruthy();
    expect(screen.getByText("Please select a category")).toBeTruthy();
    expect(ticketService.createTicket).not.toHaveBeenCalled();
  });

  it("creates a valid ticket and navigates to its details", async () => {
    renderCreateTicketPage();

    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Unable to access account" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: {
        value: "The account page fails to load for the customer.",
      },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Account" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Ticket" }));

    await waitFor(() => {
      expect(ticketService.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Unable to access account",
          category: "Account",
        })
      );
    });
    expect(
      await screen.findByText("Ticket details destination")
    ).toBeTruthy();
  });
});
