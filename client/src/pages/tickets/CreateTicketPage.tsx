
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import {
  createTicketSchema,
  type CreateTicketFormData,
} from "../../schemas/ticket.schema";

import { ticketService } from "../../services/ticket.service";
import { ShimmerLabel } from "../../components/common/LoadingShimmer";

const CreateTicketPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      const ticket = await ticketService.createTicket(data);

      toast.success("Ticket created successfully!");

      navigate(`/customer/tickets/${ticket.id}`);
    } catch {
      console.error("Ticket creation failed.");

      const message = "Unable to create ticket. Please try again.";

      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <Link
          to="/customer/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          Create Support Ticket
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Describe your issue and our support team will assist you.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        {/* Subject */}
        <div>
          <label
            htmlFor="ticket-title"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Subject
          </label>

          <input
            id="ticket-title"
            {...register("title")}
            placeholder="Briefly describe your issue"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-500">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="ticket-description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="ticket-description"
            {...register("description")}
            rows={6}
            placeholder="Explain your issue in detail..."
            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div>
            <label
              htmlFor="ticket-category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <div className="relative">
              <select
                id="ticket-category"
                {...register("category")}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select category</option>
                <option value="Account">Account</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="General">General</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
              />
            </div>

            {errors.category && (
              <p className="mt-1 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ticket-priority"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>

            <div className="relative">
              <select
                id="ticket-priority"
                {...register("priority")}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
              />
            </div>

            {errors.priority && (
              <p className="mt-1 text-sm text-red-500">
                {errors.priority.message}
              </p>
            )}
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end border-t border-slate-100 pt-5">

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />

            {isSubmitting ? (
              <ShimmerLabel label="Creating ticket" className="h-4 w-20" />
            ) : (
              "Submit Ticket"
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default CreateTicketPage;
