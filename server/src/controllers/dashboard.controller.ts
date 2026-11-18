import type { Request, Response } from "express";
import { getDashboard } from "../services/dashboard.service";
import {AppError} from "../utils/app-error";

export const getDashboardController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const dashboard = await getDashboard(
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard,
  });
};