import { Activity, ArrowRight, CircleDot, Flag, UserRound } from "lucide-react";

import type { TicketHistory } from "../../types/ticket-history.types";

interface TicketActivityProps {
  history: TicketHistory[];
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatValue = (value: string) => {
  return value.replaceAll("_", " ");
};

const getActivityDetails = (item: TicketHistory) => {
  if (item.oldStatus !== null && item.newStatus !== null) {
    return {
      title: "Status updated",
      from: formatValue(item.oldStatus),
      to: formatValue(item.newStatus),
      icon: CircleDot,
      color: "text-blue-600",
      background: "bg-blue-50",
    };
  }

  if (item.oldPriority !== null && item.newPriority !== null) {
    return {
      title: "Priority updated",
      from: formatValue(item.oldPriority),
      to: formatValue(item.newPriority),
      icon: Flag,
      color: "text-amber-600",
      background: "bg-amber-50",
    };
  }

  // Detect assignment changes using the IDs, not relation values.
  // A relation may be null if an agent was deleted.
  if (
    item.oldAssignedAgentId !== item.newAssignedAgentId
  ) {
    const previousAgent =
      item.oldAssignedAgent?.name ??
      (item.oldAssignedAgentId ? "Former agent" : "Unassigned");

    const nextAgent =
      item.newAssignedAgent?.name ??
      (item.newAssignedAgentId ? "Former agent" : "Unassigned");

    return {
      title:
        item.newAssignedAgentId === null
          ? "Agent unassigned"
          : item.oldAssignedAgentId === null
            ? "Agent assigned"
            : "Agent reassigned",
      from: previousAgent,
      to: nextAgent,
      icon: UserRound,
      color: "text-violet-600",
      background: "bg-violet-50",
    };
  }

  return {
    title: "Ticket updated",
    from: null,
    to: null,
    icon: Activity,
    color: "text-slate-600",
    background: "bg-slate-100",
  };
};

const TicketActivity = ({ history }: TicketActivityProps) => {
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-slate-900">
          Activity Timeline
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          A record of changes made to this ticket.
        </p>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="py-10 text-center">
          <Activity className="mx-auto mb-3 h-9 w-9 text-slate-300" />

          <p className="text-sm text-slate-500">
            No activity recorded yet.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {sortedHistory.map((item, index) => {
            const details = getActivityDetails(item);
            const Icon = details.icon;

            const isLast = index === sortedHistory.length - 1;

            return (
              <div key={item.id} className="relative flex gap-3 pb-7 last:pb-0">
                {!isLast && (
                  <div className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200" />
                )}

                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${details.background}`}
                >
                  <Icon className={`h-4 w-4 ${details.color}`} />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {details.title}
                  </h3>

                  {details.from !== null && details.to !== null ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="max-w-full break-words rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                        {details.from}
                      </span>

                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                      <span className="max-w-full break-words rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">
                        {details.to}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Ticket information was updated.
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-600">
                    By{" "}
                    <span className="font-medium text-slate-800">
                      {item.changedBy.name}
                    </span>
                    {" · "}
                    {item.changedBy.role}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TicketActivity;