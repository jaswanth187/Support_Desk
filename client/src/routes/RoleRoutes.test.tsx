import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const authValue: ReturnType<typeof useAuth> = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(async () => {}),
  register: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  updateUser: vi.fn(),
};

const renderProtectedPage = () =>
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<p>Private content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );

describe("protected and role-based routes", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(authValue);
  });

  it("redirects unauthenticated users to login", () => {
    renderProtectedPage();

    expect(screen.getByText("Login page")).toBeTruthy();
    expect(screen.queryByText("Private content")).toBeNull();
  });

  it("renders protected content for an authenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authValue,
      isAuthenticated: true,
    });

    renderProtectedPage();

    expect(screen.getByText("Private content")).toBeTruthy();
  });

  it("redirects users whose role is not allowed", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authValue,
      user: {
        id: "customer-1",
        name: "Customer",
        email: "customer@example.test",
        role: "CUSTOMER",
        createdAt: "",
        updatedAt: "",
      },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<p>Admin content</p>} />
          </Route>
          <Route path="/unauthorized" element={<p>Unauthorized page</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Unauthorized page")).toBeTruthy();
    expect(screen.queryByText("Admin content")).toBeNull();
  });
});
