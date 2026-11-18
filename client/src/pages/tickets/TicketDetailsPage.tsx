
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Clock } from "lucide-react";
import { toast } from "sonner";
import { ticketService } from "../../services/ticket.service";
import type { Ticket } from "../../types/ticket.types";
import { useAuth } from "../../context/AuthContext";
import type { TicketStatus, TicketPriority } from "../../types/dashboard.types";
import agentService from "../../services/agent.service";
import type { Agent } from "../../types/agent.types";
import TicketConversation from "../../components/tickets/TicketConversation";
import TicketActivity from "../../components/tickets/TicketActivity";

const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const TicketDetailsPage = () => {
    const { id } = useParams<{ id: string }>();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const displayError = !id ? "Invalid ticket ID" : error;
    const { user } = useAuth();
    const ticketListPath = user?.role === "CUSTOMER"
        ? "/customer/tickets"
        : user?.role === "AGENT"
            ? "/agent/tickets"
            : "/admin/tickets";

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoadingAgents, setIsLoadingAgents] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        let active = true;

        const fetchTicket = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await ticketService.getTicketById(id);

                if (active) {
                    setTicket(data);
                }
            } catch {
                if (active) {
                    setError("Unable to load ticket details.");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        fetchTicket();

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        if (user?.role !== "ADMIN") return;

        const fetchAgents = async () => {
            try {
                setIsLoadingAgents(true);
                const data = await agentService.getAgents();
                setAgents(data);
            } catch {
                console.error("Failed to fetch agents.");
                toast.error("Unable to load agents.");
            } finally {
                setIsLoadingAgents(false);
            }
        };

        fetchAgents();
    }, [user?.role]);

    const handleStatusChange = async (status: TicketStatus) => {
        if (!ticket || isUpdatingStatus) return;

        try {
            setIsUpdatingStatus(true);

            const updatedTicket = await ticketService.updateTicketStatus(
                ticket.id,
                status
            );

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        status: updatedTicket.status,
                        updatedAt: updatedTicket.updatedAt,
                    }
                    : current
            );

            toast.success("Ticket status updated successfully.");
        } catch {
            console.error("Status update failed.");
            toast.error("Unable to update ticket status. Please try again.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handlePriorityChange = async (priority: TicketPriority) => {
        if (!ticket || isUpdatingPriority) return;

        try {
            setIsUpdatingPriority(true);

            const updatedTicket = await ticketService.updateTicketPriority(
                ticket.id,
                priority
            );

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        priority: updatedTicket.priority,
                        updatedAt: updatedTicket.updatedAt,
                    }
                    : current
            );

            toast.success("Ticket priority updated successfully.");
        } catch {
            console.error("Priority update failed.");
            toast.error("Unable to update priority. Please try again.");
        } finally {
            setIsUpdatingPriority(false);
        }
    };

    const handleAgentAssignment = async (agentId: string) => {
        if (!ticket || isAssigning) return;

        try {
            setIsAssigning(true);

            const updatedTicket = await ticketService.assignTicket(
                ticket.id,
                agentId || null
            );

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        assignedAgentId: updatedTicket.assignedAgentId,
                        assignedAgent: updatedTicket.assignedAgent,
                        updatedAt: updatedTicket.updatedAt,
                    }
                    : current
            );

            toast.success(
                agentId
                    ? "Agent assigned successfully."
                    : "Agent unassigned successfully."
            );
        } catch {
            console.error("Agent assignment failed.");
            toast.error("Unable to update agent assignment. Please try again.");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleAddComment = async (content: string) => {
        if (!ticket) return;

        try {
            const newComment = await ticketService.addComment(
                ticket.id,
                content
            );

            setTicket((current) =>
                current
                    ? {
                        ...current,
                        comments: [...(current.comments ?? []), newComment],
                    }
                    : current
            );

            toast.success("Comment posted successfully.");
        } catch (error) {
            console.error("Comment submission failed.");
            toast.error("Unable to post comment. Please try again.");

            throw error;
        }
    };

    if (isLoading && id) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-sm text-gray-500">Loading ticket...</p>
            </div>
        );
    }

    if (displayError || !ticket) {
        return (
            <div className="space-y-4">
                <Link
                    to={ticketListPath}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    Back to tickets
                </Link>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {displayError || "Ticket not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page navigation */}
            <Link
                to={ticketListPath}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
                <ArrowLeft size={16} />
                Back to tickets
            </Link>
            {/* Ticket heading */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {ticket.ticketNumber}
                    </span>

                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {ticket.status.replace("_", " ")}
                        </span>

                        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                            {ticket.priority}
                        </span>
                    </div>
                </div>

                <h1 className="mt-5 break-words text-xl font-bold text-slate-900 sm:text-2xl">
                    {ticket.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Ticket details and issue information
                </p>
            </div>

            {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                <>
                    <div className="mt-5">
                        <label
                            htmlFor="ticket-status"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Update status
                        </label>

                        <select
                            id="ticket-status"
                            value={ticket.status}
                            disabled={isUpdatingStatus || ticket.status === "CLOSED"}
                            onChange={(e) =>
                                handleStatusChange(e.target.value as TicketStatus)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value={ticket.status} disabled>
                                {ticket.status.replace("_", " ")} (Current)
                            </option>

                            {ticket.status === "OPEN" && (
                                <option value="IN_PROGRESS">In Progress</option>
                            )}

                            {ticket.status === "IN_PROGRESS" && (
                                <option value="RESOLVED">Resolved</option>
                            )}

                            {ticket.status === "RESOLVED" && (
                                <>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="CLOSED">Closed</option>
                                </>
                            )}
                        </select>

                        {isUpdatingStatus && (
                            <p className="mt-2 text-xs text-gray-500">
                                Updating status...
                            </p>
                        )}

                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="ticket-priority"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Update priority
                        </label>

                        <select
                            id="ticket-priority"
                            value={ticket.priority}
                            disabled={isUpdatingPriority || ticket.status === "CLOSED"}
                            onChange={(e) =>
                                handlePriorityChange(e.target.value as TicketPriority)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>

                        {isUpdatingPriority && (
                            <p className="mt-2 text-xs text-gray-500">
                                Updating priority...
                            </p>
                        )}

                    </div>
                </>
            )}

            {user?.role === "ADMIN" && (
                <div>
                    <label
                        htmlFor="assigned-agent"
                        className="mb-2 block text-sm font-medium text-gray-600"
                    >
                        Assigned Agent
                    </label>

                    <select
                        id="assigned-agent"
                        value={ticket.assignedAgentId ?? ""}
                        onChange={(e) => handleAgentAssignment(e.target.value)}
                        disabled={
                            isLoadingAgents ||
                            isAssigning ||
                            ticket.status === "CLOSED"
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">Unassigned</option>

                        {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name} ({agent.email})
                            </option>
                        ))}
                    </select>

                    {isLoadingAgents && (
                        <p className="mt-1 text-xs text-gray-500">Loading agents...</p>
                    )}

                    {isAssigning && (
                        <p className="mt-1 text-xs text-gray-500">Updating assignment...</p>
                    )}


                </div>
            )}

            {/* Main content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Description */}
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-base font-semibold text-gray-900">
                            Description
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                            {ticket.description}
                        </p>
                    </section>
                </div>

                {/* Ticket information */}
                <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-base font-semibold text-gray-900">
                        Ticket information
                    </h2>

                    <div className="mt-5 space-y-5">

                        <div className="flex items-start gap-3">
                            <Tag size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {ticket.category}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {ticket.customer?.name ?? "Unknown customer"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {ticket.customer?.email ?? ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Assigned agent</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {ticket.assignedAgent?.name ?? "Unassigned"}
                                </p>
                                {ticket.assignedAgent?.email && (
                                    <p className="text-xs text-gray-500">
                                        {ticket.assignedAgent.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {formatDate(ticket.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock size={18} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Last updated</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {formatDate(ticket.updatedAt)}
                                </p>
                            </div>
                        </div>

                    </div>
                </aside>

                {ticket && user && (
                    <TicketConversation
                        comments={ticket.comments ?? []}
                        currentUserId={user.id}
                        onAddComment={handleAddComment}
                    />
                )}

                {ticket && (
                    <TicketActivity
                        history={ticket.ticketHistory ?? []}
                    />
                )}
            </div>
        </div>
    );
};

export default TicketDetailsPage;
