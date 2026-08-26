import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Bell, X, Video, Plus, MessageCircle } from "lucide-react";

import ChatRoom from "../components/ChatRoom";
import VideoCall from "../components/VideoCall";
import StudyRoomCard from "../components/studyroom/StudyRoomCard";
import socket from "../socket/socket";

import { API_URL } from "../config/api";

function StudyRoom() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [roomError, setRoomError] = useState("");
  const [roomSuccess, setRoomSuccess] = useState("");

  const [requestStatus, setRequestStatus] = useState({});
  const [joinRequests, setJoinRequests] = useState({});
  const [loadingRequests, setLoadingRequests] = useState({});

  const [notification, setNotification] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const [roomData, setRoomData] = useState({
    name: "",
    subject: "",
    description: "",
  });

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
   *
   * IMPORTANT:
   * createdBy is populated by backend.
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
   * Clear messages
   */
  const clearMessages = () => {
    setRoomError("");
    setRoomSuccess("");
  };

  /*
   * Register current user with Socket.IO
   */
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    socket.emit(
      "registerUser",
      currentUserId
    );

    console.log(
      "StudyRoom user registered:",
      currentUserId
    );
  }, [currentUserId]);

  /*
   * Real-time join request notification
   */
  useEffect(() => {
    const handleNewJoinRequest = (data) => {
      console.log(
        "New Join Request:",
        data
      );

      if (!data?.roomId || !data?.requester) {
        return;
      }

      setJoinRequests((previous) => {
        const existing =
          previous[data.roomId] || [];

        const requesterId =
          normalizeId(
            data.requester?._id ||
              data.requester?.id
          );

        const alreadyExists =
          existing.some(
            (request) =>
              normalizeId(
                request?._id ||
                  request?.id
              ) === requesterId
          );

        if (alreadyExists) {
          return previous;
        }

        return {
          ...previous,
          [data.roomId]: [
            ...existing,
            data.requester,
          ],
        };
      });

      setNotification({
        roomId: data.roomId,
        requester: data.requester,
      });

      window.setTimeout(() => {
        setNotification(null);
      }, 7000);
    };

    socket.on(
      "newJoinRequest",
      handleNewJoinRequest
    );

    return () => {
      socket.off(
        "newJoinRequest",
        handleNewJoinRequest
      );
    };
  }, []);

  /*
   * Fetch all study rooms
   */
  const fetchRooms = async () => {
    if (!token) {
      setRoomError(
        "Please login again."
      );
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedRooms =
        response.data?.rooms || [];

      setRooms(fetchedRooms);

      /*
       * Rebuild pending request state
       */
      const pendingStatus = {};

      fetchedRooms.forEach((room) => {
        const pendingRequests =
          room.pendingRequests || [];

        const hasRequest =
          pendingRequests.some(
            (request) => {
              const requestId =
                request?._id ||
                request?.id ||
                request;

              return (
                normalizeId(requestId) ===
                normalizeId(currentUserId)
              );
            }
          );

        if (hasRequest) {
          pendingStatus[
            room.roomId
          ] = "pending";
        }
      });

      setRequestStatus(
        pendingStatus
      );

      /*
       * Debug creator information
       */
      console.table(
        fetchedRooms.map((room) => ({
          room: room.name,
          roomId: room.roomId,
          creatorId:
            room.createdBy?._id ||
            room.createdBy?.id ||
            room.createdBy,
          creatorName:
            room.createdBy?.name,
          currentUser:
            currentUserId,
          isCreator:
            isCreator(room),
        }))
      );
    } catch (error) {
      console.error(
        "Fetch Rooms Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to load study rooms."
      );
    }
  };

  /*
   * Initial rooms load
   */
  useEffect(() => {
    fetchRooms();
  }, []);

  /*
   * Auto-select room from ?roomId= query param
   */
  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");

    if (!roomIdParam || rooms.length === 0) {
      return;
    }

    const matchingRoom = rooms.find(
      (room) => room.roomId === roomIdParam
    );

    if (matchingRoom) {
      setSelectedRoom(matchingRoom);
    }
  }, [searchParams, rooms]);

  /*
   * Create room
   */
  const createRoom = async () => {
    clearMessages();

    if (!token) {
      setRoomError(
        "Please login again."
      );
      return;
    }

    if (!roomData.name.trim()) {
      setRoomError(
        "Room name is required."
      );
      return;
    }

    if (!roomData.subject.trim()) {
      setRoomError(
        "Subject is required."
      );
      return;
    }

    try {
      setCreatingRoom(true);

      const response = await axios.post(
        `${API_URL}/api/rooms/create`,
        {
          name: roomData.name.trim(),
          subject: roomData.subject.trim(),
          description:
            roomData.description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoomSuccess(
        response.data?.message ||
          "Study room created successfully."
      );

      setRoomData({
        name: "",
        subject: "",
        description: "",
      });

      await fetchRooms();
    } catch (error) {
      console.error(
        "Create Room Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to create study room."
      );
    } finally {
      setCreatingRoom(false);
    }
  };

  /*
   * Send join request
   */
  const joinRoom = async (roomId) => {
    clearMessages();

    if (!token) {
      setRoomError(
        "Please login again."
      );
      return;
    }

    const room = rooms.find(
      (item) =>
        item.roomId === roomId
    );

    if (!room) {
      setRoomError(
        "Study room not found."
      );
      return;
    }

    /*
     * Frontend protection
     */
    if (isCreator(room)) {
      setRoomError(
        "You are the creator of this room."
      );
      return;
    }

    if (isMember(room)) {
      setRoomError(
        "You are already a member of this room."
      );
      return;
    }

    try {
      const creatorId =
        room.createdBy?._id ||
        room.createdBy?.id ||
        room.createdBy;

      const response = await axios.post(
        `${API_URL}/api/rooms/request/${roomId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestStatus(
        (previous) => ({
          ...previous,
          [roomId]: "pending",
        })
      );

      /*
       * Notify creator
       */
      if (creatorId) {
        socket.emit(
          "joinRequestSent",
          {
            roomId,
            creatorId,
            requester: {
              _id: currentUserId,
              id: currentUserId,
              name:
                currentUser?.name ||
                "Student",
              email:
                currentUser?.email ||
                "",
            },
          }
        );
      }

      setRoomSuccess(
        response.data?.message ||
          "Join request sent successfully."
      );
    } catch (error) {
      console.error(
        "Join Request Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to send join request."
      );
    }
  };

  /*
   * Fetch creator's pending requests
   */
  const fetchJoinRequests = async (
    roomId
  ) => {
    if (!token) {
      setRoomError(
        "Please login again."
      );
      return;
    }

    try {
      setLoadingRequests(
        (previous) => ({
          ...previous,
          [roomId]: true,
        })
      );

      const response = await axios.get(
        `${API_URL}/api/rooms/requests/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJoinRequests(
        (previous) => ({
          ...previous,
          [roomId]:
            response.data?.requests ||
            [],
        })
      );
    } catch (error) {
      console.error(
        "Fetch Requests Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to load join requests."
      );
    } finally {
      setLoadingRequests(
        (previous) => ({
          ...previous,
          [roomId]: false,
        })
      );
    }
  };

  /*
   * Accept join request
   */
  const acceptRequest = async (
    roomId,
    userId
  ) => {
    clearMessages();

    try {
      await axios.post(
        `${API_URL}/api/rooms/requests/${roomId}/accept/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJoinRequests(
        (previous) => ({
          ...previous,
          [roomId]: (
            previous[roomId] || []
          ).filter(
            (request) =>
              normalizeId(
                request?._id ||
                  request?.id
              ) !==
              normalizeId(userId)
          ),
        })
      );

      setRoomSuccess(
        "Join request accepted."
      );

      await fetchRooms();
    } catch (error) {
      console.error(
        "Accept Request Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to accept request."
      );
    }
  };

  /*
   * Reject join request
   */
  const rejectRequest = async (
    roomId,
    userId
  ) => {
    clearMessages();

    try {
      await axios.post(
        `${API_URL}/api/rooms/requests/${roomId}/reject/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJoinRequests(
        (previous) => ({
          ...previous,
          [roomId]: (
            previous[roomId] || []
          ).filter(
            (request) =>
              normalizeId(
                request?._id ||
                  request?.id
              ) !==
              normalizeId(userId)
          ),
        })
      );

      setRoomSuccess(
        "Join request rejected."
      );
    } catch (error) {
      console.error(
        "Reject Request Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to reject request."
      );
    }
  };

  /*
   * Delete room
   */
  const deleteRoom = async (
    roomId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this study room?"
      );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      await axios.delete(
        `${API_URL}/api/rooms/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        selectedRoom?.roomId ===
        roomId
      ) {
        setSelectedRoom(null);
      }

      setRoomSuccess(
        "Study room deleted successfully."
      );

      await fetchRooms();
    } catch (error) {
      console.error(
        "Delete Room Error:",
        error.response?.data ||
          error.message
      );

      setRoomError(
        error.response?.data?.message ||
          "Unable to delete study room."
      );
    }
  };

  /*
   * Open room
   */
  const openRoom = (room) => {
    setSelectedRoom(room);

    window.setTimeout(() => {
      document
        .getElementById(
          "active-study-room"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  return (
    <div className="pb-12">

      {/* =========================
          REAL-TIME NOTIFICATION
      ========================== */}

      {notification && (
        <div className="fixed right-5 top-20 z-50 w-[min(380px,calc(100vw-40px))] rounded-2xl border border-[rgba(231,111,81,0.3)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl">

          <div className="flex gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Bell size={19} />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex items-center justify-between gap-3">

                <h3 className="text-sm font-semibold">
                  New Join Request
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setNotification(null)
                  }
                  className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                >
                  <X size={16} />
                </button>

              </div>

              <p className="mt-1.5 text-sm leading-5 text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">
                  {
                    notification
                      .requester?.name
                  }
                </span>{" "}
                wants to join your study room.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          HEADER
      ========================== */}

      <section className="border-b border-[var(--border-subtle)] pb-8 pt-8">

        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Collaborative Learning
        </span>

        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              Study Rooms
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Create focused study spaces, connect
              with students and learn together.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-2.5">

            <Video
              size={17}
              className="text-[var(--accent)]"
            />

            <span className="text-sm text-[var(--text-secondary)]">
              {rooms.length}{" "}
              {rooms.length === 1
                ? "room"
                : "rooms"}
            </span>

          </div>

        </div>

      </section>

      {/* =========================
          ALERTS
      ========================== */}

      {roomSuccess && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">

          <span>
            ✓ {roomSuccess}
          </span>

          <button
            type="button"
            onClick={() =>
              setRoomSuccess("")
            }
            className="text-green-400/60 hover:text-green-400"
          >
            <X size={16} />
          </button>

        </div>
      )}

      {roomError && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">

          <span>
            {roomError}
          </span>

          <button
            type="button"
            onClick={() =>
              setRoomError("")
            }
            className="text-red-400/60 hover:text-red-400"
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* =========================
          ROOM LIST
      ========================== */}

      <section className="mt-8">

        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-10 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Video size={22} />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No study rooms yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Create the first study room and
              start learning collaboratively.
            </p>

          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {rooms.map((room) => {

              const creator =
                isCreator(room);

              const member =
                isMember(room);

              const pending =
                requestStatus[
                  room.roomId
                ] === "pending";

              return (
                <StudyRoomCard
                  key={
                    room._id ||
                    room.roomId
                  }
                  room={room}
                  isCreator={creator}
                  isMember={member}
                  isPending={pending}
                  joinRequests={
                    joinRequests[
                      room.roomId
                    ] || []
                  }
                  loadingRequests={
                    loadingRequests[
                      room.roomId
                    ] || false
                  }
                  onJoin={joinRoom}
                  onOpen={openRoom}
                  onRefreshRequests={() =>
                    fetchJoinRequests(
                      room.roomId
                    )
                  }
                  onAccept={acceptRequest}
                  onReject={rejectRequest}
                  onDelete={deleteRoom}
                />
              );
            })}

          </div>
        )}

      </section>

      {/* =========================
          CREATE ROOM
      ========================== */}

      <section className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-sm)]">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
            <Plus size={19} />
          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Create a Study Room
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Set up a focused space for your
              study group.
            </p>

          </div>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <input
            type="text"
            value={roomData.name}
            onChange={(event) =>
              setRoomData(
                (previous) => ({
                  ...previous,
                  name: event.target.value,
                })
              )
            }
            placeholder="Room name"
            className="h-11 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />

          <input
            type="text"
            value={roomData.subject}
            onChange={(event) =>
              setRoomData(
                (previous) => ({
                  ...previous,
                  subject:
                    event.target.value,
                })
              )
            }
            placeholder="Subject"
            className="h-11 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />

          <input
            type="text"
            value={roomData.description}
            onChange={(event) =>
              setRoomData(
                (previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                })
              )
            }
            placeholder="Short description"
            className="h-11 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />

        </div>

        <button
          type="button"
          onClick={createRoom}
          disabled={creatingRoom}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus size={17} />

          {creatingRoom
            ? "Creating..."
            : "Create Room"}
        </button>

      </section>

      {/* =========================
          ACTIVE STUDY ROOM / CHAT
      ========================== */}

      {selectedRoom && (
        <section
          id="active-study-room"
          className="mt-8 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] shadow-[var(--shadow-md)]"
        >

          <div className="border-b border-[var(--border-subtle)] p-6">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                  <MessageCircle
                    size={19}
                  />
                </div>

                <div>

                  <h2 className="font-semibold">
                    {selectedRoom.name}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {selectedRoom.subject}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRoom(null)
                }
                className="self-start rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] sm:self-auto"
                title="Close study room"
              >
                <X size={18} />
              </button>

            </div>

          </div>

          <div className="space-y-6 p-6">

            <VideoCall
              roomId={
                selectedRoom.roomId
              }
              userName={
                currentUser?.name ||
                "You"
              }
            />

            <ChatRoom
              roomId={
                selectedRoom.roomId
              }
            />

          </div>

        </section>
      )}

    </div>
  );
}

export default StudyRoom;