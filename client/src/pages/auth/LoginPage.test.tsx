import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../../context/AuthContext";
import LoginPage from "./LoginPage";

vi.mock("../../context/AuthContext", () => ({
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

const renderLoginPage = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Dashboard destination</p>} />
      </Routes>
    </MemoryRouter>
  );

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(authValue);
  });

  it("shows validation errors and does not submit invalid credentials", async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Please enter a valid email address")
    ).toBeTruthy();
    expect(screen.getByText("Password is required")).toBeTruthy();
    expect(authValue.login).not.toHaveBeenCalled();
  });

  it("submits valid credentials and navigates after login", async () => {
    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "customer@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(authValue.login).toHaveBeenCalledWith({
        email: "customer@example.test",
        password: "correct-password",
      });
    });
    expect(await screen.findByText("Dashboard destination")).toBeTruthy();
  });
});
