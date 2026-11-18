import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Ticket,
  Clock3,
  CircleDot,
  RefreshCw,
  AlertCircle,
  Mail,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import agentService from "../../services/agent.service";
import type { Agent } from "../../types/agent.types";

const AgentManagementPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAgentId, setUpdatingAgentId] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await agentService.getAgents();
      setAgents(data);
    } catch {
      console.error("Failed to load agents.");
      setError("Unable to load agents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    agentService
      .getAgents()
      .then((data) => {
        if (active) setAgents(data);
      })
      .catch(() => {
        console.error("Failed to load agents.");
        if (active) setError("Unable to load agents. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAgentStatusChange = async (agent: Agent) => {
    const nextStatus = !agent.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus ? "activate" : "deactivate"
      } ${agent.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingAgentId(agent.id);

      const updated = await agentService.updateAgentStatus(
        agent.id,
        nextStatus
      );

      setAgents((currentAgents) =>
        currentAgents.map((item) =>
          item.id === updated.id
            ? { ...item, isActive: updated.isActive }
            : item
        )
      );
      toast.success(
        `${agent.name} ${nextStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch {
      console.error("Failed to update agent status.");
      toast.error("Unable to update agent status. Please try again.");
    } finally {
      setUpdatingAgentId(null);
    }
  };

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return agents;

    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query)
    );
  }, [agents, search]);

  const totalAssignedTickets = agents.reduce(
    (total, agent) => total + agent.workload.total,
    0
  );

  const totalInProgress = agents.reduce(
    (total, agent) => total + agent.workload.byStatus.IN_PROGRESS,
    0
  );

  const totalOpen = agents.reduce(
    (total, agent) => total + agent.workload.byStatus.OPEN,
    0
  );

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-blue-600"
            size={28}
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading agents...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto text-red-500" size={32} />
        <p className="mt-3 font-semibold text-slate-800">{error}</p>

        <button
          onClick={fetchAgents}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Agent Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View your support team and monitor their workloads.
          </p>
        </div>

        <button
          onClick={fetchAgents}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Agents"
          value={agents.length}
          icon={<Users size={20} />}
          color="blue"
        />

        <SummaryCard
          title="Assigned Tickets"
          value={totalAssignedTickets}
          icon={<Ticket size={20} />}
          color="indigo"
        />

        <SummaryCard
          title="Open Tickets"
          value={totalOpen}
          icon={<CircleDot size={20} />}
          color="amber"
        />

        <SummaryCard
          title="In Progress"
          value={totalInProgress}
          icon={<Clock3 size={20} />}
          color="emerald"
        />
      </div>

      {/* Agent directory */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold text-slate-800">
              Support Team
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {filteredAgents.length} of {agents.length} agents
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search agents by name or email"
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="mx-auto text-slate-300" size={36} />
            <p className="mt-3 font-medium text-slate-700">
              No agents found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
              >
                {/* Agent identity */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {agent.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {agent.name}
                    </h3>

                    <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                      <Mail size={14} className="shrink-0" />
                      {agent.email}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      Joined{" "}
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      agent.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>

                  <button
                    onClick={() => handleAgentStatusChange(agent)}
                    disabled={updatingAgentId !== null}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      agent.isActive
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {updatingAgentId === agent.id
                      ? "Updating..."
                      : agent.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>

                {/* Workload */}
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Total assigned tickets
                    </span>
                    <span className="text-xl font-bold text-slate-800">
                      {agent.workload.total}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <WorkloadItem
                      label="Open"
                      count={agent.workload.byStatus.OPEN}
                      color="text-blue-600"
                    />

                    <WorkloadItem
                      label="In Progress"
                      count={agent.workload.byStatus.IN_PROGRESS}
                      color="text-amber-600"
                    />

                    <WorkloadItem
                      label="Resolved"
                      count={agent.workload.byStatus.RESOLVED}
                      color="text-emerald-600"
                    />

                    <WorkloadItem
                      label="Closed"
                      count={agent.workload.byStatus.CLOSED}
                      color="text-slate-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "amber" | "emerald";
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

const SummaryCard = ({
  title,
  value,
  icon,
  color,
}: SummaryCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{title}</p>
      <div className={`rounded-lg p-2 ${colorStyles[color]}`}>
        {icon}
      </div>
    </div>
    <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

interface WorkloadItemProps {
  label: string;
  count: number;
  color: string;
}

const WorkloadItem = ({ label, count, color }: WorkloadItemProps) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className={`mt-1 text-lg font-semibold ${color}`}>{count}</p>
  </div>
);

export default AgentManagementPage;