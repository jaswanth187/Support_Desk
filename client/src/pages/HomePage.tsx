import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  MessageSquareText,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <div className="min-h-screen bg-white text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-600 p-2 text-white">
            <Headphones size={22} />
          </span>
          <span className="text-lg font-bold tracking-tight">SupportDesk</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="#features"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-blue-600 sm:inline"
          >
            Features
          </a>
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>

    <main>
      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Support that stays organized
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Every request has a clear path forward.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              SupportDesk brings customer requests and team follow-up into one
              shared workspace. Submit a ticket, see its progress, and keep
              every conversation connected.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Create an account
                <ArrowRight size={17} />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
              >
                Explore how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                One place for every ticket
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Role-based workspaces
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div className="relative rounded-2xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/30 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Support overview
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your team, in sync
                  </p>
                </div>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Ticket size={19} />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <OverviewStat label="Open" value="12" color="text-blue-600" />
                <OverviewStat
                  label="In progress"
                  value="08"
                  color="text-amber-600"
                />
                <OverviewStat
                  label="Resolved"
                  value="24"
                  color="text-emerald-600"
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    Recent requests
                  </p>
                  <span className="text-xs font-medium text-slate-400">
                    Ticket activity
                  </span>
                </div>
                <TicketPreview
                  id="SD-2048"
                  title="Unable to update account details"
                  status="In progress"
                  statusClass="bg-amber-50 text-amber-700"
                />
                <TicketPreview
                  id="SD-2047"
                  title="Question about an open request"
                  status="Open"
                  statusClass="bg-blue-50 text-blue-700"
                />
                <TicketPreview
                  id="SD-2046"
                  title="Payment confirmation"
                  status="Resolved"
                  statusClass="bg-emerald-50 text-emerald-700"
                />
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                  <MessageSquareText size={17} />
                </span>
                <p className="text-xs leading-5 text-slate-500">
                  Conversations and updates stay attached to each request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            A clearer support workflow
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The right details, right where you need them.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Customers, agents, and administrators each get tools that help
            support move forward without losing context.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Ticket size={21} />}
            title="Track every request"
            description="Create support tickets and follow their status from the first message through resolution."
          />
          <FeatureCard
            icon={<Users size={21} />}
            title="Keep teams coordinated"
            description="Agents can manage assigned work, update progress, and keep replies together with each ticket."
          />
          <FeatureCard
            icon={<Clock3 size={21} />}
            title="Stay on top of work"
            description="Administrators can review workloads, manage agent access, and see support activity at a glance."
          />
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              From a question to a resolution.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              A shared ticket history gives everyone a useful view of what was
              asked, what has changed, and what still needs attention.
            </p>
          </div>
          <div className="space-y-5">
            <Step number="01" title="Create a ticket">
              Describe the issue and include the details your support team needs.
            </Step>
            <Step number="02" title="Follow progress">
              Check updates, status changes, and replies in one place.
            </Step>
            <Step number="03" title="Close the loop">
              Keep the conversation connected until the request is resolved.
            </Step>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-blue-600 px-7 py-9 text-white sm:px-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">Make support easier to follow.</h2>
            <p className="mt-2 text-sm text-blue-100">
              Create an account to submit and track your support requests.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Get started
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>

    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="font-semibold text-slate-700">SupportDesk</span>
        <span>Support requests, organized from start to finish.</span>
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in to your workspace
        </Link>
      </div>
    </footer>
  </div>
);

const OverviewStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
  </div>
);

const TicketPreview = ({
  id,
  title,
  status,
  statusClass,
}: {
  id: string;
  title: string;
  status: string;
  statusClass: string;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-blue-600">{id}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-800">
        {title}
      </p>
    </div>
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
    >
      {status}
    </span>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
      {icon}
    </span>
    <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 leading-6 text-slate-600">{description}</p>
  </article>
);

const Step = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: string;
}) => (
  <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
    <span className="text-sm font-bold text-blue-600">{number}</span>
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  </div>
);

export default HomePage;
