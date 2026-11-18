
import type { TicketPriority } from "../../types/dashboard.types";

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

const PriorityBadge = ({
  priority,
}: {
  priority: TicketPriority;
}) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[priority]}`}
    >
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
};

export default PriorityBadge;
