import { useEffect, useState } from "react";
import axios from "axios";
import PartnerCard from "./PartnerCard";
import PartnerProfileModal from "./PartnerProfileModal";
import ConnectionRequests from "./ConnectionRequests";

const API_URL = "http://localhost:5000";

function PartnerGrid({ search, activeFilter }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /* Called after a pending connection request is accepted:
     flip the matching partner (and open profile modal) to "connected". */
  const handleRequestAccepted = (requesterId) => {
    setPartners((prev) =>
      prev.map((partner) =>
        String(partner.id) === String(requesterId)
          ? { ...partner, connectionStatus: "connected" }
          : partner
      )
    );

    setSelectedPartner((prev) =>
      prev && String(prev.id) === String(requesterId)
        ? { ...prev, connectionStatus: "connected" }
        : prev
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/match`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const matches = response.data?.matches || [];

        /* Only real fields returned by GET /api/match.
           No fabricated status / rating / sessions /
           semester / college / avatars. */
        const mapped = matches.map((match) => {
          const commonSkills = match.commonSkills || [];
          const missingSkills =
            match.missingSkills || [];
          const commonInterests =
            match.commonInterests || [];
          const commonRequirements =
            match.commonRequirements || [];
          const partnerCanHelpWith =
            match.partnerCanHelpWith || [];
          const youCanHelpWith =
            match.youCanHelpWith || [];

          /* Honest labeling: never show
             missingSkills as generic "Skills". */
          const skillLabel =
            commonSkills.length > 0
              ? "Common Skills"
              : missingSkills.length > 0
                ? "Skills to Learn"
                : "";

          /* Real match explanation built ONLY from
             actual returned matching data. */
          const reasons = [];
          if (commonSkills.length >= 2) {
            reasons.push("Strong skill overlap");
          } else if (commonSkills.length === 1) {
            reasons.push("Shared skill");
          }
          if (commonInterests.length > 0) {
            reasons.push("Shared interests");
          }
          if (commonRequirements.length > 0) {
            reasons.push("Similar learning goals");
          }
          if (
            partnerCanHelpWith.length > 0 ||
            youCanHelpWith.length > 0
          ) {
            reasons.push("Can help each other learn");
          }

          /* Normalize real profile image URLs only.
             Absolute http(s) URLs are kept unchanged;
             root-relative paths get the API base URL;
             empty stays empty (neutral placeholder). */
          const rawImage = match.profileImage || "";
          const image = /^https?:\/\//.test(rawImage)
            ? rawImage
            : rawImage
              ? `${API_URL}${rawImage}`
              : "";

          return {
            id: match.userId,
            name: match.name || "Student",
            image,
            course:
              match.role === "mentor"
                ? "Mentor"
                : "Student",
            match: match.score,
            skills: commonSkills.length
              ? commonSkills
              : missingSkills,
            skillLabel,
            commonInterests,
            commonRequirements,
            reasons,
            connectionStatus: match.connectionStatus || "none",
          };
        });

        setPartners(mapped);
      } catch (err) {
        console.error("Fetch Matches Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Unable to load study partners.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredPartners = partners.filter((partner) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      partner.name.toLowerCase().includes(searchText) ||
      (partner.course || "").toLowerCase().includes(searchText) ||
      (partner.skills || []).some((skill) =>
        skill.toLowerCase().includes(searchText)
      ) ||
      (partner.commonInterests || []).some((interest) =>
        interest.toLowerCase().includes(searchText)
      );

    const matchesFilter =
      activeFilter === "All" ||
      (partner.skills || []).some((skill) =>
        skill.toLowerCase().includes(activeFilter.toLowerCase())
      ) ||
      (partner.commonInterests || []).some((interest) =>
        interest.toLowerCase().includes(activeFilter.toLowerCase())
      );

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Pending incoming connection requests */}
      <ConnectionRequests onRequestAccepted={handleRequestAccepted} />

      <section>
        <div className="mb-8 flex flex-col gap-4 border-b border-[#26262F] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
              Recommendations
            </span>

            <h2 className="mt-3 text-3xl font-bold">
              Recommended Study Partners
            </h2>

            <p className="mt-2 max-w-2xl text-gray-400">
              Students matched according to your interests and learning goals.
            </p>
          </div>

          <div className="rounded-xl border border-[#26262F] bg-[#15151B] px-4 py-2 text-sm text-gray-400">
            {loading ? "Loading..." : `${filteredPartners.length} Partners Found`}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-[#26262F] bg-[#15151B] p-10 text-center text-gray-400">
            Finding your best study partners...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="rounded-xl border border-[#26262F] bg-[#15151B] p-10 text-center text-gray-400">
            No matching partners found. Try adding skills to your profile.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onViewProfile={() => setSelectedPartner(partner)}
                isFavorite={favorites.includes(partner.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <PartnerProfileModal
        partner={selectedPartner}
        isOpen={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
      />
    </>
  );
}

export default PartnerGrid;