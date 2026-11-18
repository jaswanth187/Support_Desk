
const DashboardCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-800">
      {title}
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      {description}
    </p>
  </div>
);

export const AdminDashboard = () => (
  <DashboardCard
    title="Admin Overview"
    description="Monitor tickets, agents and customer support operations."
  />
);

export const AgentDashboard = () => (
  <DashboardCard
    title="Agent Overview"
    description="Manage your assigned tickets and customer requests."
  />
);

export const CustomerDashboard = () => (
  <DashboardCard
    title="Customer Overview"
    description="Track your support requests and get help."
  />
);

export const LoginPage = () => null;
export const RegisterPage = () => null;

export const UnauthorizedPage = () => (
  <DashboardCard
    title="403 - Unauthorized"
    description="You do not have permission to access this page."
  />
);

export const NotFoundPage = () => (
  <DashboardCard
    title="404 - Page Not Found"
    description="The page you're looking for does not exist."
  />
);

export const SectionPlaceholder = ({
  title,
}: {
  title: string;
}) => (
  <div>
    <p className="text-sm text-slate-500">Workspace / {title}</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">
      {title}
    </h1>
    <p className="mt-2 text-slate-500">
      This module will be implemented in an upcoming step.
    </p>
  </div>
);