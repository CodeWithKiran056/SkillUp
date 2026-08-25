import { Search, MessageCircle, Users } from "lucide-react";

const formatLastTime = (dateString) => {
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
    const isYesterday =
      date.getFullYear() ===
        yesterday.getFullYear() &&
      date.getMonth() ===
        yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const getInitial = (name) =>
  (name?.charAt(0) || "S").toUpperCase();

/* =============================================================
   ConversationList
   - Renders the study rooms the current user participates in
     as the message "conversations".
   - Pure / presentational: Messages.jsx owns rooms + last
     message cache.
   ============================================================= */
function ConversationList({
  rooms,
  selectedRoomId,
  onSelect,
  search,
  onSearchChange,
  lastMessages,
}) {
  const filtered = (rooms || []).filter((room) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();
    return (
      (room.name || "")
        .toLowerCase()
        .includes(q) ||
      (room.subject || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-[#26262F] bg-[#15151B]">
      {/* Header / search */}
      <div className="border-b border-[#26262F] p-5">
        <div className="mb-1 flex items-center gap-2">
          <MessageCircle
            size={18}
            className="text-[#E76F51]"
          />
          <h2 className="text-xl font-bold text-white">
            Conversations
          </h2>
        </div>
        <div className="relative mt-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-[#26262F] bg-[#111116] pl-10 pr-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#E76F51]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <Users
              size={30}
              className="text-gray-600"
            />
            <p className="mt-3 text-sm text-gray-400">
              No conversations found.
            </p>
            {search && (
              <p className="mt-1 text-xs text-gray-600">
                Try adjusting your search.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[#26262F]">
            {filtered.map((room) => {
              const roomId = room.roomId;
              const isSelected =
                selectedRoomId === roomId;
              const last = lastMessages?.[roomId];
              const lastText =
                last?.message && last.message.trim()
                  ? last.message
                  : room.subject ||
                    "A collaborative study room.";
              const lastTime = formatLastTime(
                last?.createdAt || room.updatedAt
              );

              return (
                <li key={room._id || roomId}>
                  <button
                    type="button"
                    onClick={() => onSelect(room)}
                    className={`w-full text-left transition ${
                      isSelected
                        ? "bg-[#111116]"
                        : "hover:bg-[#111116]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 px-5 py-4">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E76F51]/10 text-[#E76F51] font-semibold">
                        {getInitial(room.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={`truncate text-sm font-semibold ${
                              isSelected
                                ? "text-white"
                                : "text-gray-300"
                            }`}
                          >
                            {room.name}
                          </span>
                          {lastTime && (
                            <span className="shrink-0 text-xs text-gray-600">
                              {lastTime}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1">
                          <Users
                            size={11}
                            className="text-gray-600"
                          />
                          <span className="truncate text-xs text-gray-600">
                            {room.subject}
                          </span>
                        </div>

                        <p
                          className={`mt-0.5 truncate text-xs ${
                            isSelected
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {lastText}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-[#26262F] px-5 py-3">
        <p className="text-xs text-gray-600">
          <span className="font-medium text-gray-400">
            {rooms?.length || 0}
          </span>{" "}
          study room
          {rooms?.length === 1 ? "" : "s"} •{" "}
          <span
            className="cursor-pointer text-[#E76F51] underline"
            onClick={() => {}}
          >
            Manage in Study Rooms
          </span>
        </p>
      </div>
    </aside>
  );
}

export default ConversationList;
