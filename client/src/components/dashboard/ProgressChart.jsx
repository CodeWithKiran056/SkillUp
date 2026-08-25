import { Flame, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui";

function ProgressChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--border-strong)]"
    >
      {/* Subtle accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent)]/6 blur-3xl"
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Learning analytics
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Weekly Progress
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Your study activity over the last seven days
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
          <Flame size={19} />
        </div>
      </div>

      {/* Empty State */}
      <div className="relative mt-8 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-1)]/50 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
          <BarChart2 size={22} className="text-[var(--accent)]" />
        </div>

        <p className="mt-4 text-base font-medium text-[var(--text-primary)]">
          Weekly activity data is not available yet.
        </p>

        <Badge variant="accent" className="mt-2 text-xs">
          Coming Soon
        </Badge>
      </div>
    </motion.div>
  );
}

export default ProgressChart;