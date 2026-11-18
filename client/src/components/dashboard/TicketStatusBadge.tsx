
import type { TicketStatus } from "../../types/dashboard.types";

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-600/10",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-600/10",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

const TicketStatusBadge = ({
  status,
}: {
  status: TicketStatus;
}) => {
  const label = status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
};

export default TicketStatusBadge;
