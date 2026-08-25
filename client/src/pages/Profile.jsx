import DashboardBackground from "../components/dashboard/DashboardBackground";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import ProfileForm from "../components/settings/ProfileForm";

import {
  BookOpen,
  Users,
  Trophy,
  Target,
} from "lucide-react";

function Profile() {
  return (
    <div className="flex min-h-screen bg-[#0B0B0F] text-white">
      <DashboardBackground />

      <Sidebar />

      <main className="flex h-screen flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-8 pb-8">

          {/* Header */}

          <section className="border-b border-[#26262F] py-8">

            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
              Profile
            </span>

            <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
              Manage Your Profile
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">
              Update your personal information, showcase your skills,
              and keep your profile ready for study partners.
            </p>

          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[2fr_380px]">

            {/* Left */}

            <ProfileForm />

            {/* Right */}

            <div className="space-y-6">

              {/* Quick Stats */}

              <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">

                <h2 className="text-xl font-semibold">
                  Quick Stats
                </h2>

                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between rounded-xl border border-[#26262F] bg-[#111116] p-4">

                    <div className="flex items-center gap-3">

                      <BookOpen
                        size={20}
                        className="text-[#E76F51]"
                      />

                      <span className="text-gray-300">
                        Study Hours
                      </span>

                    </div>

                    <span className="font-semibold">
                      124 hrs
                    </span>

                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#26262F] bg-[#111116] p-4">

                    <div className="flex items-center gap-3">

                      <Users
                        size={20}
                        className="text-[#E76F51]"
                      />

                      <span className="text-gray-300">
                        Study Partners
                      </span>

                    </div>

                    <span className="font-semibold">
                      18
                    </span>

                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#26262F] bg-[#111116] p-4">

                    <div className="flex items-center gap-3">

                      <Target
                        size={20}
                        className="text-[#E76F51]"
                      />

                      <span className="text-gray-300">
                        Sessions
                      </span>

                    </div>

                    <span className="font-semibold">
                      36
                    </span>

                  </div>

                </div>

              </div>

              {/* Skills */}

              <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">

                <h2 className="text-xl font-semibold">
                  Skills
                </h2>

                <div className="mt-6 flex flex-wrap gap-3">

                  {[
                    "React",
                    "JavaScript",
                    "Python",
                    "AI",
                    "Tailwind",
                    "Node.js",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#26262F] bg-[#111116] px-4 py-2 text-sm"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              </div>

              {/* Achievements */}

              <div className="rounded-2xl border border-[#26262F] bg-[#15151B] p-6">

                <div className="flex items-center gap-3">

                  <Trophy
                    size={22}
                    className="text-[#E76F51]"
                  />

                  <h2 className="text-xl font-semibold">
                    Achievements
                  </h2>

                </div>

                <div className="mt-6 space-y-3">

                  {[
                    "100+ Study Hours",
                    "Top Collaborator",
                    "10 Successful Sessions",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#26262F] bg-[#111116] p-4"
                    >
                      {item}
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Profile;