
import { useState, type FormEvent } from "react";
import { Send, MessageSquare, User } from "lucide-react";
import type { Comment } from "../../types/comment.types";
import { ShimmerLabel } from "../common/LoadingShimmer";

interface TicketConversationProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (content: string) => Promise<void>;
}

const formatCommentDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const TicketConversation = ({
  comments,
  currentUserId,
  onAddComment,
}: TicketConversationProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      await onAddComment(trimmedContent);
      setContent("");
    } catch {
      console.error("Comment submission failed.");
      setError("Unable to send your reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Conversation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Communicate with everyone involved in this ticket.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      {/* Messages */}
      <div className="max-h-[520px] space-y-5 overflow-y-auto rounded-lg bg-slate-50/70 p-3 sm:p-4">
        {comments.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-white p-3 text-slate-400 shadow-sm">
              <MessageSquare size={23} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No replies yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Start the conversation by sending a reply.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = comment.user.id === currentUserId;

            return (
              <div
                key={comment.id}
                className={`flex items-end gap-2 sm:gap-3 ${
                  isOwnComment ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isOwnComment
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                  aria-label={`${comment.user.name}'s avatar`}
                >
                  {getInitials(comment.user.name) || <User size={15} />}
                </div>

                <div
                  className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${
                    isOwnComment ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`mb-1 flex flex-wrap items-center gap-2 ${
                      isOwnComment ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {isOwnComment ? "You" : comment.user.name}
                    </span>

                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
                      {comment.user.role}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-left ${
                      isOwnComment
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {comment.message}
                    </p>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {formatCommentDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={handleSubmit} className="mt-5">
        <label
          htmlFor="ticket-reply"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Write a reply
        </label>

        <textarea
          id="ticket-reply"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Type your message here..."
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
          className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50"
        />

        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {content.length}/2000 characters
          </span>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
            {isSubmitting ? (
              <ShimmerLabel label="Sending reply" className="h-4 w-16" />
            ) : (
              "Send Reply"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default TicketConversation;
