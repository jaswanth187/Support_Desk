import type {
    ChangePasswordInput,
    LoginInput,
    RegisterInput,
    UpdateProfileInput,
} from "../validators/auth.validator"
import { findUserByEmail, createUser, createRefreshToken, findRefreshToken, rotateRefreshToken, revokeAllRefreshTokens, findUserById, revokeRefreshTokenForUser, updateUserPasswordAndRevokeSessions, updateUserProfile } from "../repositories/auth.repository"
import { hashPassword, comparePassword } from "../utils/password"
import { AppError } from "../utils/app-error"
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry, hashRefreshToken } from "../utils/token"
export const loginUser = async (input: LoginInput) => {
    const user = await findUserByEmail(input.email);
    if (!user) {
        throw new AppError(401, "Invalid email or password")
    }

    const isPasswordValid = await comparePassword(input.password, user.password)
    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password")
    }

    if (user.role === "AGENT" && !user.isActive) {
        throw new AppError(403, "Your account has been deactivated. Contact an administrator.");
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken();

    await createRefreshToken({
        tokenHash: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
    })

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    }
}
export const registerUser = async (input: RegisterInput) => {
    const existingUser = await findUserByEmail(input.email)

    if (existingUser) {
        throw new AppError(409, "Email is already registerd")
    }

    const hashedPassword = await hashPassword(input.password)

    const user = await createUser({
        name: input.name,
        email: input.email,
        password: hashedPassword,
    })

    return user;
}

export const getCurrentUser = async (userId: string) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError(404, "User Not found")
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
}

export const updateCurrentUserProfile = async (
    userId: string,
    input: UpdateProfileInput
) => {
    return updateUserProfile(userId, input);
}

export const changeCurrentUserPassword = async (
    userId: string,
    input: ChangePasswordInput
) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const isCurrentPasswordValid = await comparePassword(
        input.currentPassword,
        user.password
    );

    if (!isCurrentPasswordValid) {
        throw new AppError(400, "Current password is incorrect");
    }

    const isSamePassword = await comparePassword(
        input.newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new AppError(400, "New password must be different from current password");
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await updateUserPasswordAndRevokeSessions(userId, hashedPassword);
}

export const refreshUserSession = async (rawToken: string) => {
    const tokenHash = hashRefreshToken(rawToken);

    const storedToken = await findRefreshToken(tokenHash);

    if (!storedToken) {
        throw new AppError(401, "Invalid refresh token")
    }

    if (storedToken.revokedAt) {
        await revokeAllRefreshTokens(storedToken.userId);

        throw new AppError(401, "Refresh toekn reuse detected. Please login again")
    }

    if (storedToken.expiresAt <= new Date()) {
        throw new AppError(401, "Refresh token has expired")
    }

    const user = await findUserById(storedToken.userId);

    if (!user) {
        throw new AppError(401, "Invalid refresh token");
    }

    if (user.role === "AGENT" && !user.isActive) {
        await revokeAllRefreshTokens(user.id);

        throw new AppError(403, "Your account has been deactivated. Contact an administrator.");
    }

    const newRefreshToken = generateRefreshToken();

    const rotated = await rotateRefreshToken({
        tokenId: storedToken.id,
        userId: storedToken.userId,
        newTokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: getRefreshTokenExpiry(),
    });

    if (!rotated) {
        // The token may have been rotated by another request after it was read.
        throw new AppError(401, "Refresh token is no longer valid");
    }

    const accessToken = generateAccessToken(user);

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
}

export const logoutUser = async (rawToken: string | undefined, userId: string) => {
    if (!rawToken) {
        return
    }

    const tokenHash = hashRefreshToken(rawToken)
    await revokeRefreshTokenForUser(tokenHash, userId);
}
