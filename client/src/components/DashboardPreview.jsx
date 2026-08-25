import {
  Brain,
  Calendar,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">

      {/* Heading */}
      <div className="mb-16 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          Dashboard Preview
        </span>

        <h2 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
          Everything You Need
          <br />
          In One Dashboard
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400">
          Track your progress, discover study partners, receive personalized
          recommendations, and stay on top of upcoming sessions from one place.
        </p>
      </div>

      {/* Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-[#26262F] bg-[#15151B] p-8 shadow-xl"
      >
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left */}
          <div className="space-y-6 lg:col-span-2">

            {/* Stats */}
            <div className="grid gap-5 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6 transition-all duration-200 hover:border-[#E76F51]">
                <TrendingUp className="text-[#E76F51]" />

                <h3 className="mt-4 text-3xl font-bold">
                  87%
                </h3>

                <p className="mt-2 text-gray-400">
                  Learning Progress
                </p>
              </div>

              <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6 transition-all duration-200 hover:border-[#E76F51]">
                <Users className="text-[#E76F51]" />

                <h3 className="mt-4 text-3xl font-bold">
                  18
                </h3>

                <p className="mt-2 text-gray-400">
                  Study Partners
                </p>
              </div>

              <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6 transition-all duration-200 hover:border-[#E76F51]">
                <Clock className="text-[#E76F51]" />

                <h3 className="mt-4 text-3xl font-bold">
                  42h
                </h3>

                <p className="mt-2 text-gray-400">
                  Study Hours
                </p>
              </div>

            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Weekly Progress
                </span>

                <span className="font-semibold text-[#E76F51]">
                  75%
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#23232C]">
                <div className="h-full w-3/4 rounded-full bg-[#E76F51]" />
              </div>
            </div>

          </div>

          {/* Right */}
          <div className="space-y-5">

            {/* AI Recommendation */}
            <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6 transition-all duration-200 hover:border-[#E76F51]">
              <Brain className="text-[#E76F51]" />

              <h3 className="mt-4 font-semibold">
                AI Recommendation
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Practice Graph Algorithms with Aman based on your recent learning activity.
              </p>
            </div>

            {/* Upcoming Session */}
            <div className="rounded-2xl border border-[#2B2B35] bg-[#111116] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#E76F51]">
              <Calendar className="text-[#E76F51]" />

              <h3 className="mt-4 font-semibold">
                Upcoming Session
              </h3>

              <p className="mt-3 text-gray-400">
                Tomorrow • 7:30 PM
              </p>

              <p className="mt-2 font-medium">
                Data Structures Revision
              </p>
            </div>

          </div>

        </div>
      </motion.div>

    </section>
  );
}

export default DashboardPreview;
