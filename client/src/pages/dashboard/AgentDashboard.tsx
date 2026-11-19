
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import dashboardService from "../../services/dashboard.service";

import type {
  TicketStatus,
  TicketPriority,
} from "../../types/dashboard.types";

import type { CustomerDashboardData } from "../../types/customer-dashboard.types";

import StatCard from "../../components/dashboard/StatCard";
import TicketStatusBadge from "../../components/dashboard/TicketStatusBadge";
import { ShimmerLabel } from "../../components/common/LoadingShimmer";
import PriorityBadge from "../../components/tickets/PriorityBadge";

import { useAuth } from "../../context/AuthContext";

const AgentDashboard = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<CustomerDashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");
      setIsRefreshing(true);

      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch {
      console.error("Agent dashboard refresh failed.");
      setError("Unable to refresh dashboard. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    dashboardService
      .getDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        console.error("Agent dashboard loading failed.");
        if (active) setError("Unable to load dashboard. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const getStatusCount = (status: TicketStatus) =>
    dashboard?.statusBreakdown.find(
      (item) => item.status === status
    )?.count ?? 0;

  const getPriorityCount = (priority: TicketPriority) =>
    dashboard?.priorityBreakdown.find(
      (item) => item.priority === priority
    )?.count ?? 0;

  const stats = [
    {
      title: "Assigned Tickets",
      value: dashboard?.totalTickets ?? 0,
      description: "Tickets assigned to you",
      icon: Ticket,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
    },
    {
      title: "Open Tickets",
      value: getStatusCount("OPEN"),
      description: "Awaiting your attention",
      icon: AlertCircle,
      iconColor: "text-indigo-600",
      iconBackground: "bg-indigo-50",
    },
    {
      title: "In Progress",
      value: getStatusCount("IN_PROGRESS"),
      description: "Currently being handled",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBackground: "bg-amber-50",
    },
    {
      title: "Resolved",
      value: getStatusCount("RESOLVED"),
      description: "Successfully resolved",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-50",
    },
    {
      title: "Closed",
      value: getStatusCount("CLOSED"),
      description: "Completed tickets",
      icon: CheckCircle,
      iconColor: "text-slate-600",
      iconBackground: "bg-slate-100",
    },
  ];

  const priorities: TicketPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ];

  if (isLoading) {
    return (
      <div
        className="space-y-8 animate-pulse"
        role="status"
        aria-busy="true"
        aria-label="Loading agent dashboard"
      >
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-5 h-8 w-16 rounded bg-slate-200" />
              <div className="mt-4 h-3 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="h-36 rounded-xl border border-slate-200 bg-white" />
        <div className="h-72 rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle
          className="mx-auto text-red-500"
          size={32}
        />

        <p className="mt-3 font-semibold text-slate-800">
          {error || "Dashboard data unavailable"}
        </p>

        <button
          onClick={fetchDashboard}
          disabled={isRefreshing}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {isRefreshing ? (
            <ShimmerLabel label="Retrying dashboard request" className="h-4 w-16" />
          ) : (
            "Try again"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name ?? "Agent"}!
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your assigned tickets and customer requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchDashboard}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? (
              <ShimmerLabel label="Refreshing dashboard" className="h-4 w-16" />
            ) : (
              <>
                <RefreshCw size={16} />
                Refresh
              </>
            )}
          </button>

          <Link
            to="/agent/tickets"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Ticket size={18} />
            My Tickets
          </Link>
        </div>
      </div>

      {/* Refresh error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBackground={stat.iconBackground}
          />
        ))}
      </div>

      {/* Priority Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Priority Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Distribution of your assigned tickets by priority.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {priorities.map((priority) => (
            <div
              key={priority}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <PriorityBadge priority={priority} />

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {getPriorityCount(priority)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {priority === "URGENT"
                  ? "Needs immediate attention"
                  : priority === "HIGH"
                    ? "High attention"
                    : priority === "MEDIUM"
                      ? "Normal attention"
                      : "Low attention"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assigned Tickets */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Assigned Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest assigned customer requests.
            </p>
          </div>

          <Ticket size={20} className="text-slate-400" />
        </div>

        {dashboard.recentTickets.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {dashboard.recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/agent/tickets/${ticket.id}`}
                  className="block p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-600">
                        {ticket.ticketNumber}
                      </p>

                      <h3 className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {ticket.title}
                      </h3>
                    </div>

                    <ArrowRight
                      size={17}
                      className="mt-1 shrink-0 text-slate-400"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Customer: {ticket.customer.name}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Created{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Ticket ID</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dashboard.recentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          to={`/agent/tickets/${ticket.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>

                      <td className="min-w-48 px-5 py-4 font-medium text-slate-800">
                        {ticket.title}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {ticket.customer.name}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <Ticket
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              No assigned tickets
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tickets assigned to you will appear here.
            </p>

            <Link
              to="/agent/tickets"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View my tickets
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>

      {/* View all */}
      <div className="flex justify-end">
        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          View all assigned tickets
          <ArrowRight size={16} />
        </Link>
      </div>

    </div>
  );
};

export default AgentDashboard;
