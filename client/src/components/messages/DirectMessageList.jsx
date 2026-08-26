import { Search, User } from "lucide-react";
import { API_URL } from "../../config/api";

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

/* =============================================================
   DirectMessageList
   - Renders REAL direct-message conversations returned by
     GET /api/conversations (partner name/image/role +
     lastMessage/lastMessageAt). No fake online status or
     unread counts.
   ============================================================= */
function DirectMessageList({
  conversations,
  selectedConversationId,
  onSelect,
}) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-[#26262F] bg-[#15151B]">
      <div className="border-b border-[#26262F] p-5">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[#E76F51]" />
          <h2 className="text-xl font-bold text-white">
            Direct Messages
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your connected study partners.
        </p>
      </div>

      {(conversations || []).length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            No direct messages yet.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Connect with a partner in Find Partner,
            then use Message.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#26262F]">
          {conversations.map((conversation) => {
            const isSelected =
              selectedConversationId ===
              conversation.conversationId;

            const lastTime = formatLastTime(
              conversation.lastMessageAt
            );

            return (
              <li key={conversation.conversationId}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                    isSelected
                      ? "bg-[#E76F51]/10"
                      : "hover:bg-[#111116]"
                  }`}
                >
                  {conversation.partner?.profileImage ? (
                    <img
                      src={
                        conversation.partner.profileImage.startsWith(
                          "http"
                        )
                          ? conversation.partner.profileImage
                          : `${API_URL}${conversation.partner.profileImage}`
                      }
                      alt={conversation.partner.name}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] font-semibold text-[#E76F51]">
                      {(
                        conversation.partner?.name || "S"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {conversation.partner?.name}
                      </p>
                      {lastTime && (
                        <span className="shrink-0 text-[11px] text-gray-500">
                          {lastTime}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs capitalize text-gray-500">
                      {conversation.partner?.role}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {conversation.lastMessage ||
                        "No messages yet."}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default DirectMessageList;
