
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Ticket,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import dashboardService from "../../services/dashboard.service";

import type {
  TicketStatus,
} from "../../types/dashboard.types";

import type { CustomerDashboardData } from "../../types/customer-dashboard.types";

import StatCard from "../../components/dashboard/StatCard";
import TicketStatusBadge from "../../components/dashboard/TicketStatusBadge";
import PriorityBadge from "../../components/tickets/PriorityBadge";

import { useAuth } from "../../context/AuthContext";

const CustomerDashboard = () => {
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
      console.error("Customer dashboard refresh failed.");
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
        console.error("Customer dashboard loading failed.");
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

  const stats = [
    {
      title: "Total Tickets",
      value: dashboard?.totalTickets ?? 0,
      description: "All your support requests",
      icon: Ticket,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
    },
    {
      title: "Open Tickets",
      value: getStatusCount("OPEN"),
      description: "Awaiting attention",
      icon: Clock,
      iconColor: "text-indigo-600",
      iconBackground: "bg-indigo-50",
    },
    {
      title: "In Progress",
      value: getStatusCount("IN_PROGRESS"),
      description: "Currently being handled",
      icon: AlertCircle,
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
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Try again
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
            Welcome, {user?.name ?? "Customer"}!
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your support requests and track their progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchDashboard}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/customer/tickets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Ticket
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Recent Tickets */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your latest support requests.
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
                  to={`/customer/tickets/${ticket.id}`}
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

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Assigned to:{" "}
                    <span className="font-medium text-slate-700">
                      {ticket.assignedAgent?.name ?? "Unassigned"}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
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
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Assigned Agent</th>
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
                          to={`/customer/tickets/${ticket.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>

                      <td className="min-w-48 px-5 py-4 font-medium text-slate-800">
                        {ticket.title}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <TicketStatusBadge status={ticket.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {ticket.assignedAgent?.name ?? "Unassigned"}
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
              No tickets to display
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your support requests will appear here.
            </p>

            <Link
              to="/customer/tickets/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              Create your first ticket
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* View all */}
      <div className="flex justify-end">
        <Link
          to="/customer/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          View all tickets
          <ArrowRight size={16} />
        </Link>
      </div>

    </div>
  );
};

export default CustomerDashboard;
