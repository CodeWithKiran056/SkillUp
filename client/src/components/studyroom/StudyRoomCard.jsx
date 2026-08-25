import {
  Video,
  Users,
  Check,
  X,
  Clock,
  Trash2,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

function StudyRoomCard({
  room,
  isCreator,
  isMember,
  isPending,
  joinRequests = [],
  loadingRequests = false,
  onJoin,
  onOpen,
  onRefreshRequests,
  onAccept,
  onReject,
  onDelete,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]">

      {/* Accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--accent-muted)] blur-3xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
            <Video size={20} />
          </div>

          {isCreator && (
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-300">
              Creator
            </span>
          )}

          {!isCreator && isMember && (
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-semibold text-green-400">
              Joined
            </span>
          )}

          {!isCreator &&
            !isMember &&
            isPending && (
              <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold text-yellow-400">
                <Clock size={12} />
                Pending
              </span>
            )}

        </div>

        {/* Room information */}
        <div className="mt-5">

          <h2 className="line-clamp-1 text-lg font-bold text-[var(--text-primary)]">
            {room.name}
          </h2>

          <span className="mt-2 inline-block rounded-full bg-[var(--accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
            {room.subject}
          </span>

          <p className="mt-3 min-h-[42px] text-sm leading-5 text-[var(--text-secondary)]">
            {room.description ||
              "A collaborative study room for focused learning."}
          </p>

        </div>

        {/* Members */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3">

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Users size={16} />
            <span>Members</span>
          </div>

          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {room.members?.length || 0}
          </span>

        </div>

        {/* ======================================
            CREATOR VIEW
        ====================================== */}

        {isCreator && (
          <div className="mt-4">

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Join Requests
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Manage students requesting access.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onRefreshRequests}
                  className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
                  title="Refresh requests"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loadingRequests
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>

              </div>

              {loadingRequests ? (
                <div className="mt-4 text-center text-xs text-[var(--text-muted)]">
                  Loading requests...
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-4 text-center">
                  <p className="text-xs text-[var(--text-muted)]">
                    No pending requests.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">

                  {joinRequests.map((request) => (
                    <div
                      key={
                        request._id ||
                        request.id
                      }
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-sm font-bold text-[var(--accent)]">
                          {(
                            request.name ||
                            "S"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {request.name ||
                              "Student"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                            {request.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                      <div className="mt-3 flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            onAccept(
                              room.roomId,
                              request._id ||
                                request.id
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500/10 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/20"
                        >
                          <Check size={14} />
                          Accept
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onReject(
                              room.roomId,
                              request._id ||
                                request.id
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                        >
                          <X size={14} />
                          Reject
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() =>
                onDelete(room.roomId)
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={15} />
              Delete Room
            </button>

          </div>
        )}

        {/* ======================================
            STUDENT VIEW
        ====================================== */}

        {!isCreator && (
          <div className="mt-5">

            {!isMember && !isPending && (
              <button
                type="button"
                onClick={() =>
                  onJoin(room.roomId)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                <Users size={16} />
                Request to Join
              </button>
            )}

            {isPending && (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 py-3 text-sm font-semibold text-yellow-400">
                <Clock size={16} />
                Request Pending
              </div>
            )}

            {isMember && (
              <>
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 py-3 text-sm font-semibold text-green-400">
                  <Check size={16} />
                  You are a member
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpen(room)
                  }
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                >
                  <MessageCircle size={16} />
                  Open Study Room
                </button>
              </>
            )}

          </div>
        )}

      </div>
    </article>
  );
}

export default StudyRoomCard;