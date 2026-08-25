import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Send,
  MessageCircle,
  Loader2,
  Paperclip,
  FileText,
  ChevronLeft,
} from "lucide-react";

import socket from "../socket/socket";

const API_URL = "http://localhost:5000";

/* =============================================================
   Format a message timestamp.
   - Today     -> "10:30 AM"
   - Yesterday -> "Yesterday"
   - Older     -> "Aug 20"
   ============================================================= */
const formatMessageTime = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();

    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (sameDay) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const sameYesterday =
      date.getFullYear() ===
        yesterday.getFullYear() &&
      date.getMonth() ===
        yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    if (sameYesterday) return "Yesterday";

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/* =============================================================
   ChatRoom
   - Reuses the existing singleton socket
     (joinRoom/leaveRoom/sendMessage/receiveMessage)
     — no new socket connection is created.
   - Additive optional props keep StudyRoom.jsx behaviour
     identical when they are not supplied.
   ============================================================= */
function ChatRoom({
  roomId,
  /* Messages-page only (all optional / backward compatible) */
  title,
  subtitle,
  backAction,
  onMessageReceived,
  allowFiles = false,
  fillHeight = false,
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("skillup_user") || "null"
  );

  const currentUserId =
    currentUser?.id || currentUser?._id;

  const token = localStorage.getItem("token");

  const messagesEndRef = useRef(null);

  /* Keep the latest parent callback without re-subscribing
     the socket effect on every parent re-render (e.g.
     while typing in the conversation search box). */
  const onMessageReceivedRef = useRef(
    onMessageReceived
  );
  onMessageReceivedRef.current =
    onMessageReceived;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  /* ==========================================
     LOAD EXISTING MESSAGES
     ========================================== */
  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/messages/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(
          response.data.messages || []
        );
      } catch (error) {
        console.error(
          "Message Load Error:",
          error.response?.data ||
            error.message
        );

        setError(
          "Unable to load messages."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [roomId]);

  /* Auto-scroll when messages change */
  useEffect(() => {
    if (!loading && messages.length) {
      const t = setTimeout(scrollToBottom, 40);
      return () => clearTimeout(t);
    }
  }, [messages, loading]);

  /* ==========================================
     SOCKET ROOM + REAL-TIME LISTENER
     (reuses the existing singleton socket —
      effect re-runs ONLY when roomId changes)
     ========================================== */
  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (newMessage) => {
      /* Safety: only accept messages
         belonging to this room */
      if (
        String(newMessage.roomId) !==
        String(roomId)
      ) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            String(msg._id) ===
            String(newMessage._id)
        );

        if (exists) return prev;

        return [
          ...prev,
          newMessage,
        ];
      });

      /* Inform the parent (Messages page) so the
         conversation list preview can update.
         Uses a ref so we never re-subscribe the
         socket listener. */
      if (
        typeof onMessageReceivedRef.current ===
        "function"
      ) {
        onMessageReceivedRef.current(
          roomId,
          newMessage
        );
      }
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.emit(
        "leaveRoom",
        roomId
      );

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [roomId]);

  /* ==========================================
     SEND MESSAGE (text or file)
     ========================================== */
  const sendMessage = async () => {
    const trimmed = message.trim();

    if (!roomId || !currentUserId) return;

    /* ---- File message ---- */
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("roomId", roomId);

        const uploadRes = await axios.post(
          `${API_URL}/api/files/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        const uploaded =
          uploadRes?.data?.file;

        if (!uploaded) {
          throw new Error(
            "File upload failed"
          );
        }

        socket.emit("sendMessage", {
          roomId,
          sender: currentUserId,
          message: trimmed || "",
          fileUrl: uploaded.fileUrl || "",
          fileName:
            uploaded.fileName ||
            selectedFile.name,
          fileType:
            uploaded.fileType ||
            selectedFile.type,
        });

        setMessage("");
        setSelectedFile(null);
      } catch (err) {
        console.error(
          "File upload error:",
          err
        );
        setError("Unable to send file.");
      } finally {
        setUploading(false);
      }
      return;
    }

    /* ---- Text message ---- */
    if (!trimmed) return;

    setSending(true);

    socket.emit("sendMessage", {
      roomId,
      sender: currentUserId,
      message: trimmed,
    });

    setMessage("");

    setSending(false);
  };

  /* ==========================================
     ENTER KEY
     ========================================== */
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* ==========================================
     NO ROOM
     ========================================== */
  if (!roomId) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#26262F] bg-[#111116] p-8 text-center",
          fillHeight &&
            "flex h-full flex-col items-center justify-center"
        )}
      >
        <MessageCircle
          size={30}
          className="text-[#E76F51]"
        />
        <p className="mt-3 text-gray-400">
          {title
            ? "Select a conversation to start chatting."
            : "Select a study room to open chat."}
        </p>
      </div>
    );
  }

  /* ==========================================
     LAYOUT CLASSES
     ========================================== */
  const rootClass = fillHeight
    ? "flex h-full flex-col"
    : "space-y-5";

  const messagesClass = fillHeight
    ? "flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#26262F] bg-[#111116] p-4"
    : "h-[420px] overflow-y-auto rounded-2xl border border-[#26262F] bg-[#0F0F14] p-5";

  return (
    <div className={rootClass}>
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-[#26262F] px-6 py-5">
        {backAction && (
          <button
            type="button"
            onClick={backAction}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] text-gray-400 transition hover:border-[#E76F51] hover:text-[#E76F51]"
            aria-label="Back to conversations"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E76F51]/10 text-[#E76F51]">
            <MessageCircle size={21} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">
            {title || "Study Room Chat"}
          </h3>
          <p className="truncate text-xs text-gray-500">
            {subtitle || `Room: ${roomId}`}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* MESSAGES */}
      <div ref={messagesEndRef} className={messagesClass}>
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle
              size={30}
              className="text-gray-600"
            />
            <p className="mt-3 text-gray-400">
              No messages yet
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Start the conversation with
              your study partners.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const senderId =
                msg.sender?._id ||
                msg.sender?.id ||
                msg.sender;

              const isMine =
                String(senderId) ===
                String(currentUserId);

              const time =
                formatMessageTime(
                  msg.createdAt || msg.timestamp
                );

              const hasFile =
                msg.fileUrl || msg.fileName;

              return (
                <div
                  key={msg._id || index}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isMine
                        ? "bg-[#E76F51] text-white"
                        : "border border-[#26262F] bg-[#17171E] text-gray-200"
                    }`}
                  >
                    {!isMine && (
                      <p className="mb-1 text-xs font-semibold text-[#E76F51]">
                        {msg.sender?.name ||
                          "Student"}
                      </p>
                    )}

                    {msg.message && (
                      <p className="break-words">
                        {msg.message}
                      </p>
                    )}

                    {hasFile && (
                      <div className="mt-2 rounded-lg border border-[#26262F] bg-[#111116]/60 p-2.5">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={16}
                            className="text-[#E76F51]"
                          />
                          <span
                            className={`truncate text-xs ${
                              isMine
                                ? "text-white/80"
                                : "text-gray-300"
                            }`}
                            title={msg.fileName}
                          >
                            {msg.fileName ||
                              "Attachment"}
                          </span>
                        </div>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-1 block text-xs underline ${
                            isMine
                              ? "text-white/80"
                              : "text-[#E76F51]"
                          }`}
                        >
                          Open / Download
                        </a>
                      </div>
                    )}

                    {time && (
                      <span
                        className={`mt-1 block text-[10px] ${
                          isMine
                            ? "text-white/60"
                            : "text-gray-500"
                        }`}
                      >
                        {time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t border-[#26262F] bg-[#15151B] p-4">
        {(selectedFile || uploading) && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-[#26262F] bg-[#111116] px-3 py-2">
            {uploading ? (
              <Loader2
                size={16}
                className="animate-spin text-[#E76F51]"
              />
            ) : (
              <FileText
                size={16}
                className="text-[#E76F51]"
              />
            )}
            <span className="min-w-0 text-xs text-gray-300">
              {uploading
                ? "Uploading…"
                : selectedFile?.name}
            </span>
            {!uploading && (
              <button
                type="button"
                onClick={() =>
                  setSelectedFile(null)
                }
                className="ml-auto text-xs text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="flex items-end gap-3">
          {allowFiles && (
            <label
              className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] text-gray-400 transition hover:border-[#E76F51] hover:text-[#E76F51] ${
                uploading
                  ? "cursor-wait opacity-60"
                  : ""
              }`}
              aria-label="Attach file"
            >
              <input
                type="file"
                accept="application/pdf"
                disabled={uploading}
                className="hidden"
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files?.[0] || null
                  )
                }
              />
              <Paperclip size={17} />
            </label>
          )}

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={sending || uploading}
            placeholder="Type your message..."
            rows={1}
            className="min-h-[40px] flex-1 resize-none rounded-xl border border-[#26262F] bg-[#111116] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#E76F51]"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              sending ||
              uploading ||
              (!selectedFile &&
                !message.trim())
            }
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E76F51] px-5 font-medium text-white transition hover:bg-[#d65f43] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending || uploading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}
            <span className="hidden sm:block">
              {sending || uploading
                ? "Sending…"
                : "Send"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   tiny local classnames helper
   ============================================================= */
function cn(...inputs) {
  return inputs
    .filter(
      (input) =>
        typeof input === "string" &&
        input.trim() !== ""
    )
    .join(" ");
}

export default ChatRoom;
