import {
  Flame,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
  CalendarCheck,
  CalendarPlus,
  Hourglass,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui";

/**
 * StatsCards
 *
 * Accepts the real "Sessions Joined", "Sessions Created", and "Pending Requests" counts from the parent
 * (Analytics.jsx calculates them from room data).
 * Falls back to 0 when props are undefined/null/non-numeric.
 */
function StatsCards({
  sessionsJoined,
  sessionsCreated,
  pendingRequests,
  studyPartners,
}) {
  const safeSessionsJoined =
    typeof sessionsJoined === "number"
      ? sessionsJoined
      : Number(sessionsJoined) || 0;

  const safeSessionsCreated =
    typeof sessionsCreated === "number"
      ? sessionsCreated
      : Number(sessionsCreated) || 0;

  const safePendingRequests =
    typeof pendingRequests === "number"
      ? pendingRequests
      : Number(pendingRequests) || 0;

  const safeStudyPartners =
    typeof studyPartners === "number"
      ? studyPartners
      : Number(studyPartners) || 0;

  const stats = [
    {
      icon: Flame,
      title: "Study Streak",
      value: "N/A",
      change: "Coming Soon",
      variant: "success",
    },
    {
      icon: BookOpen,
      title: "Active Courses",
      value: "N/A",
      change: "Coming Soon",
      variant: "accent",
    },
    {
      icon: Users,
      title: "Study Partners",
      value: String(safeStudyPartners),
      change: "Unique",
      variant: "success",
    },
    {
      icon: Clock,
      title: "Study Hours",
      value: "N/A",
      change: "Coming Soon",
      variant: "default",
    },
    {
      icon: CalendarCheck,
      title: "Sessions Joined",
      value: String(safeSessionsJoined),
      change: "Joined",
      variant: "accent",
    },
    {
      icon: CalendarPlus,
      title: "Sessions Created",
      value: String(safeSessionsCreated),
      change: "Created",
      variant: "success",
    },
    {
      icon: Hourglass,
      title: "Pending Requests",
      value: String(safePendingRequests),
      change: "Pending",
      variant: "warning",
    },
  ];

  return (
    <section
      aria-label="Learning statistics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map(
        ({ icon: Icon, title, value, change, variant }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
            }}
            className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
          >
            {/* Subtle accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[var(--accent)]/6 blur-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                <Icon size={19} />
              </div>

              <Badge variant={variant}>{change}</Badge>
            </div>

            <div className="relative mt-5">
              <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {value}
              </p>

              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                {title}
              </p>
            </div>
          </motion.div>
        )
      )}
    </section>
  );
}

export default StatsCards;