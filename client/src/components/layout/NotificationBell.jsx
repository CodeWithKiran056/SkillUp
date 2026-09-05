import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  DoorOpen,
  Inbox,
  Loader2,
  MessageCircle,
  Plus,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { API_URL } from "../../config/api";
import { getToken } from "../../utils/auth";
import socket from "../../socket/socket";
import { Button } from "../ui";
import { cn } from "../../lib/utils";

/* =============================================================
   NotificationBell
   - Real, persistent, user-specific notifications.
   - Identity comes from the JWT (token) on both the REST API
     and the socket registration; a userId is never sent.
   - Real-time via the existing Socket.IO connection using the
     same register-notification pattern as registerDmUser.
   ============================================================= */

const NOTIFICATION_LINKS = {
  connection_request: "/find-partner",
  connection_accepted: "/find-partner",
  message: null, // resolved below from relatedType
  study_room_join_request: "/study-room",
  study_room_join_accepted: "/study-room",
  study_room_join_rejected: "/study-room",
  study_room_member_joined: "/study-room",
  study_room_deleted: "/study-room",
  study_session: "/mysessions",
  account: null,
  system: null,
};

const NOTIFICATION_ICONS = {
  connection_request: UserPlus,
  connection_accepted: UserCheck,
  message: MessageCircle,
  study_room_join_request: DoorOpen,
  study_room_join_accepted: CheckCircle,
  study_room_join_rejected: XCircle,
  study_room_member_joined: Users,
  study_room_deleted: DoorOpen,
  study_session: Plus,
  account: ShieldAlert,
  system: ShieldAlert,
};

const formatRelativeTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getNotificationLink = (notification) => {
  if (notification.type === "message") {
    return notification.relatedType === "room"
      ? "/study-room"
      : "/messages";
  }

  return NOTIFICATION_LINKS[notification.type] || null;
};

function NotificationBell() {
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingIds, setMarkingIds] = useState({});
  const [markingAll, setMarkingAll] = useState(false);

  const token = getToken();

  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUnreadCount(response.data?.unreadCount || 0);
    } catch {
      // Non-fatal: badge refreshes on next fetch/open.
    }
  };

  const fetchNotifications = async (silent = false) => {
    if (!token) return;

    if (!silent) setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(response.data?.notifications || []);

      if (!silent) {
        const all = response.data?.notifications || [];
        setUnreadCount(all.filter((item) => !item.read).length);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /* Register for real-time delivery on the existing shared
     Socket.IO connection (JWT-authenticated). */
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    if (token) {
      socket.emit("registerNotificationUser", { token });
    }

    const handleNew = ({ notification }) => {
      if (!notification) return;

      setNotifications((prev) => {
        if (prev.some((item) => item._id === notification._id)) {
          return prev;
        }

        return [notification, ...prev].slice(0, 50);
      });

      if (!notification.read) {
        setUnreadCount((count) => count + 1);
      }
    };

    const handleUnread = ({ unreadCount }) => {
      setUnreadCount(unreadCount ?? 0);
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:unread", handleUnread);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:unread", handleUnread);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Close on outside click / Escape. */
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const markAsRead = async (notification) => {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, read: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    }

    // Already-read notifications skip the API call entirely
    // (both for correctness and to avoid unnecessary requests).
    if (notification.read) return;

    setMarkingIds((prev) => ({
      ...prev,
      [notification._id]: true,
    }));

    try {
      await axios.patch(
        `${API_URL}/api/notifications/${notification._id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      // Revert the optimistic update on failure.
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, read: false }
            : item
        )
      );

      setUnreadCount((count) => count + 1);
    } finally {
      setMarkingIds((prev) => {
        const next = { ...prev };
        delete next[notification._id];
        return next;
      });
    }
  };

  const handleClickNotification = (notification) => {
    const link = getNotificationLink(notification);

    markAsRead(notification);

    if (link) {
      navigate(link);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);

    try {
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch {
      setError("Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const badgeLabel =
    unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ""
        }`}
        className="relative"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);

          if (nextOpen) {
            fetchNotifications(true);
            fetchUnreadCount();
          }
        }}
        size="icon"
        variant="secondary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--error)] px-1 text-[10px] font-semibold leading-none text-white">
            {badgeLabel}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,26rem)] overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Notifications
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                size="sm"
                variant="ghost"
                disabled={markingAll}
              >
                {markingAll ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark all read
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[min(70vh,30rem)] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[var(--text-secondary)]">
                <Loader2
                  size={16}
                  className="animate-spin text-[var(--accent)]"
                />
                Loading...
              </div>
            )}

            {!loading && error && notifications.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                    <Inbox size={21} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                    You're all caught up
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                    New notifications about your study activity will
                    appear here.
                  </p>
                </div>
              )}
{!loading &&
              notifications.map((notification) => {
                const Icon =
                  NOTIFICATION_ICONS[notification.type] || Bell;
                const link = getNotificationLink(notification);

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleClickNotification(notification)
                    }
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-[var(--border-subtle)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]",
                      !notification.read && "bg-[var(--surface-1)]"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        notification.read
                          ? "bg-[var(--surface-3)] text-[var(--text-muted)]"
                          : "bg-[var(--accent-muted)] text-[var(--accent)]"
                      )}
                    >
                      {markingIds[notification._id] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Icon size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          notification.read
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-primary)]"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {formatRelativeTime(notification.createdAt)}
                        {link ? " · Tap to open" : ""}
                      </p>
                    </div>

                    {!notification.read && (
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border-subtle)] px-4 py-2">
            <Button
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                navigate("/messages");
              }}
              variant="ghost"
              size="sm"
            >
              <MessageCircle size={14} />
              Go to Messages
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;