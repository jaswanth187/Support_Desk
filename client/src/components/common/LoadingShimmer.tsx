interface ShimmerBlockProps {
  className: string;
}

export const ShimmerBlock = ({ className }: ShimmerBlockProps) => (
  <span
    aria-hidden="true"
    className={`block animate-pulse rounded bg-slate-200 ${className}`}
  />
);

interface ShimmerLabelProps {
  label: string;
  className?: string;
}

export const ShimmerLabel = ({
  label,
  className = "h-4 w-20",
}: ShimmerLabelProps) => (
  <span
    role="status"
    aria-label={label}
    className="inline-flex items-center"
  >
    <span
      aria-hidden="true"
      className={`animate-pulse rounded bg-current/30 ${className}`}
    />
  </span>
);
