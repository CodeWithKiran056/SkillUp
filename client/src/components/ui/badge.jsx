import { cn } from "../../lib/utils";

const variants = {
  default:
    "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)]",
  accent:
    "border-[rgba(231,111,81,0.28)] bg-[var(--accent-muted)] text-[var(--accent)]",
  success:
    "border-[rgba(40,199,111,0.28)] bg-[rgba(40,199,111,0.12)] text-[var(--success)]",
  warning:
    "border-[rgba(246,183,60,0.28)] bg-[rgba(246,183,60,0.12)] text-[var(--warning)]",
  error:
    "border-[rgba(240,95,100,0.28)] bg-[rgba(240,95,100,0.12)] text-[var(--error)]",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
