import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  UserRound,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Button } from "../ui";

import { API_URL } from "../../config/api";

/* =============================================================
   Find Your Study Partner
   - Real data only: first partner returned by GET /api/match
     using the authenticated user token.
   - No invented match percentage, names or recommendation text.
   ============================================================= */

function FindStudyPartner() {
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/match`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const matches =
          response.data?.matches || [];

        setPartner(matches[0] || null);
      } catch (err) {
        console.error(
          "Find Study Partner load error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Unable to load study partners."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
    >
      {/* Subtle AI accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent)]/8 blur-3xl"
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
            <Sparkles size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Find Your Study Partner
            </p>

            <h2 className="mt-1 truncate text-base font-semibold text-[var(--text-primary)]">
              A real match from your skills
            </h2>
          </div>
        </div>

        {partner && (
          <Badge variant="success">
            <Users size={13} />
            Match
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="relative mt-6 flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2
              size={16}
              className="animate-spin"
            />
            Finding your study partner…
          </div>
        ) : error ? (
          <>
            <div className="flex items-center gap-2 text-sm leading-6 text-[var(--text-secondary)]">
              <AlertCircle
                size={16}
                className="shrink-0 text-[var(--accent)]"
              />
              {error}
            </div>

            <div className="mt-auto pt-5">
              <Button
                className="w-full sm:w-auto"
                onClick={() =>
                  navigate("/find-partner")
                }
              >
                Find Partner
                <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : partner ? (
          <>
            {/* Real partner from /api/match */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-5">
              <div className="flex items-center gap-4">
                {partner.profileImage ? (
                  <img
                    src={`${API_URL}${partner.profileImage}`}
                    alt={
                      partner.name || "Study partner"
                    }
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
                    <UserRound size={22} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {partner.name || "Student"}
                  </p>

                  {partner.role && (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                      {partner.role === "mentor"
                        ? "Mentor"
                        : "Student"}
                    </p>
                  )}
                </div>
              </div>

              {/* Real common skills (if any) */}
              {Array.isArray(
                partner.commonSkills
              ) &&
                partner.commonSkills.length >
                  0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {partner.commonSkills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[var(--accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto pt-5">
              <Button
                className="w-full sm:w-auto"
                onClick={() =>
                  navigate("/find-partner")
                }
              >
                Find Partner
                <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              No study partner found yet.
            </p>

            <div className="mt-auto pt-5">
              <Button
                className="w-full sm:w-auto"
                onClick={() =>
                  navigate("/find-partner")
                }
              >
                Find Partner
                <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default FindStudyPartner;