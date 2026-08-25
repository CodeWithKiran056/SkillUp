import {
  Heart,
  MessageCircle,
  UserPlus,
  Clock,
  Check,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

function PartnerCard({
  partner,
  onViewProfile,
  isFavorite,
  onToggleFavorite,
}) {

  const navigate = useNavigate();

  // Local state for optimistic UI update,
  // re-synced when the parent updates partner.connectionStatus
  // (e.g. after a pending request is accepted).
  const [connectionStatus, setConnectionStatus] = useState(
    partner.connectionStatus || "none"
  );
  const [sending, setSending] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    setConnectionStatus(partner.connectionStatus || "none");
  }, [partner.connectionStatus]);

  const handleConnect = async () => {
    if (sending || connectionStatus !== "none") return;

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
      const msg =
        err.response?.data?.message || "Unable to send request. Try again.";
      setConnectError(msg);
    } finally {
      setSending(false);
    }
  };

  // Button appearance based on status
  const connectButtonContent = () => {
    if (sending) {
      return (
        <>
          <Clock size={16} className="animate-spin" />
          Sending...
        </>
      );
    }
    if (connectionStatus === "connected") {
      return (
        <>
          <Check size={18} />
          Connected
        </>
      );
    }
    if (connectionStatus === "pending") {
      return (
        <>
          <Clock size={18} />
          Request Sent
        </>
      );
    }
    return (
      <>
        <UserPlus size={18} />
        Connect
      </>
    );
  };

  const connectButtonClass = () => {
    if (connectionStatus === "connected") {
      return "flex items-center justify-center gap-2 rounded-xl bg-green-500/20 py-3 font-medium text-green-400 border border-green-500/20 cursor-default";
    }
    if (connectionStatus === "pending") {
      return "flex items-center justify-center gap-2 rounded-xl bg-[#E76F51]/20 py-3 font-medium text-[#E76F51] border border-[#E76F51]/20 cursor-default";
    }
    return "flex items-center justify-center gap-2 rounded-xl bg-[#E76F51] py-3 font-medium text-white transition hover:bg-[#d65f43]";
  };


  return (

    <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#E76F51]">



      {/* Header */}


      <div className="flex items-start justify-between">


        <div className="flex items-center gap-4">



          <div className="relative">


            {partner.image ? (

              <img

                src={partner.image}

                alt={partner.name}

                className="h-16 w-16 rounded-2xl object-cover"

              />

            ) : (

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#26262F] bg-[#111116] text-xl font-semibold text-[#E76F51]">

                {(partner.name || "S").charAt(0).toUpperCase()}

              </div>

            )}







          </div>





          <div>


            <h3 className="text-lg font-semibold">

              {partner.name}

            </h3>



            <p className="mt-1 text-sm text-gray-400">

              {partner.course}

            </p>

            {partner.reasons && partner.reasons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {partner.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-md bg-[#E76F51]/10 px-2 py-0.5 text-[11px] font-medium text-[#E76F51]"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}






          </div>



        </div>






        <button

          onClick={() => onToggleFavorite(partner.id)}

          className="rounded-xl border border-[#26262F] p-2 transition hover:border-[#E76F51]"

        >


          <Heart

            size={18}

            className={

              isFavorite

              ? "fill-red-500 text-red-500"

              : "text-gray-400"

            }

          />

        </button>



      </div>







      {/* Compatibility */}



      <div className="mt-6">


        <div className="mb-2 flex items-center justify-between text-sm">


          <span className="text-gray-400">

            Compatibility

          </span>



          <span className="font-semibold text-[#E76F51]">

            {partner.match}%

          </span>



        </div>




        <div className="h-2 overflow-hidden rounded-full bg-[#111116]">


          <div

            className="h-full rounded-full bg-[#E76F51]"

            style={{
              width:`${partner.match}%`
            }}

          />


        </div>



      </div>





      {/* Skills */}



      {partner.skillLabel && (

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">

          {partner.skillLabel}

        </p>

      )}



      <div className={`flex flex-wrap gap-2 ${partner.skillLabel ? "mt-3" : "mt-6"}`}>


        {
          partner.skills.map((skill)=>(


            <span

              key={skill}

              className="rounded-lg border border-[#26262F] bg-[#111116] px-3 py-1 text-xs text-gray-300"

            >

              {skill}

            </span>


          ))
        }


      </div>

      {/* Connect error */}
      {connectError && (
        <p className="mt-3 text-xs text-red-400">{connectError}</p>
      )}

      {/* Actions */}



      <div className="mt-6 grid grid-cols-2 gap-3">





        {/* Message — only for CONNECTED partners */}
        {connectionStatus === "connected" ? (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/messages?userId=${partner.id}`
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] py-3 transition hover:border-[#E76F51] hover:text-[#E76F51]"
          >
            <MessageCircle size={18}/>
            Message
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Connect first to send direct messages"
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#26262F] bg-[#111116] py-3 text-gray-500"
          >
            <MessageCircle size={18}/>
            Connect first
          </button>
        )}







        {/* Connect */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={sending || connectionStatus !== "none"}
          className={connectButtonClass()}
        >
          {connectButtonContent()}
        </button>




      </div>





    </div>


  );

}


export default PartnerCard;
