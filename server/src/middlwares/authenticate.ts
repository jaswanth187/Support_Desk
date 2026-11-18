import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { findUserAuthStatusById } from "../respositories/auth.repository";

const allowedRoles = ["ADMIN", "AGENT", "CUSTOMER"] as const;

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Invalid access token");
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      typeof decoded.sub !== "string" ||
      !allowedRoles.includes(
        decoded.role as (typeof allowedRoles)[number]
      )
    ) {
      throw new AppError(401, "Invalid access token");
    }

    const user = await findUserAuthStatusById(decoded.sub);

    if (!user) {
      throw new AppError(401, "User no longer exists");
    }

    if (user.role !== decoded.role) {
      throw new AppError(401, "Invalid access token");
    }

    if (user.role === "AGENT" && !user.isActive) {
      throw new AppError(
        403,
        "Your account has been deactivated. Contact an administrator."
      );
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return next(
        new AppError(401, "Invalid or expired access token")
      );
    }

    next(error);
  }
};