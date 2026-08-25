import { UserPlus, Brain, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Set up your profile by selecting your subjects, interests, learning style, and availability.",
  },
  {
    icon: Brain,
    title: "Get Smart Recommendations",
    description:
      "SkillUp suggests compatible study partners and relevant learning sessions based on your profile.",
  },
  {
    icon: GraduationCap,
    title: "Learn Together",
    description:
      "Join study rooms, collaborate with classmates, and track your progress from one dashboard.",
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">

      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">
          How It Works
        </span>

        <h2 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
          Get Started
          <br />
          In Three Simple Steps
        </h2>

        <p className="mt-6 text-lg leading-8 text-gray-400">
          Creating your study network takes only a few minutes. Follow these
          simple steps to start learning with other students.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-2xl border border-[#26262F] bg-[#15151B] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#E76F51]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E76F51]/10">
              <Icon size={26} className="text-[#E76F51]" />
            </div>

            <span className="mt-6 inline-block text-sm font-semibold text-[#E76F51]">
              Step 0{index + 1}
            </span>

            <h3 className="mt-3 text-2xl font-semibold">
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

export default HowItWorks;