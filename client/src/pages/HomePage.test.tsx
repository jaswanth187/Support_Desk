import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import HomePage from "./HomePage";

describe("home page", () => {
  it("explains SupportDesk and links visitors to registration and sign in", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Every request has a clear path forward.",
      })
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Create an account" }).getAttribute("href")
    ).toBe("/register");
    expect(
      screen.getAllByRole("link", { name: "Sign in" })[0].getAttribute("href")
    ).toBe("/login");
    expect(screen.getByRole("heading", { name: "Track every request" }))
      .toBeTruthy();
  });
});
