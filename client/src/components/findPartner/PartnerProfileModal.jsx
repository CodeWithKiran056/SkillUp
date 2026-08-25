import {
  X,
  MessageCircle,
  UserPlus,
  Clock,
  Check,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

function PartnerProfileModal({ partner, isOpen, onClose }) {
  const navigate = useNavigate();

  // Same real connection states as PartnerCard
  const [connectionStatus, setConnectionStatus] = useState(
    partner?.connectionStatus || "none"
  );
  const [sending, setSending] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    setConnectionStatus(partner?.connectionStatus || "none");
    setConnectError("");
  }, [partner?.connectionStatus, partner?.id]);

  const handleConnect = async () => {
    if (sending || connectionStatus !== "none" || !partner?.id) return;

    setConnectError("");
    setSending(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/users/connect/${partner.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionStatus("pending");
    } catch (err) {
      console.error(
        "Send Connection Request Error:",
        err.response?.data || err.message
      );
      setConnectError(
        err.response?.data?.message ||
          "Unable to send request. Try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#26262F] bg-[#15151B]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26262F] px-6 py-5">
          <h2 className="text-2xl font-bold">
            Student Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#26262F] p-2 transition hover:border-[#E76F51]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">

          {/* Profile */}
          <div className="flex flex-col gap-8 md:flex-row">

            {partner.image ? (
              <img
                src={partner.image}
                alt={partner.name}
                className="h-40 w-40 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-[#26262F] bg-[#111116] text-6xl font-semibold text-[#E76F51]">
                {(partner.name || "S").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">

              <h2 className="text-3xl font-bold">
                {partner.name}
              </h2>

              <p className="mt-2 text-gray-400">
                {partner.course}
              </p>

              {partner.reasons && partner.reasons.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {partner.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-md bg-[#E76F51]/10 px-2.5 py-1 text-xs font-medium text-[#E76F51]"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-xl border border-[#26262F] bg-[#111116] p-4 text-center">
                <span className="text-2xl font-bold text-[#E76F51]">
                  {partner.match}%
                </span>
                <span className="ml-2 text-sm text-gray-400">
                  Compatibility
                </span>
              </div>

            </div>

          </div>

          {/* Skills */}
          {partner.skills && partner.skills.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-semibold">
                {partner.skillLabel || "Common Skills"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {partner.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-[#26262F] bg-[#111116] px-4 py-2 text-sm text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {partner.commonInterests && partner.commonInterests.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-semibold">
                Shared Interests
              </h3>
              <div className="flex flex-wrap gap-3">
                {partner.commonInterests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-lg border border-[#26262F] bg-[#111116] px-4 py-2 text-sm text-gray-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning requirements */}
          {partner.commonRequirements && partner.commonRequirements.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-semibold">
                Similar Learning Goals
              </h3>
              <div className="flex flex-wrap gap-3">
                {partner.commonRequirements.map((requirement) => (
                  <span
                    key={requirement}
                    className="rounded-lg border border-[#26262F] bg-[#111116] px-4 py-2 text-sm text-gray-300"
                  >
                    {requirement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 grid grid-cols-2 gap-4">

            {connectionStatus === "connected" ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/messages?userId=${partner.id}`
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] py-4 transition hover:border-[#E76F51]"
              >
                <MessageCircle size={18} />
                Message
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Connect first to send direct messages"
                className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] py-4 text-gray-500"
              >
                <MessageCircle size={18} />
                Connect first
              </button>
            )}

            <button
              type="button"
              onClick={handleConnect}
              disabled={sending || connectionStatus !== "none"}
              className={connectButtonClass()}
            >
              {connectButtonContent()}
            </button>

          </div>

          {connectError && (
            <p className="mt-3 text-center text-sm text-red-400">
              {connectError}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default PartnerProfileModal;
