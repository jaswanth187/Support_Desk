import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../../generate/prisma/client";
import { AppError } from "../utils/app-error";

export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(
                new AppError(401, "Authentication required")
            );
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return next(
                new AppError(403, "You do not have permission to access this resource")
            );
        }
        next();
    }
}