import type { Request, Response } from "express";
import { createTicketSchema } from "../validators/ticket.validator"
import { createCustomerTicket, getTicketsForUser, getTicketDetails, getCommentsForTicket, addCommentToTicket, assignTicketToAgent } from "../services/ticket.service"
import { AppError } from "../utils/app-error";
import { ticketQuerySchema } from "../validators/ticket-query.validator";
import { createCommentSchema } from "../validators/comment.validator";
import { ticketAssignmentSchema } from "../validators/ticket-assignment.validator";
import { updateTicketStatusSchema, updateTicketPrioritySchema } from "../validators/ticket-update.validator";
import { changeTicketStatus,changeTicketPriority } from "../services/ticket.service";

export const createTicketController = async (
    req: Request,
    res: Response
) => {
    if (!req.user) {
        throw new AppError(401, "Authentication required")
    }

    const parsed = createTicketSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new AppError(400, "Invalid ticket details");
    }

    const ticket = await createCustomerTicket(parsed.data, req.user.id);

    res.status(201).json({ success: true, message: "Ticket created Successfully", data: ticket })
}

export const getTicketsController = async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError(401, "Authentication required")
    }
    const parsed = ticketQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        throw new AppError(400, "Invalid ticket query parameters")
    }
    const result = await getTicketsForUser(req.user.id, req.user.role, parsed.data);

    res.status(200).json({
        success: true,
        message: "Tickets retrived successfully",
        data: result.tickets,
        pagination: result.pagination,
    })
}

export const getTicketByIdController = async (req: Request, res: Response) => {

    if (!req.user) {
        throw new AppError(401, "Authentication required")
    }

    const ticketId = req.params.id;

    // console.log("This is ticket id", ticketId)

    if (typeof ticketId !== "string" || !ticketId.trim()) {
        throw new AppError(400, "Ticket Id is required");
    }

    const ticket = await getTicketDetails(ticketId, req.user.id, req.user.role);

    res.status(200).json({
        success: true,
        message: "Ticket retrived successfully",
        data: ticket,
    });
}

export const getTicketCommentsController = async (req: Request, res: Response) => {

    if (!req.user) {
        throw new AppError(401, "Authentication required")
    }

    const ticketId = req.params.id;

    if (typeof ticketId !== "string") {
        throw new AppError(400, "Ticket ID is required");
    }

    const comments = await getCommentsForTicket(
        ticketId,
        req.user.id,
        req.user.role,
    )

    res.status(200).json({
        success: true,
        message: "Comments retrived successfully",
        data: comments,
    })
}

export const createTicketCommentController = async (
    req: Request,
    res: Response
) => {
    if (!req.user) {
        throw new AppError(401, "Authentication required")
    }

    const ticketId = req.params.id;
    if (typeof ticketId !== "string") {
        throw new AppError(400, "Invalid comment details");
    }

    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(400, "Invalid comment details");
    }

    const comment = await addCommentToTicket(
        ticketId,
        req.user.id,
        req.user.role,
        parsed.data.message
    )

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
}

export const assignTicketController = async (
    req: Request,
    res: Response
) => {
    const ticketId = req.params.id;

    if (typeof ticketId !== "string") {
        throw new AppError(400, "Ticket ID is required");
    }

    const parsed = ticketAssignmentSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new AppError(400, "Invalid assignment details");
    }

    const ticket = await assignTicketToAgent(
        ticketId,
        parsed.data.assignedAgentId,
        req.user!.id
    );

    res.status(200).json({
        success: true,
        message: "Ticket assignment updated successfully",
        data: ticket,
    });
};

export const updateTicketStatusController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const parsed = updateTicketStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid status");
  }

  const ticketId = req.params.id;

  if (typeof ticketId!=="string") {
    throw new AppError(400, "Ticket ID is required");
  }

  const ticket = await changeTicketStatus(
    ticketId,
    req.user.id,
    req.user.role as "ADMIN" | "AGENT",
    parsed.data.status
  );

  res.status(200).json({
    success: true,
    message: "Ticket status updated successfully",
    data: ticket,
  });
};

export const updateTicketPriorityController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const parsed = updateTicketPrioritySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid priority");
  }

  const ticketId = req.params.id;

  if (typeof ticketId!=="string") {
    throw new AppError(400, "Ticket ID is required");
  }

  const ticket = await changeTicketPriority(
    ticketId,
    req.user.id,
    req.user.role as "ADMIN" | "AGENT",
    parsed.data.priority
  );

  res.status(200).json({
    success: true,
    message: "Ticket priority updated successfully",
    data: ticket,
  });
};