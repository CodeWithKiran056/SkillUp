import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Video,
  CheckCircle,
  Loader2,
  RefreshCw,
  DoorOpen,
  AlertCircle,
} from "lucide-react";

import { API_URL } from "../config/api";

function MySessions() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("skillup_user") || "null"
  );

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    "";

  /*
   * Normalize MongoDB/Object IDs
   */
  const normalizeId = (id) => {
    if (!id) return "";

    if (typeof id === "object") {
      return String(id._id || id.id || "");
    }

    return String(id);
  };

  /*
   * Check room creator
   */
  const isCreator = (room) => {
    if (!room || !currentUserId) {
      return false;
    }

    const creatorId =
      room.createdBy?._id ||
      room.createdBy?.id ||
      room.createdBy;

    return (
      normalizeId(creatorId) ===
      normalizeId(currentUserId)
    );
  };

  /*
   * Check room membership
   */
  const isMember = (room) => {
    if (!room || !currentUserId) {
      return false;
    }

    if (!Array.isArray(room.members)) {
      return false;
    }

    return room.members.some((member) => {
      const memberId =
        member?._id ||
        member?.id ||
        member;

      return (
        normalizeId(memberId) ===
        normalizeId(currentUserId)
      );
    });
  };

  /*
   * Check pending request
   */
  const isPending = (room) => {
    if (!room || !currentUserId) {
      return false;
    }

    if (!Array.isArray(room.pendingRequests)) {
      return false;
    }

    return room.pendingRequests.some((request) => {
      const requestId =
        request?._id ||
        request?.id ||
        request;

      return (
        normalizeId(requestId) ===
        normalizeId(currentUserId)
      );
    });
  };

  /*
   * Fetch all study rooms
   */
  const fetchRooms = async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/rooms?scope=mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRooms(response.data?.rooms || []);
    } catch (err) {
      console.error(
        "Fetch Rooms Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load study sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  /*
   * Open a joined study room
   */
  const openStudyRoom = (room) => {
    navigate(`/study-room?roomId=${encodeURIComponent(room.roomId)}`);
  };

  /*
   * Derived data
   */
  const joinedRooms = useMemo(
    () => rooms.filter((room) => isMember(room)),
    [rooms, currentUserId]
  );

  const pendingCount = useMemo(
    () =>
      rooms.filter((room) => isPending(room)).length,
    [rooms, currentUserId]
  );

  /*
   * Format created time
   */
  const formatCreated = (room) => {
    if (!room?.createdAt) {
      return null;
    }

    const date = new Date(room.createdAt);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /*
   * Creator name helper
   */
  const creatorName = (room) =>
    room?.createdBy?.name ||
    room?.createdBy?.email?.split("@")[0] ||
    "Unknown";

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#26262F] bg-[#15151B]">
          <Loader2
            size={26}
            className="animate-spin text-[#E76F51]"
          />
        </div>
        <p className="text-sm text-gray-400">
          Loading study sessions...
        </p>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error && rooms.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5">
          <AlertCircle size={26} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Couldn't load study sessions
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRooms}
          className="flex items-center gap-2 rounded-xl bg-[#E76F51] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#d65f43]"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-[#26262F] py-7">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          Study Sessions
        </span>

        <h1 className="mt-3 text-3xl font-bold lg:text-4xl">
          My Study Sessions
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-gray-400">
          Study sessions you created or joined. Discover new
          rooms on the Study Rooms page.
        </p>
      </section>

      {/* Inline error banner (non-fatal) */}
      {error && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-400/60 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E76F51]/10 text-[#E76F51]">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                Sessions Joined
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">
                {joinedRooms.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E76F51]/10 text-[#E76F51]">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                Pending Requests
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* My Joined Sessions */}
      <section className="mt-10 pb-8">
        <div className="mb-5 flex items-center gap-3">
          <CheckCircle size={22} className="text-green-400" />
          <h2 className="text-2xl font-bold">
            My Joined Sessions
          </h2>
        </div>

        {joinedRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#26262F] bg-[#111116] p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              You haven't joined any study sessions yet.
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
              Head to the Study Rooms page to create a room
              or discover and join rooms created by other students.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {joinedRooms.map((room) => (
              <article
                key={room._id || room.roomId}
                className="group relative overflow-hidden rounded-2xl border border-[#26262F] bg-[#15151B] p-5 transition duration-300 hover:-translate-y-1 hover:border-green-400/40"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-500/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                      <Video size={20} />
                    </div>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-semibold text-green-400">
                      Joined
                    </span>
                  </div>

                  <div className="mt-5">
                    <h2 className="line-clamp-1 text-lg font-bold text-white">
                      {room.name}
                    </h2>

                    <span className="mt-2 inline-block rounded-full bg-[#E76F51]/10 px-2.5 py-1 text-xs font-medium text-[#E76F51]">
                      {room.subject}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <Users size={16} className="text-green-400" />
                      {creatorName(room)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={16} className="text-green-400" />
                      {room.members?.length || 0} members
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openStudyRoom(room)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] py-3 text-sm font-medium text-white transition hover:border-[#E76F51] hover:text-[#E76F51]"
                  >
                    <DoorOpen size={16} />
                    Open Study Room
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default MySessions;