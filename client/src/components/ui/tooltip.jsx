import { cn } from "../../lib/utils";

function Tooltip({ children, content, className, side = "top" }) {
  const sideClass =
    side === "bottom"
      ? "top-full mt-2"
      : side === "left"
        ? "right-full mr-2 top-1/2 -translate-y-1/2"
        : side === "right"
          ? "left-full ml-2 top-1/2 -translate-y-1/2"
          : "bottom-full mb-2";

  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border-strong)] bg-[var(--surface-3)] px-2 py-1 text-xs text-[var(--text-primary)] opacity-0 shadow-[var(--shadow-md)] transition-opacity duration-150 group-hover/tooltip:opacity-100",
          sideClass
        )}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}

export { Tooltip };
