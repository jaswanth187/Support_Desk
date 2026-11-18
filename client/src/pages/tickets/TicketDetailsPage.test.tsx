import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../../context/AuthContext";
import agentService from "../../services/agent.service";
import { ticketService } from "../../services/ticket.service";
import TicketDetailsPage from "./TicketDetailsPage";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/agent.service", () => ({
  default: {
    getAgents: vi.fn(),
  },
}));

vi.mock("../../services/ticket.service", () => ({
  ticketService: {
    getTicketById: vi.fn(),
    updateTicketStatus: vi.fn(),
    updateTicketPriority: vi.fn(),
    assignTicket: vi.fn(),
    addComment: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const ticket = {
  id: "ticket-1",
  ticketNumber: "SD-TEST-1",
  title: "Unable to access account",
  description: "The account page fails to load for the customer.",
  category: "Account",
  status: "OPEN" as const,
  priority: "MEDIUM" as const,
  customerId: "customer-1",
  assignedAgentId: null,
  customer: {
    id: "customer-1",
    name: "QA Customer",
    email: "customer@example.test",
  },
  assignedAgent: null,
  createdAt: "2026-11-17T00:00:00.000Z",
  updatedAt: "2026-11-17T00:00:00.000Z",
  comments: [],
  ticketHistory: [],
};

const authValue: ReturnType<typeof useAuth> = {
  user: null,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(async () => {}),
  register: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  updateUser: vi.fn(),
};

const renderTicketDetails = () =>
  render(
    <MemoryRouter initialEntries={["/customer/tickets/ticket-1"]}>
      <Routes>
        <Route
          path="/customer/tickets/:id"
          element={<TicketDetailsPage />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("TicketDetailsPage permission controls", () => {
  beforeEach(() => {
    vi.mocked(ticketService.getTicketById).mockResolvedValue(ticket);
    vi.mocked(agentService.getAgents).mockResolvedValue([]);
  });

  it("shows status and priority controls to agents but not assignment controls", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authValue,
      user: {
        id: "agent-1",
        name: "QA Agent",
        email: "agent@example.test",
        role: "AGENT",
        createdAt: "",
        updatedAt: "",
      },
    });

    renderTicketDetails();

    expect(await screen.findByText(ticket.title)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Update status" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Update priority" })).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Assigned Agent" })).toBeNull();
  });

  it("does not show status, priority, or assignment controls to customers", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authValue,
      user: {
        id: "customer-1",
        name: "QA Customer",
        email: "customer@example.test",
        role: "CUSTOMER",
        createdAt: "",
        updatedAt: "",
      },
    });

    renderTicketDetails();

    expect(await screen.findByText(ticket.title)).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Update status" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Update priority" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Assigned Agent" })).toBeNull();
  });
});
