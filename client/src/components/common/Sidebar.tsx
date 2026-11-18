
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCircle,
} from "lucide-react";

import type { UserRole } from "../../types/auth.types";

interface SidebarProps {
  role: UserRole;
  onNavigate: () => void;
}

const navigation = {
  ADMIN: [
    {
      label: "Overview",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "All Tickets",
      path: "/admin/tickets",
      icon: Ticket,
    },
    {
      label: "Agent Management",
      path: "/admin/agents",
      icon: Users,
    },
    {
      label: "Profile",
      path: "/admin/profile",
      icon: UserCircle,
    },
  ],

  AGENT: [
    {
      label: "Overview",
      path: "/agent/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Tickets",
      path: "/agent/tickets",
      icon: Ticket,
    },
    {
      label: "Profile",
      path: "/agent/profile",
      icon: UserCircle,
    },
  ],

  CUSTOMER: [
    {
      label: "Overview",
      path: "/customer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Tickets",
      path: "/customer/tickets",
      icon: Ticket,
    },
    {
      label: "Create Ticket",
      path: "/customer/tickets/new",
      icon: Ticket,
    },
    {
      label: "Profile",
      path: "/customer/profile",
      icon: UserCircle,
    },
  ],
};

const Sidebar = ({ role, onNavigate }: SidebarProps) => {
  const items = navigation[role];

  return (
    <nav className="space-y-1 px-3 py-6">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Workspace
      </p>

      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-950/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;
