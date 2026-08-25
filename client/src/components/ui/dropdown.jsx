import { cn } from "../../lib/utils";

function Dropdown({ className, align = "right", trigger, children }) {
  return (
    <details className={cn("group relative", className)}>
      <summary className="list-none [&::-webkit-details-marker]:hidden">{trigger}</summary>
      <div
        className={cn(
          "absolute top-full z-40 mt-2 min-w-48 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] p-1 shadow-[var(--shadow-lg)]",
          align === "right" ? "right-0" : "left-0"
        )}
      >
        {children}
      </div>
    </details>
  );
}

function DropdownItem({ className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  );
}

function DropdownLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-3 py-2 text-xs font-medium uppercase text-[var(--text-muted)]", className)}
      {...props}
    />
  );
}

function DropdownSeparator({ className, ...props }) {
  return (
    <div
      className={cn("my-1 h-px bg-[var(--border-subtle)]", className)}
      {...props}
    />
  );
}

export { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator };
