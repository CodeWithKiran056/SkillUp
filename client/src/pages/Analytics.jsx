import {
  Clock,
  Flame,
  Brain,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";


import StatsCards from "../components/dashboard/StatsCards";
import ProgressChart from "../components/dashboard/ProgressChart";

import { API_URL } from "../config/api";

function Analytics() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("skillup_user") || "null"
  );

  const currentUserId =
    currentUser?.id || currentUser?._id || "";

  const fetchRooms = async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/rooms?scope=mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRooms(response.data?.rooms || []);
    } catch (err) {
      console.error(
        "Fetch Rooms Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load study sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  /*
   * Real Sessions Joined count from room membership.
   * A room counts when the current user exists in room.members.
   * (Creators are auto-added to members, so they count too.)
   */
  const sessionsJoined = useMemo(
    () =>
      rooms.filter((room) => {
        const members = Array.isArray(room.members)
          ? room.members
          : [];

        return members.some(
          (member) =>
            String(
              member?._id ||
                member?.id ||
                member
            ) === String(currentUserId)
        );
      }).length,
    [rooms, currentUserId]
  );

  /*
   * Real Sessions Created count from room.createdBy.
   * Handles room.createdBy._id, room.createdBy.id, or room.createdBy string/object.
   */
  const sessionsCreated = useMemo(
    () =>
      rooms.filter((room) => {
        const createdBy =
          room?.createdBy?._id ||
          room?.createdBy?.id ||
          room?.createdBy;

        return (
          Boolean(currentUserId) &&
          Boolean(createdBy) &&
          String(createdBy) === String(currentUserId)
        );
      }).length,
    [rooms, currentUserId]
  );

  /*
   * Real Pending Requests count from room.pendingRequests.
   * A room counts when the current user's ID exists inside room.pendingRequests.
   * Handles pendingRequest._id, pendingRequest.id, or pendingRequest string/object.
   */
  const pendingRequests = useMemo(
    () =>
      rooms.filter((room) => {
        const requests = Array.isArray(room.pendingRequests)
          ? room.pendingRequests
          : [];

        return requests.some((req) => {
          const reqId =
            req?._id ||
            req?.id ||
            req;

          return (
            Boolean(currentUserId) &&
            Boolean(reqId) &&
            String(reqId) === String(currentUserId)
          );
        });
      }).length,
    [rooms, currentUserId]
  );

  /*
   * Real unique Study Partners count from room membership.
   * Considers only rooms where the current user is a member, collects the
   * other members' IDs, excludes the current user, and counts each partner once.
   */
  const studyPartners = useMemo(() => {
    const partnerIds = new Set();

    rooms.forEach((room) => {
      const members = Array.isArray(room.members)
        ? room.members
        : [];

      const memberIds = members
        .map((member) => member?._id || member?.id || member)
        .filter((id) => Boolean(id) && String(id) !== "undefined");

      const isMember = memberIds.some(
        (id) => String(id) === String(currentUserId)
      );

      if (!isMember) return;

      memberIds.forEach((id) => {
        if (String(id) === String(currentUserId)) return;
        partnerIds.add(String(id));
      });
    });

    return partnerIds.size;
  }, [rooms, currentUserId]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#26262F] bg-[#15151B]">
          <div
            className="animate-spin rounded-full border-2 border-[#E76F51] border-t-transparent"
            style={{ width: 26, height: 26 }}
          />
        </div>
        <p className="text-sm text-gray-400">
          Loading your study progress...
        </p>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5">
          <svg
            className="h-7 w-7 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-9 2.277A9 9 0 1112 15a9 9 0 01-3 0"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Couldn't load study progress
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRooms}
          className="flex items-center gap-2 rounded-xl bg-[#E76F51] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#d65f43]"
        >
          Retry
        </button>
      </div>
    );
  }

  /*
   * Existing UI continues below (unchanged)
   */
  const analytics = [
    {
      title: "Study Hours",
      value: "N/A",
      description: "Coming Soon",
      icon: Clock,
      color: "text-[#E76F51]",
    },
    {
      title: "Study Streak",
      value: "N/A",
      description: "Coming Soon",
      icon: Flame,
      color: "text-green-400",
    },
    {
      title: "AI Learning Score",
      value: "N/A",
      description: "Coming Soon",
      icon: Brain,
      color: "text-blue-400",
    },
  ];





  return (

    <>





          {/* Header */}


          <section className="pt-8">


            <div className="flex items-center gap-3">


              <TrendingUp

                className="text-[#E76F51]"

              />


              <h1 className="text-5xl font-black tracking-tight">

                Analytics

              </h1>


            </div>




            <p className="mt-3 text-lg text-gray-400">

              Track your learning performance, growth and achievements.

            </p>



          </section>








          {/* Stats */}



          <section className="mt-10">


            <StatsCards
              sessionsJoined={sessionsJoined}
              sessionsCreated={sessionsCreated}
              pendingRequests={pendingRequests}
              studyPartners={studyPartners}
            />


          </section>








          {/* Progress */}



          <section className="mt-10">


            <ProgressChart />


          </section>








          {/* Analytics Cards */}



          <section className="mt-10 grid gap-6 lg:grid-cols-3 pb-10">





            {
              analytics.map((item)=>{


                const Icon = item.icon;



                return (


                  <div

                    key={item.title}

                    className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6 transition hover:-translate-y-1 hover:border-[#E76F51]"

                  >


                    <div className="flex items-center justify-between">


                      <h2 className="text-xl font-semibold">

                        {item.title}

                      </h2>



                      <Icon

                        size={24}

                        className={item.color}

                      />


                    </div>




                    <p

                      className={`mt-6 text-4xl font-bold ${item.color}`}

                    >

                      {item.value}


                    </p>




                    <p className="mt-2 text-gray-400">


                      {item.description}


                    </p>



                  </div>


                );


              })

            }



          </section>








          {/* Growth Section */}



          <section className="grid gap-6 lg:grid-cols-2 pb-10">





            <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">


              <div className="flex items-center gap-3">


                <Target

                  className="text-[#E76F51]"

                />


                <h2 className="text-xl font-semibold">

                  Learning Goals

                </h2>


              </div>




              <p className="mt-5 text-gray-400 leading-7">

                Learning goals data is not available yet.

              </p>


            </div>







            <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">


              <div className="flex items-center gap-3">


                <Award

                  className="text-yellow-400"

                />


                <h2 className="text-xl font-semibold">

                  Achievements

                </h2>


              </div>




              <p className="mt-5 text-gray-400 leading-7">

                Achievements will appear here as you complete learning milestones.

              </p>


            </div>



          </section>





    </>

  );

}


export default Analytics;
