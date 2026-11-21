import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const clientOrigin = new URL(env.CLIENT_URL).origin;

export const verifyClientOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.get("origin") !== clientOrigin) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  return next();
};
