import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  Users,
  Video,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui";
import { getToken, getCurrentUserId } from "../../utils/auth";

const API_URL = "http://localhost:5000";

/* =============================================================
   Continue Study Room
   - Real data only: GET /api/rooms filtered to rooms where the
     authenticated user is actually a member (or creator).
   - No fake dates, times, names or topics.
   ============================================================= */

const normalizeId = (id) => {
  if (!id) return "";
  if (typeof id === "object") {
    return String(id._id || id.id || "");
  }
  return String(id);
};

function ContinueStudyRoom() {
  const navigate = useNavigate();

  const token = useMemo(() => getToken(), []);
  const currentUserId = useMemo(
    () => getCurrentUserId(),
    []
  );

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ----------------------------------------------------------
     Is the current user actually part of this room?
     (Same membership check used on the Messages page.)
     ---------------------------------------------------------- */
  const isParticipant = (candidateRoom) => {
    if (!candidateRoom || !currentUserId)
      return false;

    const creatorId =
      candidateRoom.createdBy?._id ||
      candidateRoom.createdBy?.id ||
      candidateRoom.createdBy;

    if (
      normalizeId(creatorId) ===
      normalizeId(currentUserId)
    ) {
      return true;
    }

    if (
      Array.isArray(candidateRoom.members)
    ) {
      return candidateRoom.members.some(
        (member) => {
          const memberId =
            member?._id || member?.id || member;
          return (
            normalizeId(memberId) ===
            normalizeId(currentUserId)
          );
        }
      );
    }

    return false;
  };

  /* ----------------------------------------------------------
     Fetch real rooms and keep the first one the user joined
     ---------------------------------------------------------- */
  useEffect(() => {
    const fetchJoinedRoom = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/rooms`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allRooms =
          response.data?.rooms || [];

        setRoom(
          allRooms.find((candidateRoom) =>
            isParticipant(candidateRoom)
          ) || null
        );
      } catch (err) {
        console.error(
          "Continue Study Room load error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Unable to load your study room."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------------------------------
     Open the REAL room by its REAL roomId
     ---------------------------------------------------------- */
  const openStudyRoom = () => {
    if (!room?.roomId) return;
    navigate(
      `/study-room?roomId=${encodeURIComponent(
        room.roomId
      )}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
    >
      {/* Subtle ambient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent)]/8 blur-3xl"
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
            <CalendarDays size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Continue Study Room
            </p>

            <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
              Pick up where you left off
            </p>
          </div>
        </div>

        {room && (
          <span className="shrink-0 rounded-full border border-[rgba(40,199,111,0.22)] bg-[rgba(40,199,111,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
            Joined
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="relative mt-6 flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2
              size={16}
              className="animate-spin"
            />
            Loading your study room…
          </div>
        ) : error ? (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <AlertCircle
                size={16}
                className="text-[var(--accent)]"
              />
              {error}
            </div>

            <div className="mt-auto pt-5">
              <Button
                className="w-full"
                size="md"
                variant="secondary"
                onClick={() => navigate("/study-room")}
              >
                Explore Study Rooms
                <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : room ? (
          <>
            <p className="truncate text-sm font-medium text-[var(--accent)]">
              {room.subject}
            </p>

            <h2 className="mt-2 truncate text-xl font-semibold leading-7 tracking-tight text-[var(--text-primary)]">
              {room.name}
            </h2>

            {/* Real member count */}
            <div className="mt-5 flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
              <Users
                size={16}
                className="shrink-0 text-[var(--accent)]"
              />
              <span>
                {room.members?.length || 0}{" "}
                {room.members?.length === 1
                  ? "Member"
                  : "Members"}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-5">
              <Button
                className="w-full"
                size="md"
                onClick={openStudyRoom}
              >
                <Video size={17} />
                Open Study Room
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              No study room to continue.
            </p>

            <div className="mt-auto pt-5">
              <Button
                className="w-full"
                size="md"
                variant="secondary"
                onClick={() =>
                  navigate("/study-room")
                }
              >
                <Compass size={17} />
                Explore Study Rooms
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default ContinueStudyRoom;