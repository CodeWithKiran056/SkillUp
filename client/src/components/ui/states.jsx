import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

function LoadingState({ className, label = "Loading..." }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 text-sm text-[var(--text-secondary)]",
        className
      )}
    >
      <Loader2 className="animate-spin text-[var(--accent)]" size={18} />
      {label}
    </div>
  );
}

function EmptyState({ action, className, description, icon: Icon = Inbox, title = "Nothing here yet" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-8 text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function ErrorState({
  actionLabel,
  className,
  description = "Something went wrong. Please try again.",
  onAction,
  title = "Unable to load",
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(240,95,100,0.28)] bg-[rgba(240,95,100,0.09)] p-5",
        className
      )}
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-[var(--error)]" size={19} />
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          {actionLabel && (
            <Button className="mt-4" onClick={onAction} size="sm" variant="secondary">
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={cn("skillup-skeleton rounded-lg", className)} />;
}

export { EmptyState, ErrorState, LoadingState, Skeleton };
