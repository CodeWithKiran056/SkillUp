import {
  Brain,
  Users,
  Video,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Smart Study Matching",
    description:
      "Find compatible study partners based on subjects, availability, and learning preferences.",
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description:
      "Create study groups, discuss concepts, and learn together in a structured environment.",
  },
  {
    icon: Video,
    title: "Real-Time Study Rooms",
    description:
      "Join focused study sessions with chat and collaboration tools in one workspace.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Keep track of your study sessions, learning goals, and overall progress from one dashboard.",
  },
];

function WhyChoose() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      {/* Heading */}
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          Why Choose SkillUp
        </span>

        <h2 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
          Everything You Need
          <br />
          To Study Smarter
        </h2>

        <p className="mt-6 text-lg leading-8 text-gray-400">
          SkillUp brings together study partner matching, collaborative
          learning, progress tracking, and personalized recommendations in one
          simple platform.
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-2xl border border-[#26262F] bg-[#15151B] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#E76F51]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E76F51]/10">
              <Icon size={26} className="text-[#E76F51]" />
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              {title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              {description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default WhyChoose;