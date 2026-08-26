import { useEffect, useState } from "react";
import axios from "axios";
import { UserCheck, UserX } from "lucide-react";

import { API_URL } from "../../config/api";

/* Normalize real profile image URLs only (same rule as PartnerGrid). */
const resolveImage = (rawImage) => {
  const raw = rawImage || "";
  if (/^https?:\/\//.test(raw)) return raw;
  return raw ? `${API_URL}${raw}` : "";
};

function ConnectionRequests({ onRequestAccepted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        setActionError("");

        const response = await axios.get(
          `${API_URL}/api/users/connections/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        /* Only real pending requests returned by the API. */
        setRequests(
          (response.data?.requests || []).filter((request) => request?._id)
        );
      } catch (err) {
        console.error(
          "Fetch Connection Requests Error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Unable to load connection requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requesterId) => {
    if (actionInProgressId) return;

    setActionError("");
    setActionInProgressId(requesterId);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/users/connections/${requesterId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      /* Remove from pending list */
      setRequests((prev) =>
        prev.filter(
          (request) => String(request._id) !== String(requesterId)
        )
      );

      /* Notify parent so the matching partner card becomes "connected" */
      if (onRequestAccepted) {
        onRequestAccepted(requesterId);
      }
    } catch (err) {
      console.error(
        "Accept Request Error:",
        err.response?.data || err.message
      );
      setActionError(
        err.response?.data?.message ||
          "Unable to accept request. Try again."
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (requesterId) => {
    if (actionInProgressId) return;

    setActionError("");
    setActionInProgressId(requesterId);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/users/connections/${requesterId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      /* Remove from pending list */
      setRequests((prev) =>
        prev.filter(
          (request) => String(request._id) !== String(requesterId)
        )
      );
    } catch (err) {
      console.error(
        "Reject Request Error:",
        err.response?.data || err.message
      );
      setActionError(
        err.response?.data?.message ||
          "Unable to reject request. Try again."
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <section className="mb-10">
      <div className="mb-6">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          Connections
        </span>

        <h2 className="mt-3 text-2xl font-bold">Pending Requests</h2>

        <p className="mt-2 text-gray-400">
          Students who want to connect with you.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#26262F] bg-[#15151B] p-8 text-center text-gray-400">
          Loading connection requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-[#26262F] bg-[#15151B] p-8 text-center text-gray-400">
          No pending connection requests.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const image = resolveImage(request.profileImage);
            const busy = Boolean(actionInProgressId);

            return (
              <div
                key={request._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#26262F] bg-[#15151B] p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {image ? (
                    <img
                      src={image}
                      alt={request.name}
                      className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#26262F] bg-[#111116] text-lg font-semibold text-[#E76F51]">
                      {(request.name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.name}</p>
                    <p className="truncate text-xs capitalize text-gray-400">
                      {request.role || "student"}
                    </p>
                    {Array.isArray(request.skills) &&
                      request.skills.length > 0 && (
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {request.skills.slice(0, 3).join(", ")}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(request._id)}
                    disabled={busy}
                    title="Accept"
                    className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/30 disabled:opacity-50"
                  >
                    <UserCheck size={14} />
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(request._id)}
                    disabled={busy}
                    title="Reject"
                    className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
                  >
                    <UserX size={14} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ConnectionRequests;

