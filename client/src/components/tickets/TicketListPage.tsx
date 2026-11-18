
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Ticket as TicketIcon,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { ticketService } from "../../services/ticket.service";

import type {
  Ticket,
  TicketFilters,
  TicketPagination,
} from "../../types/ticket.types";

import type {
  TicketStatus,
  TicketPriority,
} from "../../types/dashboard.types";

import TicketStatusBadge from "../../components/dashboard/TicketStatusBadge";
import PriorityBadge from "../../components/tickets/PriorityBadge";


interface TicketCardProps {
  ticket: Ticket;
  href: string;
}

const TicketCard = ({ ticket, href }: TicketCardProps) => (
  <Link
    to={href}
    className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-blue-600">
          {ticket.ticketNumber}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">
          {ticket.title}
        </h3>
      </div>

      <TicketStatusBadge status={ticket.status} />
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      <PriorityBadge priority={ticket.priority} />

      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
        {ticket.category}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
      <div className="min-w-0">
        <p className="text-xs text-slate-400">Customer</p>
        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {ticket.customer?.name ?? "—"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">Assigned Agent</p>
        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {ticket.assignedAgent?.name ?? "Unassigned"}
        </p>
      </div>
    </div>

    <div className="mt-3 flex justify-between gap-3 text-xs text-slate-400">
      <span>
        Created: {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
      </span>
      <span>
        Updated: {new Date(ticket.updatedAt).toLocaleDateString("en-IN")}
      </span>
    </div>
  </Link>
);


const TicketListPage = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] =
    useState<TicketPagination | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async (notifyOnSuccess = false) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await ticketService.getTickets(filters);

      setTickets(response.data);
      setPagination(response.pagination);
      if (notifyOnSuccess) {
        toast.success("Tickets refreshed.");
      }
    } catch {
      console.error("Failed to fetch tickets.");
      const message = "Unable to load tickets. Please try again.";
      setError(message);
      toast.error(message, {
        duration: 8000,
        action: {
          label: "Retry",
          onClick: () => {
            void fetchTickets();
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTicketUrl = (ticketId: string) => {
    if (user?.role === "ADMIN") return `/admin/tickets/${ticketId}`;
    if (user?.role === "AGENT") return `/agent/tickets/${ticketId}`;

    return `/customer/tickets/${ticketId}`;
  };

  useEffect(() => {
    void fetchTickets();
    // fetchTickets reads filters; a filter change should trigger a new request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters((current) => ({
      ...current,
      page: 1,
      q: search.trim() || undefined,
      status: (status || undefined) as TicketStatus | undefined,
      category: category || undefined,
      priority: (priority || undefined) as TicketPriority | undefined,
    }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategory("");

    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      limit,
    }));
  };
  const pageTitle =
    user?.role === "ADMIN"
      ? "All Tickets"
      : user?.role === "AGENT"
        ? "My Assigned Tickets"
        : "My Support Tickets";

  const getPageNumbers = () => {
    if (!pagination) return [];

    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {pageTitle}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage support requests.
          </p>
        </div>

        <button
          onClick={() => {
            void fetchTickets(true);
          }}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              aria-label="Search tickets"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleApplyFilters();
                }
              }}
              placeholder="Search tickets..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              aria-label="Filter by priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="General">General</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              aria-label="Sort tickets"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split("-");

                setFilters((current) => ({
                  ...current,
                  page: 1,
                  sortBy: sortBy as TicketFilters["sortBy"],
                  sortOrder: sortOrder as TicketFilters["sortOrder"],
                }));
              }}
              className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="updatedAt-desc">Recently updated</option>
              <option value="priority-desc">Priority</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>

            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Ticket table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold text-slate-800">
              Tickets
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {pagination
                ? `${pagination.total} tickets found`
                : "Support requests"}
            </p>
          </div>

          <TicketIcon size={20} className="text-slate-400" />
        </div>

        <div className="overflow-x-auto">

          {/* Mobile ticket cards */}
          <div className="space-y-3 p-3 lg:hidden">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-slate-200 p-4"
                >
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-4 h-5 w-24 rounded-full bg-slate-200" />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="h-8 rounded bg-slate-100" />
                    <div className="h-8 rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  href={getTicketUrl(ticket.id)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <TicketIcon
                  size={32}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-medium text-slate-700">
                  {error ? "Unable to load tickets" : "No tickets found"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {error
                    ? "Please try refreshing the page."
                    : "Try changing your search or filters."}
                </p>
              </div>
            )}
          </div>

          {/* Desktop ticket table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">Ticket ID</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Assigned Agent</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="whitespace-nowrap px-5 py-4">Created</th>
                  <th className="whitespace-nowrap px-5 py-4">Last Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          to={getTicketUrl(ticket.id)}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>

                      <td className="min-w-52 px-5 py-4 font-medium text-slate-800">
                        {ticket.title}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {ticket.customer?.name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ticket.customer?.email ?? ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {ticket.assignedAgent?.name ?? "Unassigned"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ticket.assignedAgent?.email ?? ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {ticket.category}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <TicketStatusBadge status={ticket.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {new Date(ticket.updatedAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      {error ? "Unable to load tickets." : "No tickets found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">

            {/* Results information and page size */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
                {" · "}
                {pagination.total} results
              </p>

              <div className="relative">
                <select
                  value={filters.limit}
                  onChange={(event) =>
                    handlePageSizeChange(Number(event.target.value))
                  }
                  disabled={isLoading}
                  className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-2 pr-8 text-sm text-slate-600 outline-none focus:border-blue-500"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">

              <button
                disabled={!pagination.hasPreviousPage || isLoading}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${pagination.page === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketListPage;
