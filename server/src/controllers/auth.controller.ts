import type { Request, Response } from "express";
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
    updateProfileSchema,
} from "../validators/auth.validator";
import {
    registerUser,
    loginUser,
    refreshUserSession,
    logoutUser,
    getCurrentUser as getCurrentUserService,
    updateCurrentUserProfile,
    changeCurrentUserPassword,
} from "../services/auth.service";
import { env } from "../config/env";
import {
    getRefreshCookieClearOptions,
    getRefreshCookieOptions,
} from "../utils/refresh-cookie";

export const register = async (req: Request, res: Response) => {
    const validation = registerSchema.safeParse(req.body)

    // console.log(req.body)

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.error.issues.map((issue) => ({
                field: issue.path.join("-"),
                message: issue.message
            }))
        })
    }

    const user = await registerUser(validation.data);

    return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
            user,
        }
    })
}

export const login = async (req: Request, res: Response) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    const result = await loginUser(validation.data);

    res.cookie("refreshToken", result.refreshToken, {
        ...getRefreshCookieOptions(
            env.NODE_ENV,
            env.REFRESH_TOKEN_EXPIRY_DAYS
        ),
    });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
}

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
        return res.status(401).json({
            success: false,
            message: "Refresh token is required",
        });
    }

    const result = await refreshUserSession(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
        ...getRefreshCookieOptions(
            env.NODE_ENV,
            env.REFRESH_TOKEN_EXPIRY_DAYS
        ),
    });

    return res.status(200).json({
        success: true,
        message: "Session refreshed successfully",
        data: {
            accessToken: result.accessToken,
            user: result.user,
        },
    });
}

export const logout = async (req: Request, res: Response) => {
    await logoutUser(
        req.cookies?.refreshToken,
        req.user!.id
    )

    res.clearCookie("refreshToken", {
        ...getRefreshCookieClearOptions(env.NODE_ENV),
    });

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    })
}

export const getMe = async (req: Request, res:Response)=>{
    const user = await getCurrentUserService(req.user!.id);

    return res.status(200).json({
        success: true,
        message: "Current user fetched successfully",
        data: user,
    })
}

export const updateProfile = async (req: Request, res: Response) => {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    const user = await updateCurrentUserProfile(
        req.user!.id,
        validation.data
    );

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
    });
};

export const changePassword = async (req: Request, res: Response) => {
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    await changeCurrentUserPassword(
        req.user!.id,
        validation.data
    );

    return res.status(200).json({
        success: true,
        message: "Password changed successfully. Please sign in again.",
    });
};

