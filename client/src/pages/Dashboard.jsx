import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";

import StatsCards from "../components/dashboard/StatsCards";
import FindStudyPartner from "../components/dashboard/FindStudyPartner";
import ContinueStudyRoom from "../components/dashboard/ContinueStudyRoom";
import ProgressChart from "../components/dashboard/ProgressChart";
import StudyPartners from "../components/dashboard/StudyPartners";
import RecentActivity from "../components/dashboard/RecentActivity";

import { getUser } from "../utils/auth";

function Dashboard() {
  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Student";

  /* ==========================================
     REAL LEARNING STATS
     Measured from GET /api/rooms exactly like the
     Analytics page (same endpoint, same logic).
     0 = real measured zero once rooms are loaded.
     ========================================== */
  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId =
    user?.id || user?._id || "";

  const [rooms, setRooms] = useState([]);
  const [statsLoading, setStatsLoading] =
    useState(true);
  const [statsError, setStatsError] =
    useState("");

  const fetchRooms = async () => {
    if (!token) {
      setStatsError("Please login again.");
      setStatsLoading(false);
      return;
    }

    try {
      setStatsLoading(true);
      setStatsError("");

      const response = await axios.get(
        `${API_URL}/api/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRooms(response.data?.rooms || []);
    } catch (err) {
      console.error(
        "Dashboard stats load error:",
        err.response?.data || err.message
      );
      setStatsError(
        err.response?.data?.message ||
          "Unable to load your learning stats."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sessions Joined: real room membership count */
  const sessionsJoined = useMemo(
    () =>
      rooms.filter((room) =>
        (Array.isArray(room.members)
          ? room.members
          : []
        ).some(
          (member) =>
            String(
              member?._id || member?.id || member
            ) === String(currentUserId)
        )
      ).length,
    [rooms, currentUserId]
  );

  /* Sessions Created: real creator count */
  const sessionsCreated = useMemo(
    () =>
      rooms.filter((room) => {
        const createdBy =
          room?.createdBy?._id ||
          room?.createdBy?.id ||
          room?.createdBy;
        return (
          Boolean(currentUserId) &&
          Boolean(createdBy) &&
          String(createdBy) === String(currentUserId)
        );
      }).length,
    [rooms, currentUserId]
  );

  /* Pending Requests: my pending join requests */
  const pendingRequests = useMemo(
    () =>
      rooms.filter((room) =>
        (Array.isArray(room.pendingRequests)
          ? room.pendingRequests
          : []
        ).some(
          (request) =>
            String(
              request?._id ||
                request?.id ||
                request
            ) === String(currentUserId)
        )
      ).length,
    [rooms, currentUserId]
  );

  /* Study Partners: unique co-members of my rooms */
  const studyPartners = useMemo(() => {
    const partnerIds = new Set();

    rooms.forEach((room) => {
      const memberIds = (
        Array.isArray(room.members)
          ? room.members
          : []
      ).map(
        (member) =>
          member?._id || member?.id || member
      );

      if (
        !memberIds.some(
          (id) => String(id) === String(currentUserId)
        )
      ) {
        return;
      }

      memberIds.forEach((id) => {
        if (
          id &&
          String(id) !== String(currentUserId)
        ) {
          partnerIds.add(String(id));
        }
      });
    });

    return partnerIds.size;
  }, [rooms, currentUserId]);


  return (
    <div className="mx-auto w-full max-w-[1600px] py-8 sm:py-10">
      {/* ─────────────────────────────────────────────
          Page Header
      ───────────────────────────────────────────── */}
      <section className="mb-8 sm:mb-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--accent)]">
              Your learning workspace
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Good morning, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              Here's your learning overview for today. Keep your momentum going.
            </p>
          </div>

          <div className="hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-muted)] sm:block">
            Today
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          Stats (real data from /api/rooms)
      ───────────────────────────────────────────── */}
      <section aria-label="Learning statistics">
        {statsLoading ? (
          <div className="flex min-h-[120px] items-center justify-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] text-sm text-[var(--text-secondary)]">
            <Loader2
              size={18}
              className="animate-spin text-[var(--accent)]"
            />
            Loading your learning stats…
          </div>
        ) : statsError ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-center">
            <AlertCircle
              size={24}
              className="text-red-400"
            />
            <p className="text-sm text-gray-400">
              {statsError}
            </p>
            <button
              type="button"
              onClick={fetchRooms}
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--accent)] transition hover:border-[var(--accent)]"
            >
              Retry
            </button>
          </div>
        ) : (
          <StatsCards
            sessionsJoined={sessionsJoined}
            sessionsCreated={sessionsCreated}
            pendingRequests={pendingRequests}
            studyPartners={studyPartners}
          />
        )}
      </section>

      {/* ─────────────────────────────────────────────
          Find Your Study Partner + Continue Study Room
      ───────────────────────────────────────────── */}
      <section
        aria-label="Today's learning focus"
        className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_1fr]"
      >
        <FindStudyPartner />
        <ContinueStudyRoom />
      </section>

      {/* ─────────────────────────────────────────────
          Learning Progress
      ───────────────────────────────────────────── */}
      <section
        aria-label="Learning progress"
        className="mt-8"
      >
        <ProgressChart />
      </section>

      {/* ─────────────────────────────────────────────
          Study Partners + Recent Activity
      ───────────────────────────────────────────── */}
      <section
        aria-label="Study activity"
        className="mt-8 grid gap-6 pb-8 lg:grid-cols-2"
      >
        <StudyPartners />
        <RecentActivity />
      </section>
    </div>
  );
}

export default Dashboard;