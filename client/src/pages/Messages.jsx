import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  MessageCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Send,
} from "lucide-react";

import {
  getToken,
  getCurrentUserId,
} from "../utils/auth";
import ConversationList from "../components/messages/ConversationList";
import DirectMessageList from "../components/messages/DirectMessageList";
import ChatRoom from "../components/ChatRoom";
import socket from "../socket/socket";

import { API_URL } from "../config/api";

const normalizeId = (id) => {
  if (!id) return "";
  if (typeof id === "object") {
    return String(id._id || id.id || "");
  }
  return String(id);
};

/* =============================================================
   Messages
   - Honest implementation around the real backend:
     * conversation list = study rooms the user created/members
       of (GET /api/rooms), filtered client-side
     * chat = real room messages
       (GET /api/messages/:roomId + existing socket)
   - No fake conversations. No hardcoded room/sender/user ids.
   ============================================================= */
function Messages() {
  const navigate = useNavigate();

  const token = useMemo(() => getToken(), []);
  const currentUserId = useMemo(
    () => getCurrentUserId(),
    []
  );

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /* mobile view: "list" | "chat" */
  const [view, setView] = useState("list");

  /* ===== Direct Messages (separate from rooms) ===== */
  const [searchParams, setSearchParams] =
    useSearchParams();
  const [dms, setDms] = useState([]);
  const [selectedDM, setSelectedDM] = useState(null);

  /* ----------------------------------------------------------
     Fetch REAL direct-message conversations.
     The server only returns conversations where the current
     user is a participant.
     ---------------------------------------------------------- */
  const fetchConversations = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDms(response.data?.conversations || []);
    } catch (err) {
      console.error(
        "Conversations load error:",
        err.response?.data || err.message
      );
      /* Non-fatal: room conversations still work. */
    }
  };

  /* ----------------------------------------------------------
     Deep link support: /messages?userId=<partnerId>
     - The SERVER decides whether the users are connected
       (client-side connectionStatus is never trusted).
     - No conversation is created client-side; this just
       asks the backend to create-or-get it.
     ---------------------------------------------------------- */
  useEffect(() => {
    const partnerId = searchParams.get("userId");

    if (!partnerId || !token) return;

    let cancelled = false;

    const openPartnerConversation = async () => {
      try {
        setError("");

        const response = await axios.post(
          `${API_URL}/api/conversations/${partnerId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;

        const conversation = response.data?.conversation;
        if (conversation?.conversationId) {
          setSelectedDM(conversation);
          setView("chat");
          fetchConversations();
        }

        /* Clean the param so refresh doesn't re-open */
        searchParams.delete("userId");
        setSearchParams(searchParams, { replace: true });
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Open partner conversation error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Unable to open that conversation."
        );
        navigate("/messages", { replace: true });
      }
    };

    openPartnerConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ----------------------------------------------------------
     If there is no session, send the user to login.
     (ProtectedRoute also guards this route.)
     ---------------------------------------------------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  /* ----------------------------------------------------------
     Determine whether the current user participates in a room
     ---------------------------------------------------------- */
  const isParticipant = (room) => {
    if (!room || !currentUserId) return false;

    const creatorId =
      room.createdBy?._id ||
      room.createdBy?.id ||
      room.createdBy;

    if (
      normalizeId(creatorId) ===
      normalizeId(currentUserId)
    ) {
      return true;
    }

    if (Array.isArray(room.members)) {
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
    }

    return false;
  };

  /* ----------------------------------------------------------
     Fetch study rooms -> these ARE the conversations.
     ---------------------------------------------------------- */
  const fetchRooms = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/rooms?scope=mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allRooms = response.data?.rooms || [];
      const userRooms = allRooms.filter((room) =>
        isParticipant(room)
      );

      setRooms(userRooms);

      /* Pick the first room as the default selection
         on desktop so the chat pane is not empty. */
      if (userRooms.length > 0 && !selectedRoom) {
        setSelectedRoom(userRooms[0]);
      }

      /* Seed the conversation list with the last
         message of every user room (real data). */
      const cache = {};
      await Promise.allSettled(
        userRooms.map((room) =>
          axios
            .get(
              `${API_URL}/api/messages/${room.roomId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              const msgs = res.data?.messages || [];
              if (msgs.length > 0) {
                cache[room.roomId] =
                  msgs[msgs.length - 1];
              }
            })
            .catch(() => {
              /* per-room failure must not break the list */
            })
        )
      );
      setLastMessages(cache);
    } catch (err) {
      console.error(
        "Messages load error:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------------------------------
     Real-time bridge: when the selected room receives a new
     message, refresh that room's last-message preview in the
     list. (Single listener via the reused ChatRoom callback.)
     ---------------------------------------------------------- */
  const handleMessageReceived = (roomId, newMessage) => {
    setLastMessages((prev) => ({
      ...prev,
      [roomId]: newMessage,
    }));
  };

  /* ----------------------------------------------------------
     Select / open a conversation
     ---------------------------------------------------------- */
  const handleSelect = (room) => {
    setSelectedRoom(room);
    setView("chat");
    setError("");
  };

  const handleBack = () => {
    setView("list");
  };

  const showChat = !!selectedRoom;

  /* =========================================================
     LOADING
     ========================================================= */
  if (loading && rooms.length === 0 && dms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <Loader2
            size={20}
            className="animate-spin text-[#E76F51]"
          />
          <span>Loading your study rooms…</span>
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY (no participatory rooms)
     ========================================================= */
  if (!loading && rooms.length === 0 && dms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="mx-auto max-w-md rounded-2xl border border-[#26262F] bg-[#15151B] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E76F51]/10 text-[#E76F51]">
            <MessageCircle size={26} />
          </div>

          <h3 className="mt-5 text-xl font-semibold text-white">
            No conversations yet
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Join a study room or connect with a study
            partner to start collaborating. Your room
            chats and direct messages will appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/study-room")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E76F51] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d65f43]"
          >
            <ExternalLink size={16} />
            Open Study Rooms
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN LAYOUT
     ========================================================= */
  return (
    <div className="flex h-full flex-col">
      {/* Page header strip */}
      <div className="border-b border-[#26262F] bg-[#15151B] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <MessageCircle
            size={20}
            className="text-[#E76F51]"
          />
          <h1 className="text-xl font-bold text-white">
            Messages
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-gray-400">
          {rooms.length} study room
          {rooms.length === 1 ? "" : "s"} • {dms.length}{" "}
          direct message{dms.length === 1 ? "" : "s"} •
          Real-time
        </p>
      </div>

      {/* Conversations + chat */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* ===== Mobile: list OR chat ===== */}
        <div className="lg:hidden h-full">
          {view === "list" && (
            <div className="flex h-full flex-col">
              <div className="h-[38%] min-h-0 shrink-0 border-b border-[#26262F]">
                <DirectMessageList
                  conversations={dms}
                  selectedConversationId={
                    selectedDM?.conversationId
                  }
                  onSelect={(conversation) => {
                    setSelectedDM(conversation);
                    setSelectedRoom(null);
                    setView("chat");
                  }}
                />
              </div>

              <div className="min-h-0 flex-1">
                <ConversationList
                  rooms={rooms}
                  selectedRoomId={
                    selectedRoom?.roomId
                  }
                  onSelect={(room) => {
                    setSelectedDM(null);
                    handleSelect(room);
                  }}
                  search={search}
                  onSearchChange={setSearch}
                  lastMessages={lastMessages}
                />
              </div>
            </div>
          )}

          {view === "chat" &&
            !selectedDM &&
            showChat && (
            <div className="flex h-full flex-col">
              <ChatRoom
                roomId={selectedRoom.roomId}
                title={selectedRoom.name}
                subtitle={
                  selectedRoom.subject ||
                  `Room: ${selectedRoom.roomId}`
                }
                backAction={handleBack}
                onMessageReceived={
                  handleMessageReceived
                }
                allowFiles
                fillHeight
              />
            </div>
          )}

          {view === "chat" && selectedDM && (
            <DirectMessageChat
              conversation={selectedDM}
              backAction={() => {
                setSelectedDM(null);
                setView("list");
              }}
              onMessagesChanged={fetchConversations}
            />
          )}
        </div>

        {/* ===== Desktop: split view ===== */}
        <div className="hidden h-full lg:flex">
          <DirectMessageList
            conversations={dms}
            selectedConversationId={
              selectedDM?.conversationId
            }
            onSelect={(conversation) => {
              setSelectedDM(conversation);
              setSelectedRoom(null);
            }}
          />

          <ConversationList
            rooms={rooms}
            selectedRoomId={
              selectedRoom?.roomId
            }
            onSelect={(room) => {
              setSelectedDM(null);
              setSelectedRoom(room);
              setView("chat");
            }}
            search={search}
            onSearchChange={setSearch}
            lastMessages={lastMessages}
          />

          <div className="flex-1 overflow-hidden">
            {selectedDM ? (
              <DirectMessageChat
                conversation={selectedDM}
                backAction={() => setSelectedDM(null)}
                onMessagesChanged={fetchConversations}
              />
            ) : showChat ? (
              <ChatRoom
                roomId={selectedRoom.roomId}
                title={selectedRoom.name}
                subtitle={
                  selectedRoom.subject ||
                  `Room: ${selectedRoom.roomId}`
                }
                allowFiles
                fillHeight
                onMessageReceived={
                  handleMessageReceived
                }
              />
            ) : (
              <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-[#26262F] bg-[#111116]">
                <div className="text-center text-gray-500">
                  <MessageCircle
                    size={36}
                    className="mx-auto text-gray-600"
                  />
                  <p className="mt-3 text-sm">
                    Select a conversation to start
                    chatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global error footer */}
      {error && !showChat && (
        <div className="border-t border-[#26262F] bg-[#15151B] px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchRooms}
              className="ml-auto text-xs font-medium text-[#E76F51] underline hover:text-[#ff8b6b]"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   DirectMessageChat
   - Real 1-to-1 chat for a Conversation document.
   - History : GET /api/conversations/:id/messages
   - Send    : socket "sendDirectMessage" when armed
               (server derives sender from verified JWT),
               REST fallback otherwise.
   - Realtime: server emits "receiveDirectMessage" to every
               registered socket of BOTH participants.
   - Dedupe by _id so REST responses and socket echoes
     never duplicate a bubble.
   ============================================================= */
function DirectMessageChat({
  conversation,
  backAction,
  onMessagesChanged,
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [dmReady, setDmReady] = useState(false);

  const token = localStorage.getItem("token");
  const conversationId =
    conversation?.conversationId;
  const partner = conversation?.partner;

  const messagesEndRef = useRef(null);

  const appendIfNew = (newMessage) => {
    if (!newMessage?._id) return;

    let added = false;

    setMessages((prev) => {
      if (
        prev.some(
          (m) =>
            String(m._id) ===
            String(newMessage._id)
        )
      ) {
        return prev;
      }
      added = true;
      return [...prev, newMessage];
    });

    if (added && onMessagesChanged) {
      onMessagesChanged();
    }
  };

  /* ---------- LOAD HISTORY ---------- */
  useEffect(() => {
    if (!conversationId || !token) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setMessages(response.data?.messages || []);
        }
      } catch (err) {
        console.error(
          "DM history load error:",
          err.response?.data || err.message
        );
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load messages."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  /* ---------- SOCKET REGISTER + REAL-TIME ---------- */
  useEffect(() => {
    if (!token || !conversationId) return;

    socket.emit("registerDmUser", { token });

    const handleRegistered = () => setDmReady(true);

    const handleReceive = (newMessage) => {
      if (!newMessage) return;
      if (
        String(newMessage.conversationId) !==
        String(conversationId)
      ) {
        return;
      }
      appendIfNew(newMessage);
    };

    socket.on("dmRegistered", handleRegistered);
    socket.on("receiveDirectMessage", handleReceive);

    return () => {
      socket.off("dmRegistered", handleRegistered);
      socket.off("receiveDirectMessage", handleReceive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  /* Auto-scroll */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
      });
    }
  }, [messages.length, loading]);

  /* ---------- SEND ---------- */
  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setMessage("");
    setError("");

    /* Preferred path: authenticated socket event.
       The message appears when the server echoes it
       back via receiveDirectMessage. */
    if (socket.connected && dmReady) {
      socket.emit("sendDirectMessage", {
        conversationId,
        message: trimmed,
      });
      return;
    }

    /* Fallback: REST (sender derived from JWT). */
    try {
      setSending(true);

      const response = await axios.post(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        { message: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      appendIfNew(response.data?.message);
    } catch (err) {
      console.error(
        "DM send error:",
        err.response?.data || err.message
      );
      setMessage(trimmed);
      setError(
        err.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      );
    } catch {
      return "";
    }
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0D0D12]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#26262F] bg-[#15151B] px-5 py-3">
        <button
          type="button"
          onClick={backAction}
          aria-label="Back to conversations"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] text-gray-400 transition hover:border-[#E76F51] hover:text-[#E76F51]"
        >
          <ChevronLeft size={18} />
        </button>

        {partner?.profileImage ? (
          <img
            src={
              /^https?:\/\//.test(partner.profileImage)
                ? partner.profileImage
                : `${API_URL}${partner.profileImage}`
            }
            alt={partner.name}
            className="h-10 w-10 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] font-semibold text-[#E76F51]">
            {(partner?.name || "S")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">
            {partner?.name || "Student"}
          </h3>
          <p className="truncate text-xs text-gray-500">
            Direct Message
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesEndRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2
              size={20}
              className="animate-spin text-[#E76F51]"
            />
            <span className="ml-3">
              Loading messages…
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle
              size={30}
              className="text-gray-600"
            />
            <p className="mt-3 text-sm text-gray-400">
              No messages yet.
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Say hi to{" "}
              {partner?.name || "your partner"}!
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => {
              const mine =
                String(
                  msg.sender?._id || msg.sender
                ) === String(currentUserId);

              return (
                <li
                  key={msg._id}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      mine
                        ? "bg-[#E76F51] text-white"
                        : "border border-[#26262F] bg-[#15151B] text-gray-100"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-1 truncate text-xs font-semibold text-[#E76F51]">
                        {msg.sender?.name ||
                          "Student"}
                      </p>
                    )}

                    {msg.message && (
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.message}
                      </p>
                    )}

                    <p
                      className={`mt-1 text-right text-[11px] ${
                        mine
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-3 border-t border-[#26262F] bg-[#15151B] px-5 py-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          placeholder="Type your message..."
          rows={1}
          className="min-h-[40px] flex-1 resize-none rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#E76F51]"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !message.trim()}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E76F51] px-5 font-medium text-white transition hover:bg-[#d65f43] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Send size={16} />
          )}
          <span className="hidden sm:block">
            {sending ? "Sending…" : "Send"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Messages;
