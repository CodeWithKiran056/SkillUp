import {
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui";

/**
 * RecentActivity
 *
 * HONEST COMPONENT:
 * SkillUp currently has NO activity/event tracking backend
 * (no completed-courses, streaks, achievements or activity-log
 * APIs exist). To avoid presenting fabricated data as real,
 * this card intentionally renders an empty state until such
 * infrastructure exists.
 */
function RecentActivity() {
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
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[var(--accent)]/6 blur-3xl"
      />

      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
            <Clock size={18} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Activity
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Recent Activity
            </h2>
          </div>
        </div>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Your latest learning progress and updates.
        </p>
      </div>

      {/* Empty State - no activity infrastructure exists yet */}
      <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-1)]/50 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
          <Sparkles size={22} className="text-[var(--accent)]" />
        </div>

        <p className="mt-4 text-base font-medium text-[var(--text-primary)]">
          No recent activity yet.
        </p>

        <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
          Join a study room or connect with a partner and your
          progress will start appearing here.
        </p>

        <Badge variant="accent" className="mt-4 text-xs">
          Coming Soon
        </Badge>
      </div>
    </motion.div>
  );
}

export default RecentActivity;
