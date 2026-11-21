import type { Request, Response, NextFunction } from "express"
import { Prisma } from "../../generate/prisma/client"
import { AppError } from "../utils/app-error"


export const errorMiddlware = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "A record with this information already exists",
        });
    }

    console.error(
        "Unhandled application error:",
        error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}