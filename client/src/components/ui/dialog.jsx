import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      onMouseDown={() => onOpenChange?.(false)}
    >
      <div onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

function DialogContent({ className, children, onClose, ...props }) {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 shadow-[var(--shadow-lg)]",
        className
      )}
      {...props}
    >
      {onClose && (
        <Button
          aria-label="Close dialog"
          className="float-right -mr-2 -mt-2"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X size={18} />
        </Button>
      )}
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-xl font-semibold text-[var(--text-primary)]", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm leading-6 text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return <div className={cn("mt-6 flex justify-end gap-3", className)} {...props} />;
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle };
