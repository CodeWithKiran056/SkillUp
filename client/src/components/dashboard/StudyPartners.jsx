import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { API_URL } from "../../config/api";

/**
 * StudyPartners
 *
 * REAL DATA ONLY:
 * Lists the authenticated user's actually-connected study
 * partners, derived from GET /api/conversations (the backend
 * returns one conversation per real connection, including the
 * partner's id/name/profileImage/role).
 *
 * No fabricated match percentages, online statuses or names.
 */
function StudyPartners() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPartners = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const conversations =
        response.data?.conversations || [];

      /* One entry per unique connected partner */
      const seen = new Set();
      const uniquePartners = [];

      conversations.forEach((conversation) => {
        const partner = conversation.partner;

        if (
          partner?.id &&
          !seen.has(partner.id)
        ) {
          seen.add(partner.id);
          uniquePartners.push(partner);
        }
      });

      setPartners(uniquePartners);
    } catch (err) {
      console.error(
        "Study Partners load error:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Unable to load your study partners."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

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
      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Connections
            </p>
          </div>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Study Partners
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Students you are connected with.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/find-partner")}
          aria-label="Find more study partners"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
        >
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="relative flex min-h-[160px] items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
          <Loader2
            size={18}
            className="animate-spin text-[#E76F51]"
          />
          Loading your partners…
        </div>
      ) : error ? (
        /* Error */
        <div className="relative flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle
            size={26}
            className="text-red-400"
          />
          <p className="max-w-xs text-sm text-gray-400">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchPartners}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[#E76F51] transition hover:border-[#E76F51]"
          >
            Retry
          </button>
        </div>
      ) : partners.length === 0 ? (
        /* Empty */
        <div className="relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] p-6 text-center">
          <Users
            size={26}
            className="text-[var(--text-muted)]"
          />
          <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
            No study partners yet.
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-secondary)]">
            Connect with a partner in Find Partner and
            they will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/find-partner")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E76F51] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#d85e40]"
          >
            Find Partners
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        /* Real partner list */
        <ul className="relative max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {partners.map((partner) => (
            <li
              key={partner.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 transition-colors duration-150 hover:border-[var(--border-strong)]"
            >
              {partner.profileImage ? (
                <img
                  src={
                    /^https?:\/\//.test(
                      partner.profileImage
                    )
                      ? partner.profileImage
                      : `${API_URL}${partner.profileImage}`
                  }
                  alt={partner.name}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] font-semibold text-[#E76F51]">
                  {(partner.name || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {partner.name || "Student"}
                </p>
                <p className="truncate text-xs capitalize text-[var(--text-muted)]">
                  {partner.role || "student"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default StudyPartners;

