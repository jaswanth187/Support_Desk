import { Router } from "express";
import { authenticate } from "../middlwares/authenticate";
import { authorize } from "../middlwares/authorize";
import {
    assignTicketController,
    createTicketCommentController,
    createTicketController,
    getTicketByIdController,
    getTicketCommentsController,
    getTicketsController,
    updateTicketStatusController,
    updateTicketPriorityController
} from "../controllers/ticket.controller";

const router = Router();

router.post('/', authenticate, authorize("CUSTOMER"), createTicketController);
router.get("/", authenticate, getTicketsController)
router.get("/:id", authenticate, getTicketByIdController);
router.get("/:id/comments", authenticate, getTicketCommentsController);
router.post("/:id/comments", authenticate, createTicketCommentController);
router.patch("/:id/assignment", authenticate, authorize("ADMIN"), assignTicketController);
router.patch("/:id/status", authenticate, authorize("ADMIN", "AGENT"), updateTicketStatusController)
router.patch("/:id/priority", authenticate, authorize("ADMIN", "AGENT"), updateTicketPriorityController);

export default router;