import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../../context/AuthContext";
import dashboardService from "../../services/dashboard.service";
import CustomerDashboard from "./CustomerDashboard";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/dashboard.service", () => ({
  default: {
    getDashboard: vi.fn(),
  },
}));

const dashboardData = {
  totalTickets: 3,
  statusBreakdown: [
    { status: "OPEN" as const, count: 2 },
    { status: "IN_PROGRESS" as const, count: 1 },
    { status: "RESOLVED" as const, count: 0 },
    { status: "CLOSED" as const, count: 0 },
  ],
  priorityBreakdown: [
    { priority: "LOW" as const, count: 0 },
    { priority: "MEDIUM" as const, count: 3 },
    { priority: "HIGH" as const, count: 0 },
    { priority: "URGENT" as const, count: 0 },
  ],
  recentTickets: [],
};

describe("CustomerDashboard", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "customer-1",
        name: "QA Customer",
        email: "customer@example.test",
        role: "CUSTOMER",
        createdAt: "",
        updatedAt: "",
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(async () => {}),
      register: vi.fn(async () => {}),
      logout: vi.fn(async () => {}),
      updateUser: vi.fn(),
    });
  });

  it("renders dashboard data after loading", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue(dashboardData);

    render(
      <MemoryRouter>
        <CustomerDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("Welcome, QA Customer!")).toBeTruthy();
    expect(screen.getByText("Recent Tickets")).toBeTruthy();
    expect(screen.getByText("No tickets to display")).toBeTruthy();
  });

  it("shows a retry action when loading fails and recovers after retry", async () => {
    vi.mocked(dashboardService.getDashboard)
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(dashboardData);

    render(
      <MemoryRouter>
        <CustomerDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Unable to load dashboard. Please try again.")
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Welcome, QA Customer!")).toBeTruthy();
    expect(dashboardService.getDashboard).toHaveBeenCalledTimes(2);
  });
});
