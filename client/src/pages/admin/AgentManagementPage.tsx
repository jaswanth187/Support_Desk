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
  UserPlus,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import agentService from "../../services/agent.service";
import type { Agent } from "../../types/agent.types";

const AgentManagementPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAgentId, setUpdatingAgentId] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    password: "",
  });

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

  const handleCreateAgent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsCreatingAgent(true);
      const created = await agentService.createAgent(newAgent);
      setAgents((currentAgents) => [
        {
          ...created,
          workload: {
            total: 0,
            byStatus: {
              OPEN: 0,
              IN_PROGRESS: 0,
              RESOLVED: 0,
              CLOSED: 0,
            },
          },
        },
        ...currentAgents,
      ]);
      setNewAgent({ name: "", email: "", password: "" });
      setIsCreateFormOpen(false);
      toast.success("Agent created successfully.");
    } catch (error: unknown) {
      console.error("Failed to create agent.");
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(
        message ?? "Unable to create agent. Check the details and try again."
      );
    } finally {
      setIsCreatingAgent(false);
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
    return <AgentManagementSkeleton />;
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isCreateFormOpen ? <X size={16} /> : <UserPlus size={16} />}
            {isCreateFormOpen ? "Cancel" : "Add Agent"}
          </button>
          <button
            onClick={fetchAgents}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {isCreateFormOpen && (
        <form
          onSubmit={handleCreateAgent}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800">Create an agent</h2>
          <p className="mt-1 text-sm text-slate-500">
            The new agent can sign in with the email and password below.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={newAgent.name}
                onChange={(event) =>
                  setNewAgent((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                maxLength={254}
                value={newAgent.email}
                onChange={(event) =>
                  setNewAgent((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Temporary password
              <input
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={newAgent.password}
                onChange={(event) =>
                  setNewAgent((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isCreatingAgent}
              aria-label={isCreatingAgent ? "Creating agent" : undefined}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingAgent ? (
                <span
                  aria-hidden="true"
                  className="block h-4 w-24 animate-pulse rounded bg-blue-300"
                />
              ) : (
                "Create Agent"
              )}
            </button>
          </div>
        </form>
      )}

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
                    {updatingAgentId === agent.id ? (
                      <>
                        <span className="sr-only">Updating agent status</span>
                        <span
                          aria-hidden="true"
                          className="block h-4 w-20 animate-pulse rounded bg-slate-200"
                        />
                      </>
                    ) : agent.isActive ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
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

const AgentManagementSkeleton = () => (
  <div
    className="space-y-8"
    role="status"
    aria-busy="true"
    aria-label="Loading agent management"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-10 animate-pulse rounded-lg bg-blue-50" />
          </div>
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="space-y-2">
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 sm:w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-blue-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-36 max-w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-48 max-w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="h-6 w-16 animate-pulse rounded-full bg-emerald-50" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
            </div>
            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                <div className="h-6 w-8 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-8 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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