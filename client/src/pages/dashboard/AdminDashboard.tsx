
import { useEffect, useState } from "react";

import {
  Ticket,
  CircleDot,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import dashboardService from "../../services/dashboard.service";
import { Link } from "react-router-dom";
import type {
  TicketStatus,
  TicketPriority,
} from "../../types/dashboard.types";
import type { AdminDashboardData } from "../../types/admin-dashboard.types";
import StatCard from "../../components/dashboard/StatCard";
import TicketStatusBadge from "../../components/dashboard/TicketStatusBadge";

const statusColors: Record<TicketStatus, string> = {
  OPEN: "#3B82F6",
  IN_PROGRESS: "#F59E0B",
  RESOLVED: "#10B981",
  CLOSED: "#64748B",
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: "#94A3B8",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#EF4444",
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");
      setIsRefreshing(true);

      const data = await dashboardService.getAdminDashboard();
      setDashboard(data);
    } catch {
      console.error("Dashboard refresh failed.");
      setError("Unable to refresh dashboard data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    dashboardService
      .getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        console.error("Dashboard loading failed.");
        if (active) setError("Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-blue-600"
            size={28}
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
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
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const getCount = (status: TicketStatus) =>
    dashboard.statusBreakdown.find(
      (item) => item.status === status
    )?.count ?? 0;

  const statusData = dashboard.statusBreakdown.map((item) => ({
    name: item.status.replaceAll("_", " "),
    value: item.count,
    color: statusColors[item.status],
  }));

  const priorityData = dashboard.priorityBreakdown.map((item) => ({
    name: item.priority,
    count: item.count,
    fill: priorityColors[item.priority],
  }));

  const agentData = (dashboard.agentWorkloads ?? []).map(
    (agent) => ({
      name: agent.name,
      tickets: agent.assignedTickets,
    })
  );

  return (
    <div className="space-y-8">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your support operations.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard()}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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

        <StatCard
          title="Total Tickets"
          value={dashboard.totalTickets}
          description="All support requests"
          icon={Ticket}
          iconColor="text-blue-600"
          iconBackground="bg-blue-50"
        />

        <StatCard
          title="Open Tickets"
          value={getCount("OPEN")}
          description="Awaiting attention"
          icon={CircleDot}
          iconColor="text-indigo-600"
          iconBackground="bg-indigo-50"
        />

        <StatCard
          title="In Progress"
          value={getCount("IN_PROGRESS")}
          description="Currently being handled"
          icon={Clock3}
          iconColor="text-amber-600"
          iconBackground="bg-amber-50"
        />

        <StatCard
          title="Resolved"
          value={getCount("RESOLVED")}
          description="Successfully resolved"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBackground="bg-emerald-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">

        {/* Status distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Ticket Status Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Breakdown of tickets by status
          </p>

          <div className="mt-5 h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {statusData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No ticket data available
              </div>
            )}
          </div>
        </div>

        {/* Priority distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Ticket Priority
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Distribution by ticket priority
          </p>

          <div className="mt-5 h-72">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Tickets"
                    radius={[6, 6, 0, 0]}
                  >
                    {priorityData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.fill}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No priority data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800">
            Recent Tickets
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest five support requests
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Ticket</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dashboard.recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      to={`/admin/tickets/${ticket.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {ticket.ticketNumber}
                    </Link>
                  </td>

                  <td className="min-w-48 px-5 py-4 font-medium text-slate-700">
                    {ticket.title}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <TicketStatusBadge status={ticket.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {ticket.priority}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {dashboard.recentTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent workloads */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800">
          Agent Workload
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Number of tickets assigned to each agent
        </p>

        <div className="mt-5"
        style={{ height: Math.max(220, agentData.length * 55) }} >
          {agentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                />

                <Tooltip />

                <Bar
                  dataKey="tickets"
                  name="Assigned tickets"
                  fill="#3B82F6"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No agent workload data available
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
