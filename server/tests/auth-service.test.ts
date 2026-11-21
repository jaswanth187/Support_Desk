import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authRepository from "../src/repositories/auth.repository";
import * as passwordUtils from "../src/utils/password";
import {
  changeCurrentUserPassword,
  loginUser,
  refreshUserSession,
} from "../src/services/auth.service";
import { hashRefreshToken } from "../src/utils/token";

vi.mock("../src/repositories/auth.repository", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  createRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  revokeAllRefreshTokens: vi.fn(),
  revokeRefreshToken: vi.fn(),
  findUserById: vi.fn(),
  revokeRefreshTokenForUser: vi.fn(),
  updateUserPasswordAndRevokeSessions: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock("../src/utils/password", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

const user = {
  id: "agent-1",
  name: "Agent One",
  email: "agent@example.com",
  password: "stored-hash",
  role: "AGENT" as const,
  isActive: true,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("authentication services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies inactive agents before creating a refresh session", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      ...user,
      isActive: false,
    });
    vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);

    await expect(
      loginUser({ email: user.email, password: "correct-password" })
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
  });

  it("stores only a hash of the issued refresh token", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
    vi.mocked(authRepository.createRefreshToken).mockResolvedValue({
      id: "refresh-1",
      tokenHash: "stored-token-hash",
      userId: user.id,
      expiresAt: new Date("2030-01-01T00:00:00Z"),
      revokedAt: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    const result = await loginUser({
      email: user.email,
      password: "correct-password",
    });

    expect(result.user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    expect(authRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        tokenHash: hashRefreshToken(result.refreshToken),
      })
    );
    expect(result.user).not.toHaveProperty("password");
  });

  it("revokes all sessions when a previously revoked refresh token is reused", async () => {
    vi.mocked(authRepository.findRefreshToken).mockResolvedValue({
      id: "refresh-1",
      tokenHash: "hash",
      userId: user.id,
      expiresAt: new Date("2030-01-01T00:00:00Z"),
      revokedAt: new Date("2025-01-02T00:00:00Z"),
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });
    vi.mocked(authRepository.revokeAllRefreshTokens).mockResolvedValue({
      count: 1,
    });

    await expect(refreshUserSession("reused-token")).rejects.toMatchObject({
      statusCode: 401,
    });

    expect(authRepository.revokeAllRefreshTokens).toHaveBeenCalledWith(user.id);
  });

  it("does not revoke other sessions when concurrent refresh rotation loses its race", async () => {
    vi.mocked(authRepository.findRefreshToken).mockResolvedValue({
      id: "refresh-1",
      tokenHash: "hash",
      userId: user.id,
      expiresAt: new Date("2030-01-01T00:00:00Z"),
      revokedAt: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });
    vi.mocked(authRepository.findUserById).mockResolvedValue(user);
    vi.mocked(authRepository.rotateRefreshToken).mockResolvedValue(false);
    await expect(refreshUserSession("racing-token")).rejects.toMatchObject({
      statusCode: 401,
    });

    expect(authRepository.revokeAllRefreshTokens).not.toHaveBeenCalled();
  });

  it("returns the authenticated user with a rotated refresh session", async () => {
    vi.mocked(authRepository.findRefreshToken).mockResolvedValue({
      id: "refresh-1",
      tokenHash: "hash",
      userId: user.id,
      expiresAt: new Date("2030-01-01T00:00:00Z"),
      revokedAt: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });
    vi.mocked(authRepository.findUserById).mockResolvedValue(user);
    vi.mocked(authRepository.rotateRefreshToken).mockResolvedValue(true);

    const session = await refreshUserSession("valid-refresh-token");

    expect(session.user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect(session).toHaveProperty("accessToken");
    expect(session).toHaveProperty("refreshToken");
  });

  it("does not change a password when the current password is incorrect", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(user);
    vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

    await expect(
      changeCurrentUserPassword(user.id, {
        currentPassword: "wrong-password",
        newPassword: "new-password",
      })
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(
      authRepository.updateUserPasswordAndRevokeSessions
    ).not.toHaveBeenCalled();
  });

  it("hashes new passwords and revokes existing sessions after a valid change", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(user);
    vi.mocked(passwordUtils.comparePassword)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    vi.mocked(passwordUtils.hashPassword).mockResolvedValue("new-stored-hash");
    vi.mocked(
      authRepository.updateUserPasswordAndRevokeSessions
    ).mockResolvedValue(undefined);

    await expect(
      changeCurrentUserPassword(user.id, {
        currentPassword: "old-password",
        newPassword: "new-password",
      })
    ).resolves.toBeUndefined();

    expect(passwordUtils.hashPassword).toHaveBeenCalledWith("new-password");
    expect(
      authRepository.updateUserPasswordAndRevokeSessions
    ).toHaveBeenCalledWith(user.id, "new-stored-hash");
  });
});
